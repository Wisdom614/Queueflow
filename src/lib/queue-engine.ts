import { Ticket, Desk, TicketStatus } from '@/types/queue';

/**
 * Generates the next sequential ticket code for a service (e.g. B101, B102, C101).
 * Sequence starts at 101 if none exist.
 */
export function generateTicketNumber(prefix: string, existingTickets: Pick<Ticket, 'ticketNumber'>[]): string {
  const cleanPrefix = (prefix || 'Q').trim().toUpperCase();
  const existingNumbers = existingTickets
    .map((t) => t.ticketNumber)
    .filter((num) => num.startsWith(cleanPrefix))
    .map((num) => parseInt(num.slice(cleanPrefix.length), 10))
    .filter((n) => !isNaN(n));

  const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 101;
  return `${cleanPrefix}${nextNumber}`;
}

/**
 * Calculates how many customers are waiting strictly ahead of a given ticket for the same service.
 */
export function calculateWaitingAhead(tickets: Pick<Ticket, 'id' | 'serviceId' | 'status'>[], ticket: Pick<Ticket, 'id' | 'serviceId' | 'status'>): number {
  if (ticket.status !== 'waiting') return 0;
  const waitingForService = tickets.filter(
    (t) => t.serviceId === ticket.serviceId && t.status === 'waiting'
  );
  const index = waitingForService.findIndex((t) => t.id === ticket.id);
  return index >= 0 ? index : 0;
}

/**
 * Calculates estimated wait time in minutes:
 * Formula: max(1, round((waitingAhead * avgServiceMinutes) / activeDesks))
 */
export function calculateEstimatedWaitMinutes(
  waitingAhead: number,
  avgServiceMinutes: number,
  activeDesksCount: number
): number {
  if (waitingAhead <= 0) return 0;
  const denominator = Math.max(1, activeDesksCount);
  const minutes = Math.round((waitingAhead * Math.max(1, avgServiceMinutes)) / denominator);
  return Math.max(1, minutes);
}

/**
 * Validates whether a ticket transition from current status to next status is legal.
 */
export function isValidStatusTransition(current: TicketStatus, next: TicketStatus): boolean {
  const validTransitions: Record<TicketStatus, TicketStatus[]> = {
    waiting: ['called', 'cancelled'],
    called: ['in_service', 'no_show', 'cancelled', 'completed', 'transferred'],
    in_service: ['completed', 'cancelled', 'no_show', 'transferred'],
    transferred: ['waiting'],
    completed: [],
    no_show: ['waiting'], // re-queue allowed if customer returns
    cancelled: [],
  };

  return validTransitions[current]?.includes(next) ?? false;
}

/**
 * Domain command to call the next waiting ticket for a desk.
 * Handles auto-completing any prior active ticket on that desk.
 */
export function processCallNext(
  desks: Desk[],
  tickets: Ticket[],
  deskNumber: number,
  timestamp: string = new Date().toISOString()
): {
  calledTicket: Ticket | null;
  updatedTickets: Ticket[];
} {
  const desk = desks.find((d) => d.number === deskNumber);
  if (!desk) {
    return { calledTicket: null, updatedTickets: tickets };
  }

  let updatedTickets = [...tickets];

  // Auto-complete previous active ticket at this desk if one exists
  const activeTicket = updatedTickets.find(
    (t) => t.deskNumber === deskNumber && (t.status === 'called' || t.status === 'in_service')
  );

  if (activeTicket) {
    updatedTickets = updatedTickets.map((t) =>
      t.id === activeTicket.id
        ? { ...t, status: 'completed' as TicketStatus, completedAt: timestamp }
        : t
    );
  }

  // Find oldest waiting ticket supported by this desk
  const nextWaiting = updatedTickets.find(
    (t) => t.status === 'waiting' && desk.supportedServiceIds.includes(t.serviceId)
  );

  if (!nextWaiting) {
    return { calledTicket: null, updatedTickets };
  }

  const calledTicket: Ticket = {
    ...nextWaiting,
    status: 'called',
    deskNumber,
    staffName: desk.activeStaffName,
    calledAt: timestamp,
  };

  updatedTickets = updatedTickets.map((t) => (t.id === nextWaiting.id ? calledTicket : t));

  return { calledTicket, updatedTickets };
}
