-- ============================================================================
-- QueueFlow Multi-Tenant Migration (v2)
-- Run this in your Supabase SQL Editor to enable full multi-organization
-- and multi-facility capabilities with real configuration data.
-- ============================================================================

-- 1. Add slug to facilities if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'facilities' AND column_name = 'slug'
  ) THEN
    ALTER TABLE facilities ADD COLUMN slug VARCHAR(100);
  END IF;
END $$;

-- 2. Populate slug for any existing facilities that lack it
UPDATE facilities 
SET slug = 'central-bursary' 
WHERE slug IS NULL AND name ILIKE '%Bursary%';

UPDATE facilities 
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')) 
WHERE slug IS NULL;

ALTER TABLE facilities ALTER COLUMN slug SET NOT NULL;

-- 3. Ensure unique index on (org_id, slug)
CREATE UNIQUE INDEX IF NOT EXISTS idx_facilities_org_slug ON facilities(org_id, slug);

-- 4. Enable Supabase Realtime on core tables if not already active
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE desks;
ALTER PUBLICATION supabase_realtime ADD TABLE services;

-- ============================================================================
-- 5. Seed Real Authoritative Organizations & Facilities
-- ============================================================================

-- 5A. University of Buea (Academic Demo)
INSERT INTO organizations (id, name, slug, category)
VALUES (
  'debcd2ae-5875-4cef-829e-14583a7f0138',
  'University of Buea',
  'ubuea',
  'Higher Education'
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, category = EXCLUDED.category;

-- Facility 1: Central Bursary
INSERT INTO facilities (id, org_id, name, slug, location, timezone)
VALUES (
  '83acffa3-28fc-419c-ba16-0a293608fc46',
  'debcd2ae-5875-4cef-829e-14583a7f0138',
  'Central Bursary & Student Accounts',
  'central-bursary',
  'Administration Building, Ground Floor, Molyko Campus',
  'Africa/Douala'
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, slug = EXCLUDED.slug, location = EXCLUDED.location;

-- Facility 2: Faculty of Engineering & Technology (FET) Registry
INSERT INTO facilities (id, org_id, name, slug, location, timezone)
VALUES (
  'a201b101-0000-4000-8000-000000000001',
  'debcd2ae-5875-4cef-829e-14583a7f0138',
  'Faculty of Engineering & Technology (FET) Registry',
  'fet-registry',
  'FET Complex, Block A, Second Floor',
  'Africa/Douala'
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, slug = EXCLUDED.slug, location = EXCLUDED.location;

-- Facility 3: University Health Center
INSERT INTO facilities (id, org_id, name, slug, location, timezone)
VALUES (
  'a201b101-0000-4000-8000-000000000002',
  'debcd2ae-5875-4cef-829e-14583a7f0138',
  'University Health Center',
  'health-center',
  'UB Medical Services Campus, Molyko',
  'Africa/Douala'
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, slug = EXCLUDED.slug, location = EXCLUDED.location;

-- 5B. Metropolitan Telecom (Telecommunications Demo)
INSERT INTO organizations (id, name, slug, category)
VALUES (
  'b1010000-0000-4000-8000-000000000001',
  'Metropolitan Telecom',
  'sample-telecom',
  'Telecommunications'
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, category = EXCLUDED.category;

INSERT INTO facilities (id, org_id, name, slug, location, timezone)
VALUES (
  'b2010000-0000-4000-8000-000000000001',
  'b1010000-0000-4000-8000-000000000001',
  'Downtown Customer Service Center',
  'downtown',
  '42 Commercial Avenue, Suite 100',
  'Africa/Douala'
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, slug = EXCLUDED.slug, location = EXCLUDED.location;

-- 5C. St. Jude Community Health (Clinical Demo)
INSERT INTO organizations (id, name, slug, category)
VALUES (
  'c1010000-0000-4000-8000-000000000001',
  'St. Jude Community Health',
  'sample-clinic',
  'Healthcare & Clinical'
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, category = EXCLUDED.category;

INSERT INTO facilities (id, org_id, name, slug, location, timezone)
VALUES (
  'c2010000-0000-4000-8000-000000000001',
  'c1010000-0000-4000-8000-000000000001',
  'Main Outpatient Clinic & Diagnostics',
  'outpatient',
  'Building B, Ground Floor Triage Center',
  'Africa/Douala'
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, slug = EXCLUDED.slug, location = EXCLUDED.location;

-- 5D. Apex Commercial Bank (Banking Demo)
INSERT INTO organizations (id, name, slug, category)
VALUES (
  'd1010000-0000-4000-8000-000000000001',
  'Apex Commercial Bank',
  'sample-bank',
  'Retail Banking'
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, category = EXCLUDED.category;

INSERT INTO facilities (id, org_id, name, slug, location, timezone)
VALUES (
  'd2010000-0000-4000-8000-000000000001',
  'd1010000-0000-4000-8000-000000000001',
  'Corporate Banking Branch',
  'main-hall',
  '15 Financial District Boulevard',
  'Africa/Douala'
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, slug = EXCLUDED.slug, location = EXCLUDED.location;

-- ============================================================================
-- 6. Seed Authoritative Services per Facility
-- ============================================================================

-- Central Bursary Services
INSERT INTO services (id, facility_id, name, code_prefix, avg_service_minutes, is_active)
VALUES
  ('1b1149fa-5673-4d74-9b19-55885b396c13', '83acffa3-28fc-419c-ba16-0a293608fc46', 'Tuition & Fee Payment', 'B', 5, true),
  ('bd0ebfc4-a463-48d9-a899-6f035ff8f173', '83acffa3-28fc-419c-ba16-0a293608fc46', 'Official Transcripts & Certificates', 'T', 10, true),
  ('52bc0cdb-3a37-4dc9-8cad-954584e8936a', '83acffa3-28fc-419c-ba16-0a293608fc46', 'Student ID & Biometrics', 'S', 4, true)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix, avg_service_minutes = EXCLUDED.avg_service_minutes;

-- FET Registry Services
INSERT INTO services (id, facility_id, name, code_prefix, avg_service_minutes, is_active)
VALUES
  ('a3010000-0000-4000-8000-000000000001', 'a201b101-0000-4000-8000-000000000001', 'Course Registration & Attestation', 'R', 5, true),
  ('a3010000-0000-4000-8000-000000000002', 'a201b101-0000-4000-8000-000000000001', 'Academic Advising & Clearance', 'A', 8, true),
  ('a3010000-0000-4000-8000-000000000003', 'a201b101-0000-4000-8000-000000000001', 'Internship & Industrial Placement', 'I', 6, true)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix, avg_service_minutes = EXCLUDED.avg_service_minutes;

-- Health Center Services
INSERT INTO services (id, facility_id, name, code_prefix, avg_service_minutes, is_active)
VALUES
  ('a3020000-0000-4000-8000-000000000001', 'a201b101-0000-4000-8000-000000000002', 'Student Triage & Vital Signs', 'V', 4, true),
  ('a3020000-0000-4000-8000-000000000002', 'a201b101-0000-4000-8000-000000000002', 'General Medical Consultation', 'C', 12, true),
  ('a3020000-0000-4000-8000-000000000003', 'a201b101-0000-4000-8000-000000000002', 'University Dispensary & Pharmacy', 'P', 4, true)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix, avg_service_minutes = EXCLUDED.avg_service_minutes;

-- Telecom Services
INSERT INTO services (id, facility_id, name, code_prefix, avg_service_minutes, is_active)
VALUES
  ('b3010000-0000-4000-8000-000000000001', 'b2010000-0000-4000-8000-000000000001', 'SIM Registration & Replacement', 'S', 5, true),
  ('b3010000-0000-4000-8000-000000000002', 'b2010000-0000-4000-8000-000000000001', 'Postpaid Billing & Cash Desk', 'B', 4, true),
  ('b3010000-0000-4000-8000-000000000003', 'b2010000-0000-4000-8000-000000000001', 'Technical Device & Fiber Support', 'C', 8, true)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix, avg_service_minutes = EXCLUDED.avg_service_minutes;

-- Clinic Services
INSERT INTO services (id, facility_id, name, code_prefix, avg_service_minutes, is_active)
VALUES
  ('c3010000-0000-4000-8000-000000000001', 'c2010000-0000-4000-8000-000000000001', 'General Triage & Vital Signs', 'T', 4, true),
  ('c3010000-0000-4000-8000-000000000002', 'c2010000-0000-4000-8000-000000000001', 'Physician Consultation Room', 'C', 12, true),
  ('c3010000-0000-4000-8000-000000000003', 'c2010000-0000-4000-8000-000000000001', 'Pharmacy & Medication Dispensing', 'P', 4, true)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix, avg_service_minutes = EXCLUDED.avg_service_minutes;

-- Bank Services
INSERT INTO services (id, facility_id, name, code_prefix, avg_service_minutes, is_active)
VALUES
  ('d3010000-0000-4000-8000-000000000001', 'd2010000-0000-4000-8000-000000000001', 'Cash Deposits & Withdrawals', 'C', 4, true),
  ('d3010000-0000-4000-8000-000000000002', 'd2010000-0000-4000-8000-000000000001', 'Account Operations & Customer Care', 'A', 8, true),
  ('d3010000-0000-4000-8000-000000000003', 'd2010000-0000-4000-8000-000000000001', 'Foreign Exchange & Wire Transfers', 'F', 6, true)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, code_prefix = EXCLUDED.code_prefix, avg_service_minutes = EXCLUDED.avg_service_minutes;

-- ============================================================================
-- 7. Seed Authoritative Service Desks
-- ============================================================================

-- Central Bursary Desks
INSERT INTO desks (id, facility_id, number, name, status, active_staff_name)
VALUES
  ('8f86e5ec-7e94-4639-a3cd-a4cc013fd5a8', '83acffa3-28fc-419c-ba16-0a293608fc46', 1, 'Desk 1 - Cashier A', 'open', 'Etonde Marie'),
  ('52a2863f-09c6-48d5-9c4a-c4eb70157614', '83acffa3-28fc-419c-ba16-0a293608fc46', 2, 'Desk 2 - Cashier B', 'open', 'Tabe Roland'),
  ('64d9575e-5214-4971-aa96-fa5be8184790', '83acffa3-28fc-419c-ba16-0a293608fc46', 3, 'Desk 3 - Records & Transcripts', 'open', 'Ngwa Kenneth'),
  ('8a412cdf-e177-4442-be30-136e8124a36c', '83acffa3-28fc-419c-ba16-0a293608fc46', 4, 'Desk 4 - ID Cards & Biometrics', 'open', 'Bessong Clara')
ON CONFLICT (facility_id, number) DO UPDATE
SET name = EXCLUDED.name, status = EXCLUDED.status, active_staff_name = EXCLUDED.active_staff_name;

-- Telecom Desks
INSERT INTO desks (id, facility_id, number, name, status, active_staff_name)
VALUES
  ('b4010000-0000-4000-8000-000000000001', 'b2010000-0000-4000-8000-000000000001', 1, 'Counter 1 - Fast Cashier & Billing', 'open', 'Nathalie S.'),
  ('b4010000-0000-4000-8000-000000000002', 'b2010000-0000-4000-8000-000000000002', 2, 'Counter 2 - SIM Registration Desk', 'open', 'Boris M.'),
  ('b4010000-0000-4000-8000-000000000003', 'b2010000-0000-4000-8000-000000000003', 3, 'Counter 3 - Technical Support Desk', 'open', 'Arthur K.')
ON CONFLICT (facility_id, number) DO UPDATE
SET name = EXCLUDED.name, status = EXCLUDED.status, active_staff_name = EXCLUDED.active_staff_name;

-- Desk Service Mappings
INSERT INTO desk_services (desk_id, service_id)
VALUES
  ('8f86e5ec-7e94-4639-a3cd-a4cc013fd5a8', '1b1149fa-5673-4d74-9b19-55885b396c13'),
  ('52a2863f-09c6-48d5-9c4a-c4eb70157614', '1b1149fa-5673-4d74-9b19-55885b396c13'),
  ('64d9575e-5214-4971-aa96-fa5be8184790', 'bd0ebfc4-a463-48d9-a899-6f035ff8f173'),
  ('8a412cdf-e177-4442-be30-136e8124a36c', '52bc0cdb-3a37-4dc9-8cad-954584e8936a'),
  ('b4010000-0000-4000-8000-000000000001', 'b3010000-0000-4000-8000-000000000002'),
  ('b4010000-0000-4000-8000-000000000002', 'b3010000-0000-4000-8000-000000000001'),
  ('b4010000-0000-4000-8000-000000000003', 'b3010000-0000-4000-8000-000000000003')
ON CONFLICT (desk_id, service_id) DO NOTHING;

-- Clean tickets table: Tickets are created purely dynamically when users join
-- No dummy tickets pre-seeded.
