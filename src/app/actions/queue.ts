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

/**
 * Server action to transfer a ticket to a new service within the same facility.
 */
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

