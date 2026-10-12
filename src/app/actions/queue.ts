'use server';

import {
  dbJoinQueue,
  dbCallNext,
  dbUpdateTicketStatus,
  getFacilityInitialData,
  getFacilityTodayTickets,
} from '@/lib/supabase/queue-service';
import { createServerClient } from '@/lib/supabase/server';
import { Ticket, Desk } from '@/types/queue';

/**
 * Server action to fetch initial state for the Buea Bursary facility.
 */
export async function fetchQueueInitialState() {
  try {
    const facilityData = await getFacilityInitialData('ubuea');
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
    console.error('Failed to fetch queue initial state from Supabase:', error);
    return {
      success: false,
      error: message || 'Failed to fetch queue initial state',
    };
  }
}

/**
 * Server action to join a queue atomically.
 */
export async function joinQueueAction(
  serviceId: string,
  customerName: string,
  customerPhone?: string
): Promise<{ success: boolean; ticket?: Ticket; error?: string }> {
  try {
    const { facility } = await getFacilityInitialData('ubuea');
    const ticket = await dbJoinQueue(facility.id, serviceId, customerName, customerPhone);
    return { success: true, ticket };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in joinQueueAction:', error);
    return { success: false, error: message };
  }
}

/**
 * Server action to call the next waiting ticket for a desk.
 */
export async function callNextAction(
  deskNumber: number,
  staffName?: string
): Promise<{ success: boolean; ticket?: Ticket | null; error?: string }> {
  try {
    const { desks } = await getFacilityInitialData('ubuea');
    const desk = desks.find((d) => d.number === deskNumber);

    if (!desk) {
      return { success: false, error: `Desk ${deskNumber} not found` };
    }

    const ticket = await dbCallNext(desk.id, staffName || desk.activeStaffName);
    return { success: true, ticket };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in callNextAction:', error);
    return { success: false, error: message };
  }
}

/**
 * Server action to transition ticket status (in_service, completed, no_show, cancelled).
 */
export async function updateTicketStatusAction(
  ticketId: string,
  newStatus: 'in_service' | 'completed' | 'no_show' | 'cancelled',
  actorName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await dbUpdateTicketStatus(ticketId, newStatus, actorName);
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in updateTicketStatusAction:', error);
    return { success: false, error: message };
  }
}

/**
 * Server action to update desk status (open, break, closed).
 */
export async function updateDeskStatusAction(
  deskNumber: number,
  status: Desk['status']
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient();
    const { error } = await supabase
      .from('desks')
      .update({ status: status === 'break' ? 'paused' : status })
      .eq('number', deskNumber);

    if (error) throw error;
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in updateDeskStatusAction:', error);
    return { success: false, error: message };
  }
}
