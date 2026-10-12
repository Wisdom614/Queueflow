import { createServerClient } from './server';
import { Ticket, Service, Desk, Organization, Facility } from '@/types/queue';

export interface DbDeskRow {
  id: string;
  facility_id: string;
  number: number;
  name: string;
  status: 'open' | 'closed' | 'break';
  active_staff_name?: string;
  desk_services?: { service_id: string }[];
}

export interface DbServiceRow {
  id: string;
  facility_id: string;
  name: string;
  code_prefix: string;
  description?: string;
  avg_service_minutes: number;
  is_active: boolean;
}

export interface DbTicketRow {
  id: string;
  ticket_number: string;
  service_id: string;
  facility_id: string;
  customer_name: string;
  customer_phone?: string;
  status: Ticket['status'];
  desk_number?: number;
  staff_name?: string;
  joined_at: string;
  called_at?: string;
  started_at?: string;
  completed_at?: string;
}

/**
 * Fetch the initial organization, facility, services, and desks from Supabase.
 */
export async function getFacilityInitialData(slug: string = 'ubuea') {
  const supabase = createServerClient();

  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single();

  if (orgErr || !org) {
    throw new Error(`Organization ${slug} not found: ${orgErr?.message}`);
  }

  const { data: facility, error: facErr } = await supabase
    .from('facilities')
    .select('*')
    .eq('org_id', org.id)
    .single();

  if (facErr || !facility) {
    throw new Error(`Facility not found for organization ${org.name}`);
  }

  const { data: services, error: srvErr } = await supabase
    .from('services')
    .select('*')
    .eq('facility_id', facility.id)
    .eq('is_active', true);

  if (srvErr) throw srvErr;

  const { data: desks, error: deskErr } = await supabase
    .from('desks')
    .select(`
      *,
      desk_services (
        service_id
      )
    `)
    .eq('facility_id', facility.id)
    .order('number', { ascending: true });

  if (deskErr) throw deskErr;

  const rawDesks = (desks || []) as unknown as DbDeskRow[];
  const formattedDesks: Desk[] = rawDesks.map((d) => ({
    id: d.id,
    facilityId: d.facility_id,
    number: d.number,
    name: d.name,
    status: d.status,
    activeStaffName: d.active_staff_name,
    supportedServiceIds: (d.desk_services || []).map((ds) => ds.service_id),
  }));

  const rawServices = (services || []) as unknown as DbServiceRow[];
  const formattedServices: Service[] = rawServices.map((s) => ({
    id: s.id,
    facilityId: s.facility_id,
    name: s.name,
    codePrefix: s.code_prefix,
    description: s.description || `${s.name} operations`,
    avgServiceMinutes: s.avg_service_minutes,
    isOpen: s.is_active,
  }));

  return {
    organization: org as Organization,
    facility: {
      id: facility.id,
      orgId: facility.org_id,
      name: facility.name,
      slug: facility.name.toLowerCase().replace(/\s+/g, '-'),
      location: facility.location,
    } as Facility,
    services: formattedServices,
    desks: formattedDesks,
  };
}

/**
 * Fetch all tickets created today for a facility.
 */
export async function getFacilityTodayTickets(facilityId: string): Promise<Ticket[]> {
  const supabase = createServerClient();

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('facility_id', facilityId)
    .eq('created_date', new Date().toISOString().split('T')[0])
    .order('joined_at', { ascending: true });

  if (error) {
    console.error('Error fetching today tickets:', error);
    return [];
  }

  const rawTickets = (tickets || []) as unknown as DbTicketRow[];
  return rawTickets.map((t) => ({
    id: t.id,
    ticketNumber: t.ticket_number,
    serviceId: t.service_id,
    facilityId: t.facility_id,
    customerName: t.customer_name,
    customerPhone: t.customer_phone,
    status: t.status,
    deskNumber: t.desk_number,
    staffName: t.staff_name,
    joinedAt: t.joined_at,
    calledAt: t.called_at,
    startedAt: t.started_at,
    completedAt: t.completed_at,
  }));
}

