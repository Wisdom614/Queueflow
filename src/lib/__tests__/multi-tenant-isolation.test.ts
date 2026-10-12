import { describe, it, expect } from 'vitest';
import {
  generateTicketNumber,
  calculateWaitingAhead,
  calculateEstimatedWaitMinutes,
  processCallNext,
} from '../queue-engine';
import { Ticket, Desk, Service, Facility, Organization } from '@/types/queue';

describe('Multi-Tenant Isolation & Boundary Verification Tests', () => {
  // Tenant A: University of Buea — Central Bursary
  const orgA: Organization = {
    id: 'org-ubuea',
    name: 'University of Buea',
    slug: 'ubuea',
    category: 'Higher Education',
  };
  const facilityA: Facility = {
    id: 'fac-ub-bursary',
    orgId: orgA.id,
    name: 'Central Bursary',
    slug: 'central-bursary',
    location: 'Admin Building',
  };
  const serviceA_Fees: Service = {
    id: 'srv-a-fees',
    facilityId: facilityA.id,
    name: 'Fee Payment',
    codePrefix: 'B',
    description: 'Bursary tuition clearance',
    avgServiceMinutes: 5,
    isOpen: true,
  };
  const deskA_1: Desk = {
    id: 'desk-a-1',
    facilityId: facilityA.id,
    number: 1,
    name: 'Counter 1',
    supportedServiceIds: [serviceA_Fees.id],
    status: 'open',
  };

  // Tenant B: Sample Telecom Provider — Downtown Branch
  const orgB: Organization = {
    id: 'org-telecom',
    name: 'Sample Telecom Network',
    slug: 'sample-telecom',
    category: 'Telecommunications',
  };
  const facilityB: Facility = {
    id: 'fac-tel-downtown',
    orgId: orgB.id,
    name: 'Downtown Customer Center',
    slug: 'downtown-center',
    location: 'Commercial Avenue',
  };
  const serviceB_Sim: Service = {
    id: 'srv-b-sim',
    facilityId: facilityB.id,
    name: 'SIM Swap & Activation',
    codePrefix: 'B', // Deliberately the same prefix 'B' to test independent ticket namespace
    description: 'SIM card replacements and registration',
    avgServiceMinutes: 8,
    isOpen: true,
  };
  const deskB_1: Desk = {
    id: 'desk-b-1',
    facilityId: facilityB.id,
    number: 1,
    name: 'Desk 1 - Quick Service',
    supportedServiceIds: [serviceB_Sim.id],
    status: 'open',
  };

  describe('Contract 1: Sequence Independence & Identical Prefix Support', () => {
    it('allows both facilities to issue ticket B101 on the same day without sequence collisions', () => {
      const ticketsFacilityA: Ticket[] = [];
      const ticketsFacilityB: Ticket[] = [];

      // Tenant A issues first ticket
      const ticketNumA1 = generateTicketNumber(serviceA_Fees.codePrefix, ticketsFacilityA);
      expect(ticketNumA1).toBe('B101');

      // Tenant B issues first ticket with the same prefix 'B'
      const ticketNumB1 = generateTicketNumber(serviceB_Sim.codePrefix, ticketsFacilityB);
      expect(ticketNumB1).toBe('B101');

      // Add tickets to respective facilities
      ticketsFacilityA.push({
        id: 't-a-1',
        ticketNumber: ticketNumA1,
        serviceId: serviceA_Fees.id,
        facilityId: facilityA.id,
        customerName: 'Student A',
        status: 'waiting',
        joinedAt: new Date().toISOString(),
      });

      // Tenant A advances to B102
      const ticketNumA2 = generateTicketNumber(serviceA_Fees.codePrefix, ticketsFacilityA);
      expect(ticketNumA2).toBe('B102');

      // Tenant B remains at B101 because Facility A's activity does not advance Tenant B's sequence
      expect(generateTicketNumber(serviceB_Sim.codePrefix, ticketsFacilityB)).toBe('B101');
    });
  });

  describe('Contract 2: Queue Engine Tenant Scoping', () => {
    it('calculates queue positions strictly within the same facility and service', () => {
      const mixedTickets: Ticket[] = [
        {
          id: 't-a-1',
          ticketNumber: 'B101',
          serviceId: serviceA_Fees.id,
          facilityId: facilityA.id,
          customerName: 'Customer A1',
          status: 'waiting',
          joinedAt: '2026-10-12T08:00:00Z',
        },
        {
          id: 't-b-1',
          ticketNumber: 'B101',
          serviceId: serviceB_Sim.id,
          facilityId: facilityB.id,
          customerName: 'Customer B1',
          status: 'waiting',
          joinedAt: '2026-10-12T08:01:00Z',
        },
        {
          id: 't-a-2',
          ticketNumber: 'B102',
          serviceId: serviceA_Fees.id,
          facilityId: facilityA.id,
          customerName: 'Customer A2',
          status: 'waiting',
          joinedAt: '2026-10-12T08:02:00Z',
        },
      ];

      // Customer A1 has 0 waiting ahead in Facility A
      expect(calculateWaitingAhead(mixedTickets, mixedTickets[0])).toBe(0);

      // Customer B1 has 0 waiting ahead in Facility B, unaffected by Customer A1
      expect(calculateWaitingAhead(mixedTickets, mixedTickets[1])).toBe(0);

      // Customer A2 has 1 waiting ahead in Facility A (only Customer A1, ignoring Customer B1)
      expect(calculateWaitingAhead(mixedTickets, mixedTickets[2])).toBe(1);
    });

    it('ensures desk in Facility A calls only tickets belonging to Facility A', () => {
      const tickets: Ticket[] = [
        // Only a ticket from Facility B is in waiting
        {
          id: 't-b-1',
          ticketNumber: 'B101',
          serviceId: serviceB_Sim.id,
          facilityId: facilityB.id,
          customerName: 'Customer Telecom',
          status: 'waiting',
          joinedAt: '2026-10-12T08:00:00Z',
        },
      ];

      // Desk A1 (Facility A) attempts to call next
      const result = processCallNext([deskA_1], tickets, deskA_1.number);

      // Desk A1 must NOT call the ticket from Facility B
      expect(result.calledTicket).toBeNull();
      expect(result.updatedTickets[0].status).toBe('waiting');
    });

    it('correctly serves tickets when desk and ticket belong to the same facility', () => {
      const tickets: Ticket[] = [
        {
          id: 't-a-1',
          ticketNumber: 'B101',
          serviceId: serviceA_Fees.id,
          facilityId: facilityA.id,
          customerName: 'Student UB',
          status: 'waiting',
          joinedAt: '2026-10-12T08:00:00Z',
        },
      ];

      const result = processCallNext([deskA_1], tickets, deskA_1.number);
      expect(result.calledTicket).not.toBeNull();
      expect(result.calledTicket?.ticketNumber).toBe('B101');
      expect(result.calledTicket?.facilityId).toBe(facilityA.id);
      expect(result.calledTicket?.status).toBe('called');
    });
  });

  describe('Contract 3: Service-to-Facility Boundary Integrity', () => {
    it('rejects cross-tenant service assignment validation', () => {
      // Simulating boundary check rule
      const isServiceInFacility = (service: Service, facility: Facility) =>
        service.facilityId === facility.id;

      // Legitimate assignment
      expect(isServiceInFacility(serviceA_Fees, facilityA)).toBe(true);
      expect(isServiceInFacility(serviceB_Sim, facilityB)).toBe(true);

      // Cross-tenant breach attempt (Service from B into Facility A)
      expect(isServiceInFacility(serviceB_Sim, facilityA)).toBe(false);
      expect(isServiceInFacility(serviceA_Fees, facilityB)).toBe(false);
    });
  });

  describe('Contract 4: Dynamic Tenant Resolution & Preset Isolation', () => {
    it('resolves unique organization and facility data for each tenant slug', async () => {
      const { getDemoTenantData, getAllDemoOrganizations } = await import('../mock-data');

      const ubData = getDemoTenantData('ubuea');
      expect(ubData.organization.slug).toBe('ubuea');
      expect(ubData.facility.slug).toBe('central-bursary');
      expect(ubData.services.some((s) => s.codePrefix === 'B')).toBe(true);

      const telecomData = getDemoTenantData('sample-telecom');
      expect(telecomData.organization.slug).toBe('sample-telecom');
      expect(telecomData.facility.slug).toBe('downtown');
      expect(telecomData.services.some((s) => s.codePrefix === 'S')).toBe(true);

      const clinicData = getDemoTenantData('sample-clinic');
      expect(clinicData.organization.slug).toBe('sample-clinic');
      expect(clinicData.facility.slug).toBe('outpatient');
      expect(clinicData.services.some((s) => s.codePrefix === 'T')).toBe(true);

      const bankData = getDemoTenantData('sample-bank');
      expect(bankData.organization.slug).toBe('sample-bank');
      expect(bankData.facility.slug).toBe('main-hall');
      expect(bankData.services.some((s) => s.codePrefix === 'C')).toBe(true);

      // Graceful fallback for unknown slug
      const unknownData = getDemoTenantData('non-existent-tenant');
      expect(unknownData.organization.slug).toBe('ubuea');

      // Verify all demo organizations are distinct
      const allOrgs = getAllDemoOrganizations();
      const slugs = allOrgs.map((o) => o.organization.slug);
      expect(new Set(slugs).size).toBe(4);
    });
  });

  describe('Contract 5: Self-Service Organization Onboarding Validation', () => {
    it('validates required fields and rejects empty entity or services', async () => {
      const { createOrganizationAction } = await import('../../app/actions/queue');

      // Rejects empty organization name
      const res1 = await createOrganizationAction({
        organizationName: '',
        organizationSlug: '',
        category: 'Healthcare',
        facilityName: 'Main Clinic',
        facilitySlug: 'main-clinic',
        location: 'Douala',
        services: [{ name: 'Triage', codePrefix: 'T', avgServiceMinutes: 5 }],
        desks: [{ number: 1, name: 'Desk 1' }],
      });
      expect(res1.success).toBe(false);
      expect(res1.error).toContain('Organization name is required');

      // Rejects empty services list
      const res2 = await createOrganizationAction({
        organizationName: 'Valid Clinic',
        organizationSlug: 'valid-clinic',
        category: 'Healthcare',
        facilityName: 'Main Clinic',
        facilitySlug: 'main-clinic',
        location: 'Douala',
        services: [],
        desks: [{ number: 1, name: 'Desk 1' }],
      });
      expect(res2.success).toBe(false);
      expect(res2.error).toContain('At least one service queue is required');
    });
  });
});
