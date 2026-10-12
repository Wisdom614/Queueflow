import { describe, it, expect } from 'vitest';
import {
  generateTicketNumber,
  calculateWaitingAhead,
  calculateEstimatedWaitMinutes,
  isValidStatusTransition,
  processCallNext,
  processTransferTicket,
} from '../queue-engine';
import { Ticket, Desk } from '@/types/queue';

describe('Queue Engine - Domain Logic Tests', () => {
  describe('generateTicketNumber', () => {
    it('starts at prefix + 101 when no existing tickets for that prefix exist', () => {
      const tickets: Pick<Ticket, 'ticketNumber'>[] = [];
      expect(generateTicketNumber('B', tickets)).toBe('B101');
      expect(generateTicketNumber('C', tickets)).toBe('C101');
    });

    it('correctly increments the highest ticket number for the given prefix', () => {
      const tickets: Pick<Ticket, 'ticketNumber'>[] = [
        { ticketNumber: 'B101' },
        { ticketNumber: 'B102' },
        { ticketNumber: 'B105' },
        { ticketNumber: 'C101' },
      ];
      expect(generateTicketNumber('B', tickets)).toBe('B106');
      expect(generateTicketNumber('C', tickets)).toBe('C102');
    });

    it('handles default prefix when empty prefix is provided', () => {
      expect(generateTicketNumber('', [])).toBe('Q101');
    });
  });

  describe('calculateWaitingAhead', () => {
    const sampleTickets: Pick<Ticket, 'id' | 'serviceId' | 'status'>[] = [
      { id: 't1', serviceId: 'srv-1', status: 'waiting' },
      { id: 't2', serviceId: 'srv-2', status: 'waiting' },
      { id: 't3', serviceId: 'srv-1', status: 'called' },
      { id: 't4', serviceId: 'srv-1', status: 'waiting' },
      { id: 't5', serviceId: 'srv-1', status: 'waiting' },
    ];

    it('returns 0 for the first customer waiting in a service', () => {
      const ahead = calculateWaitingAhead(sampleTickets, sampleTickets[0]);
      expect(ahead).toBe(0);
    });

    it('counts only customers waiting ahead for the SAME service', () => {
      // t4 is the second waiting customer for srv-1 (t1 is index 0, t4 is index 1)
      const ahead = calculateWaitingAhead(sampleTickets, sampleTickets[3]);
      expect(ahead).toBe(1);

      // t5 is the third waiting customer for srv-1
      const aheadT5 = calculateWaitingAhead(sampleTickets, sampleTickets[4]);
      expect(aheadT5).toBe(2);
    });

    it('returns 0 if ticket status is not waiting', () => {
      const ahead = calculateWaitingAhead(sampleTickets, sampleTickets[2]);
      expect(ahead).toBe(0);
    });
  });

  describe('calculateEstimatedWaitMinutes', () => {
    it('returns 0 if no one is waiting ahead', () => {
      expect(calculateEstimatedWaitMinutes(0, 5, 2)).toBe(0);
    });

    it('calculates expected wait time based on ahead count, avg time, and active desks', () => {
      // 4 ahead * 6 mins = 24 mins / 2 desks = 12 mins
      expect(calculateEstimatedWaitMinutes(4, 6, 2)).toBe(12);

      // 1 ahead * 7 mins = 7 mins / 1 desk = 7 mins
      expect(calculateEstimatedWaitMinutes(1, 7, 1)).toBe(7);
    });

    it('falls back gracefully if active desks count is 0', () => {
      // should treat activeDesks as at least 1
      expect(calculateEstimatedWaitMinutes(2, 5, 0)).toBe(10);
    });

    it('returns at least 1 minute if someone is waiting ahead', () => {
      // 1 ahead * 1 min / 5 desks = 0.2 -> rounded to 0, but clamped to at least 1
      expect(calculateEstimatedWaitMinutes(1, 1, 5)).toBe(1);
    });
  });

  describe('isValidStatusTransition', () => {
    it('allows standard forward progression', () => {
      expect(isValidStatusTransition('waiting', 'called')).toBe(true);
      expect(isValidStatusTransition('called', 'in_service')).toBe(true);
      expect(isValidStatusTransition('in_service', 'completed')).toBe(true);
    });

    it('allows cancellation from active states', () => {
      expect(isValidStatusTransition('waiting', 'cancelled')).toBe(true);
      expect(isValidStatusTransition('called', 'cancelled')).toBe(true);
      expect(isValidStatusTransition('in_service', 'cancelled')).toBe(true);
    });

    it('allows marking no-show from called or in_service', () => {
      expect(isValidStatusTransition('called', 'no_show')).toBe(true);
      expect(isValidStatusTransition('in_service', 'no_show')).toBe(true);
    });

    it('rejects invalid backwards or terminal transitions', () => {
      expect(isValidStatusTransition('completed', 'waiting')).toBe(false);
      expect(isValidStatusTransition('completed', 'in_service')).toBe(false);
      expect(isValidStatusTransition('cancelled', 'called')).toBe(false);
      expect(isValidStatusTransition('waiting', 'completed')).toBe(false);
    });
  });

  describe('processCallNext', () => {
    const desks: Desk[] = [
      {
        id: 'd1',
        number: 1,
        facilityId: 'fac-1',
        name: 'Desk 1',
        supportedServiceIds: ['srv-fee'],
        status: 'open',
        activeStaffName: 'Agent Alice',
      },
      {
        id: 'd2',
        number: 2,
        facilityId: 'fac-1',
        name: 'Desk 2',
        supportedServiceIds: ['srv-transcript'],
        status: 'open',
        activeStaffName: 'Agent Bob',
      },
    ];

    const tickets: Ticket[] = [
      {
        id: 't-1',
        ticketNumber: 'B101',
        serviceId: 'srv-fee',
        facilityId: 'fac-1',
        customerName: 'Customer 1',
        status: 'waiting',
        joinedAt: '2026-10-12T00:00:00Z',
      },
      {
        id: 't-2',
        ticketNumber: 'T101',
        serviceId: 'srv-transcript',
        facilityId: 'fac-1',
        customerName: 'Customer 2',
        status: 'waiting',
        joinedAt: '2026-10-12T00:01:00Z',
      },
    ];

    it('calls the matching waiting ticket for Desk 1', () => {
      const now = '2026-10-12T00:05:00Z';
      const result = processCallNext(desks, tickets, 1, now);

      expect(result.calledTicket).not.toBeNull();
      expect(result.calledTicket?.ticketNumber).toBe('B101');
      expect(result.calledTicket?.status).toBe('called');
      expect(result.calledTicket?.deskNumber).toBe(1);
      expect(result.calledTicket?.staffName).toBe('Agent Alice');
      expect(result.calledTicket?.calledAt).toBe(now);

      const updatedT1 = result.updatedTickets.find((t) => t.id === 't-1');
      expect(updatedT1?.status).toBe('called');
    });

    it('auto-completes existing active ticket on the same desk when calling next', () => {
      const ticketsWithActive: Ticket[] = [
        {
          id: 't-active',
          ticketNumber: 'B100',
          serviceId: 'srv-fee',
          facilityId: 'fac-1',
          customerName: 'Previous Customer',
          status: 'called',
          deskNumber: 1,
          staffName: 'Agent Alice',
          joinedAt: '2026-10-12T00:00:00Z',
        },
        {
          id: 't-1',
          ticketNumber: 'B101',
          serviceId: 'srv-fee',
          facilityId: 'fac-1',
          customerName: 'Customer 1',
          status: 'waiting',
          joinedAt: '2026-10-12T00:01:00Z',
        },
      ];

      const now = '2026-10-12T00:10:00Z';
      const result = processCallNext(desks, ticketsWithActive, 1, now);

      expect(result.calledTicket?.id).toBe('t-1');
      const prevTicket = result.updatedTickets.find((t) => t.id === 't-active');
      expect(prevTicket?.status).toBe('completed');
      expect(prevTicket?.completedAt).toBe(now);
    });

    it('returns null if no waiting tickets match desk supported services', () => {
      const emptyFeeTickets: Ticket[] = [
        {
          id: 't-2',
          ticketNumber: 'T101',
          serviceId: 'srv-transcript',
          facilityId: 'fac-1',
          customerName: 'Customer 2',
          status: 'waiting',
          joinedAt: '2026-10-12T00:01:00Z',
        },
      ];

      // Desk 1 only supports 'srv-fee'
      const result = processCallNext(desks, emptyFeeTickets, 1);
      expect(result.calledTicket).toBeNull();
    });

    it('returns unchanged tickets if desk number does not exist', () => {
      const result = processCallNext(desks, tickets, 99);
      expect(result.calledTicket).toBeNull();
      expect(result.updatedTickets).toEqual(tickets);
    });
  });

  describe('processTransferTicket', () => {
    const initialTickets: Ticket[] = [
      {
        id: 't-1',
        ticketNumber: 'B101',
        serviceId: 'srv-fee',
        facilityId: 'fac-1',
        customerName: 'Customer 1',
        status: 'called',
        deskNumber: 1,
        staffName: 'Agent Alice',
        joinedAt: '2026-10-12T00:00:00Z',
        calledAt: '2026-10-12T00:05:00Z',
      },
      {
        id: 't-2',
        ticketNumber: 'B102',
        serviceId: 'srv-fee',
        facilityId: 'fac-1',
        customerName: 'Customer 2',
        status: 'completed',
        joinedAt: '2026-10-12T00:01:00Z',
      },
    ];

    it('successfully transfers an active ticket to a new service queue', () => {
      const transferTime = '2026-10-12T00:08:00Z';
      const result = processTransferTicket(initialTickets, 't-1', 'srv-transcript', transferTime);

      expect(result.transferredTicket).not.toBeNull();
      expect(result.transferredTicket?.serviceId).toBe('srv-transcript');
      expect(result.transferredTicket?.status).toBe('waiting');
      expect(result.transferredTicket?.deskNumber).toBeUndefined();
      expect(result.transferredTicket?.staffName).toBeUndefined();
      expect(result.transferredTicket?.calledAt).toBeUndefined();
      expect(result.transferredTicket?.joinedAt).toBe(transferTime);

      const inUpdatedList = result.updatedTickets.find((t) => t.id === 't-1');
      expect(inUpdatedList?.status).toBe('waiting');
      expect(inUpdatedList?.serviceId).toBe('srv-transcript');
    });

    it('rejects transfer for tickets in completed or cancelled states', () => {
      const result = processTransferTicket(initialTickets, 't-2', 'srv-transcript');
      expect(result.transferredTicket).toBeNull();
      expect(result.updatedTickets).toEqual(initialTickets);
    });

    it('returns null if ticket ID is not found', () => {
      const result = processTransferTicket(initialTickets, 'non-existent', 'srv-transcript');
      expect(result.transferredTicket).toBeNull();
      expect(result.updatedTickets).toEqual(initialTickets);
    });
  });
});