/**
 * Join queue atomically in Supabase:
 * Generates sequential ticket code, inserts ticket and logs queue event.
 */
export async function dbJoinQueue(
  facilityId: string,
  serviceId: string,
  customerName: string,
  customerPhone?: string
): Promise<Ticket> {
  const supabase = createServerClient();

  // 1. Fetch service prefix
  const { data: service, error: srvErr } = await supabase
    .from('services')
    .select('code_prefix')
    .eq('id', serviceId)
    .single();

  if (srvErr || !service) {
    throw new Error('Service not found');
  }

  const prefix = service.code_prefix || 'Q';

  // 2. Query today's existing tickets for this prefix
  const today = new Date().toISOString().split('T')[0];
  const { data: existing, error: countErr } = await supabase
    .from('tickets')
    .select('ticket_number')
    .eq('facility_id', facilityId)
    .eq('created_date', today);

  if (countErr) throw countErr;

  const existingNums = (existing || [])
    .map((t) => t.ticket_number)
    .filter((n) => n.startsWith(prefix))
    .map((n) => parseInt(n.slice(prefix.length), 10))
    .filter((n) => !isNaN(n));

  const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 101;
  const ticketNumber = `${prefix}${nextNum}`;

  // 3. Insert ticket
  const { data: newTicket, error: insErr } = await supabase
    .from('tickets')
    .insert({
      facility_id: facilityId,
      service_id: serviceId,
      ticket_number: ticketNumber,
      customer_name: customerName.trim(),
      customer_phone: customerPhone?.trim() || null,
      status: 'waiting',
      created_date: today,
    })
    .select()
    .single();

  if (insErr || !newTicket) {
    throw new Error(`Failed to create ticket: ${insErr?.message}`);
  }

  // 4. Log event
  await supabase.from('queue_events').insert({
    ticket_id: newTicket.id,
    event_type: 'JOIN_QUEUE',
    new_status: 'waiting',
    actor_name: customerName,
  });

  return {
    id: newTicket.id,
    ticketNumber: newTicket.ticket_number,
    serviceId: newTicket.service_id,
    facilityId: newTicket.facility_id,
    customerName: newTicket.customer_name,
    customerPhone: newTicket.customer_phone,
    status: newTicket.status,
    joinedAt: newTicket.joined_at,
  };
}

/**
 * Call next ticket atomically using PostgreSQL stored procedure.
 */
export async function dbCallNext(deskId: string, staffName?: string): Promise<Ticket | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase.rpc('call_next_ticket', {
    p_desk_id: deskId,
    p_staff_name: staffName || null,
  });

  if (error) {
    throw new Error(`Call next RPC error: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return null;
  }

  const called = data[0];
  return {
    id: called.id,
    ticketNumber: called.ticket_number,
    serviceId: called.service_id,
    facilityId: called.facility_id,
    customerName: called.customer_name,
    customerPhone: called.customer_phone,
    status: called.status,
    deskNumber: called.desk_number,
    staffName: called.staff_name,
    joinedAt: called.joined_at,
    calledAt: called.called_at,
  };
}

/**
 * Update ticket state transition with audit log.
 */
export async function dbUpdateTicketStatus(
  ticketId: string,
  newStatus: 'in_service' | 'completed' | 'no_show' | 'cancelled',
  actorName?: string
) {
  const supabase = createServerClient();
  const updatePayload: {
    status: 'in_service' | 'completed' | 'no_show' | 'cancelled';
    started_at?: string;
    completed_at?: string;
  } = { status: newStatus };

  if (newStatus === 'in_service') updatePayload.started_at = new Date().toISOString();
  if (newStatus === 'completed') updatePayload.completed_at = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from('tickets')
    .update(updatePayload)
    .eq('id', ticketId)
    .select()
    .single();

  if (error || !updated) {
    throw new Error(`Failed to update ticket ${ticketId}: ${error?.message}`);
  }

  await supabase.from('queue_events').insert({
    ticket_id: ticketId,
    event_type: `STATUS_${newStatus.toUpperCase()}`,
    new_status: newStatus,
    actor_name: actorName,
  });

  return updated;
}
