-- ============================================================================
-- QueueFlow Authoritative Database Schema (PostgreSQL / Supabase)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Status Enums
CREATE TYPE ticket_status AS ENUM (
  'waiting',
  'called',
  'in_service',
  'completed',
  'no_show',
  'cancelled',
  'transferred'
);

CREATE TYPE desk_status AS ENUM (
  'open',
  'paused',
  'closed'
);

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Facilities
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, slug)
);

-- Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code_prefix VARCHAR(5) NOT NULL,
  avg_service_minutes INTEGER NOT NULL DEFAULT 5 CHECK (avg_service_minutes > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Desks
CREATE TABLE desks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  status desk_status NOT NULL DEFAULT 'closed',
  active_staff_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(facility_id, number)
);

-- Desk Supported Services (many-to-many)
CREATE TABLE desk_services (
  desk_id UUID NOT NULL REFERENCES desks(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (desk_id, service_id)
);

-- Tickets (PostgreSQL single source of truth)
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  ticket_number VARCHAR(20) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  status ticket_status NOT NULL DEFAULT 'waiting',
  desk_id UUID REFERENCES desks(id) ON DELETE SET NULL,
  desk_number INTEGER,
  staff_name VARCHAR(255),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  called_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Ensure unique ticket code per facility per day
  UNIQUE(facility_id, created_date, ticket_number)
);

-- Queue Transition Events (Audit Log)
CREATE TABLE queue_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  previous_status ticket_status,
  new_status ticket_status NOT NULL,
  actor_name VARCHAR(255),
  desk_number INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ultra-fast queue resolution
CREATE INDEX idx_tickets_waiting_queue 
  ON tickets(facility_id, service_id, joined_at) 
  WHERE status = 'waiting';

CREATE INDEX idx_tickets_active_desk 
  ON tickets(desk_id, status) 
  WHERE status IN ('called', 'in_service');

CREATE INDEX idx_tickets_lookup 
  ON tickets(id, ticket_number);

-- ============================================================================
-- Atomic CALL_NEXT Stored Procedure (FOR UPDATE SKIP LOCKED)
-- Prevents race conditions when multiple staff members call simultaneously.
-- ============================================================================
CREATE OR REPLACE FUNCTION call_next_ticket(
  p_desk_id UUID,
  p_staff_name TEXT DEFAULT NULL
)
RETURNS SETOF tickets
LANGUAGE plpgsql
AS $$
DECLARE
  v_desk desks%ROWTYPE;
  v_ticket_id UUID;
  v_called_ticket tickets%ROWTYPE;
BEGIN
  -- 1. Fetch and validate desk
  SELECT * INTO v_desk FROM desks WHERE id = p_desk_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Desk % not found', p_desk_id;
  END IF;

  -- 2. Auto-complete any active ticket currently at this desk
  UPDATE tickets
  SET 
    status = 'completed',
    completed_at = NOW()
  WHERE 
    desk_id = p_desk_id 
    AND status IN ('called', 'in_service');

  -- 3. Atomically select the next waiting ticket matching this desk's services
  SELECT t.id INTO v_ticket_id
  FROM tickets t
  JOIN desk_services ds ON ds.service_id = t.service_id
  WHERE 
    ds.desk_id = p_desk_id
    AND t.facility_id = v_desk.facility_id
    AND t.status = 'waiting'
  ORDER BY t.joined_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  -- If no ticket is waiting, return empty
  IF v_ticket_id IS NULL THEN
    RETURN;
  END IF;

  -- 4. Mark ticket as called with desk & staff attribution
  UPDATE tickets
  SET 
    status = 'called',
    desk_id = v_desk.id,
    desk_number = v_desk.number,
    staff_name = COALESCE(p_staff_name, v_desk.active_staff_name),
    called_at = NOW()
  WHERE id = v_ticket_id
  RETURNING * INTO v_called_ticket;

  -- 5. Record queue event
  INSERT INTO queue_events (
    ticket_id,
    event_type,
    previous_status,
    new_status,
    actor_name,
    desk_number
  ) VALUES (
    v_ticket_id,
    'CALL_NEXT',
    'waiting',
    'called',
    COALESCE(p_staff_name, v_desk.active_staff_name),
    v_desk.number
  );

  RETURN NEXT v_called_ticket;
END;
$$;
