'use server';

import {
  dbJoinQueue,
  dbCallNext,
  dbUpdateTicketStatus,
  dbTransferTicket,
  getFacilityInitialData,
  getFacilityTodayTickets,
} from '@/lib/supabase/queue-service';
import { createServerClient } from '@/lib/supabase/server';
import { Ticket, Desk } from '@/types/queue';

/**
 * Server action to fetch initial state for a specified facility (defaulting to Buea Bursary).
 */
export async function fetchQueueInitialState(orgSlug: string = 'ubuea', facilitySlug?: string) {
  try {
    const facilityData = await getFacilityInitialData(orgSlug, facilitySlug);
    const todayTickets = await getFacilityTodayTickets(facilityData.facility.id);

    return {
      success: true,
      data: {
        ...facilityData,
        tickets: todayTickets,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to fetch queue state for ${orgSlug}/${facilitySlug || 'default'}:`, error);
    return {
      success: false,
      error: message || 'Failed to fetch queue initial state',
    };
  }
}

/**
 * Server action to join a queue atomically with tenant verification.
 */
export async function joinQueueAction(
  serviceId: string,
  customerName: string,
  customerPhone?: string,
  targetFacilityId?: string
): Promise<{ success: boolean; ticket?: Ticket; error?: string }> {
  try {
    let facilityId = targetFacilityId;
    if (!facilityId) {
      const { facility } = await getFacilityInitialData('ubuea');
      facilityId = facility.id;
    }
    const ticket = await dbJoinQueue(facilityId, serviceId, customerName, customerPhone);
    return { success: true, ticket };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in joinQueueAction:', error);
    return { success: false, error: message };
  }
}

/**
 * Server action to call the next waiting ticket for a desk with tenant isolation.
 */
export async function callNextAction(
  deskNumber: number,
  staffName?: string,
  targetFacilityId?: string,
  orgSlug: string = 'ubuea'
): Promise<{ success: boolean; ticket?: Ticket | null; error?: string }> {
  try {
    const { desks, facility } = await getFacilityInitialData(orgSlug);
    const activeFacilityId = targetFacilityId || facility.id;
    const desk = desks.find((d) => d.number === deskNumber && d.facilityId === activeFacilityId);

    if (!desk) {
      return { success: false, error: `Desk ${deskNumber} not found for facility ${activeFacilityId}` };
    }

    const ticket = await dbCallNext(desk.id, staffName || desk.activeStaffName, activeFacilityId);
    return { success: true, ticket };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in callNextAction:', error);
    return { success: false, error: message };
  }
}

/**
 * Server action to transition ticket status with tenant verification.
 */
export async function updateTicketStatusAction(
  ticketId: string,
  newStatus: 'in_service' | 'completed' | 'no_show' | 'cancelled',
  actorName?: string,
  facilityId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await dbUpdateTicketStatus(ticketId, newStatus, actorName, facilityId);
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in updateTicketStatusAction:', error);
    return { success: false, error: message };
  }
}

/**
 * Server action to update desk status scoped to the specific facility.
 */
export async function updateDeskStatusAction(
  deskNumber: number,
  status: Desk['status'],
  facilityId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient();
    let query = supabase
      .from('desks')
      .update({ status: status === 'break' ? 'paused' : status })
      .eq('number', deskNumber);

    if (facilityId) {
      query = query.eq('facility_id', facilityId);
    }

    const { error } = await query;
    if (error) throw error;
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in updateDeskStatusAction:', error);
    return { success: false, error: message };
  }
}

export async function transferTicketAction(
  ticketId: string,
  targetServiceId: string,
  actorName?: string,
  facilityId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await dbTransferTicket(ticketId, targetServiceId, actorName, facilityId);
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in transferTicketAction:', error);
    return { success: false, error: message };
  }
}

export interface OnboardServiceInput {
  name: string;
  codePrefix: string;
  avgServiceMinutes: number;
  description?: string;
}

export interface OnboardDeskInput {
  number: number;
  name: string;
  activeStaffName?: string;
}

export interface OnboardOrganizationInput {
  organizationName: string;
  organizationSlug: string;
  category: string;
  facilityName: string;
  facilitySlug: string;
  location: string;
  services: OnboardServiceInput[];
  desks: OnboardDeskInput[];
}

/**
 * Server action to atomically register and configure a brand-new organization
 * along with its initial facility, services, desks, and desk service mappings.
 */
export async function createOrganizationAction(
  data: OnboardOrganizationInput
): Promise<{ success: boolean; orgSlug?: string; facilitySlug?: string; error?: string }> {
  try {
    // 1. Sanitize & Validate inputs
    const cleanOrgName = data.organizationName?.trim() || '';
    if (!cleanOrgName) throw new Error('Organization name is required.');

    let cleanOrgSlug = (data.organizationSlug || '').toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    if (!cleanOrgSlug) {
      cleanOrgSlug = cleanOrgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    if (!cleanOrgSlug) cleanOrgSlug = `org-${Date.now().toString().slice(-4)}`;

    const cleanFacilityName = data.facilityName?.trim() || 'Main Branch';
    let cleanFacilitySlug = (data.facilitySlug || '').toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    if (!cleanFacilitySlug) {
      cleanFacilitySlug = cleanFacilityName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    if (!cleanFacilitySlug) cleanFacilitySlug = 'main';

    if (!data.services || data.services.length === 0) {
      throw new Error('At least one service queue is required.');
    }
    if (!data.desks || data.desks.length === 0) {
      throw new Error('At least one service counter is required.');
    }

    const supabase = createServerClient();

    // 2. Check for slug collision, auto-resolve with suffix if needed
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', cleanOrgSlug)
      .maybeSingle();

    if (existingOrg) {
      cleanOrgSlug = `${cleanOrgSlug}-${Date.now().toString().slice(-4)}`;
    }

    // 3. Create Organization
    const { data: newOrg, error: orgErr } = await supabase
      .from('organizations')
      .insert({
        name: cleanOrgName,
        slug: cleanOrgSlug,
        category: data.category.trim() || 'General Operations',
      })
      .select()
      .single();

    if (orgErr || !newOrg) {
      throw new Error(`Failed to create organization: ${orgErr?.message}`);
    }

    // 4. Create Initial Facility
    const { data: newFacility, error: facErr } = await supabase
      .from('facilities')
      .insert({
        org_id: newOrg.id,
        name: cleanFacilityName,
        slug: cleanFacilitySlug,
        location: data.location.trim() || 'Main Operations Center',
        timezone: 'Africa/Douala',
      })
      .select()
      .single();

    if (facErr || !newFacility) {
      throw new Error(`Failed to create facility: ${facErr?.message}`);
    }

    // 5. Create Services
    const servicePayloads = data.services.map((s) => ({
      facility_id: newFacility.id,
      name: s.name.trim(),
      code_prefix: (s.codePrefix || 'A').toUpperCase().trim().slice(0, 4),
      avg_service_minutes: Math.max(1, Number(s.avgServiceMinutes) || 5),
      is_active: true,
    }));

    const { data: createdServices, error: srvErr } = await supabase
      .from('services')
      .insert(servicePayloads)
      .select();

    if (srvErr || !createdServices || createdServices.length === 0) {
      throw new Error(`Failed to create services: ${srvErr?.message}`);
    }

    // 6. Create Desks
    const deskPayloads = data.desks.map((d, index) => ({
      facility_id: newFacility.id,
      number: index + 1,
      name: d.name.trim() || `Desk ${index + 1}`,
      active_staff_name: d.activeStaffName?.trim() || `Attendant ${index + 1}`,
      status: 'open' as const,
    }));

    const { data: createdDesks, error: deskErr } = await supabase
      .from('desks')
      .insert(deskPayloads)
      .select();

    if (deskErr || !createdDesks) {
      throw new Error(`Failed to create desks: ${deskErr?.message}`);
    }

    // 7. Map Desks to Services (Each counter can support all created services by default)
    const deskServiceMappings: { desk_id: string; service_id: string }[] = [];
    for (const desk of createdDesks) {
      for (const service of createdServices) {
        deskServiceMappings.push({
          desk_id: desk.id,
          service_id: service.id,
        });
      }
    }

    if (deskServiceMappings.length > 0) {
      await supabase.from('desk_services').insert(deskServiceMappings);
    }

    return {
      success: true,
      orgSlug: cleanOrgSlug,
      facilitySlug: cleanFacilitySlug,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in createOrganizationAction:', error);
    return {
      success: false,
      error: message,
    };
  }
}

