import { Organization, Facility, Service, Desk, Ticket } from '@/types/queue';

export const initialOrganization: Organization = {
  id: 'org-ub',
  name: 'University of Buea',
  slug: 'ubuea',
  category: 'Higher Education',
};

export const initialFacility: Facility = {
  id: 'fac-bursary',
  orgId: 'org-ub',
  name: 'Central Bursary & Student Accounts',
  slug: 'central-bursary',
  location: 'Administration Building, Ground Floor',
};

export const initialServices: Service[] = [
  {
    id: 'srv-fees',
    facilityId: 'fac-bursary',
    name: 'Tuition & Fee Payment',
    codePrefix: 'B',
    description: 'Registration fee clearance, bank slip validation, and receipts.',
    avgServiceMinutes: 5,
    isOpen: true,
  },
  {
    id: 'srv-transcripts',
    facilityId: 'fac-bursary',
    name: 'Official Transcripts & Certificates',
    codePrefix: 'T',
    description: 'Degree attestations, official transcripts, and document verification.',
    avgServiceMinutes: 10,
    isOpen: true,
  },
  {
    id: 'srv-cards',
    facilityId: 'fac-bursary',
    name: 'Student ID & Biometrics',
    codePrefix: 'S',
    description: 'Student badge replacements, photo capture, and smart card activation.',
    avgServiceMinutes: 4,
    isOpen: true,
  },
];

export const initialDesks: Desk[] = [
  {
    id: 'desk-1',
    facilityId: 'fac-bursary',
    number: 1,
    name: 'Desk 1 - Cashier A',
    supportedServiceIds: ['srv-fees'],
    activeStaffName: 'Etonde Marie',
    status: 'open',
  },
  {
    id: 'desk-2',
    facilityId: 'fac-bursary',
    number: 2,
    name: 'Desk 2 - Cashier B',
    supportedServiceIds: ['srv-fees'],
    activeStaffName: 'Nkwenti Roland',
    status: 'open',
  },
  {
    id: 'desk-3',
    facilityId: 'fac-bursary',
    number: 3,
    name: 'Desk 3 - Records & Transcripts',
    supportedServiceIds: ['srv-transcripts'],
    activeStaffName: 'Dr. Taku Comfort',
    status: 'open',
  },
  {
    id: 'desk-4',
    facilityId: 'fac-bursary',
    number: 4,
    name: 'Desk 4 - ID Card Center',
    supportedServiceIds: ['srv-cards'],
    activeStaffName: 'Ashu Divine',
    status: 'open',
  },
];

export const initialTickets: Ticket[] = [
  {
    id: 't-b280',
    ticketNumber: 'B280',
    serviceId: 'srv-fees',
    facilityId: 'fac-bursary',
    customerName: 'Kofi Mensah',
    status: 'completed',
    deskNumber: 1,
    staffName: 'Etonde Marie',
    joinedAt: '2026-10-11T09:10:00Z',
    calledAt: '2026-10-11T09:15:00Z',
    startedAt: '2026-10-11T09:16:00Z',
    completedAt: '2026-10-11T09:22:00Z',
  },
  {
    id: 't-b281',
    ticketNumber: 'B281',
    serviceId: 'srv-fees',
    facilityId: 'fac-bursary',
    customerName: 'Amina Bello',
    customerPhone: '+237 671 22 33 44',
    status: 'in_service',
    deskNumber: 1,
    staffName: 'Etonde Marie',
    joinedAt: '2026-10-11T09:12:00Z',
    calledAt: '2026-10-11T09:23:00Z',
    startedAt: '2026-10-11T09:24:00Z',
  },
  {
    id: 't-b282',
    ticketNumber: 'B282',
    serviceId: 'srv-fees',
    facilityId: 'fac-bursary',
    customerName: 'Samuel Ndip',
    customerPhone: '+237 675 88 99 00',
    status: 'called',
    deskNumber: 2,
    staffName: 'Nkwenti Roland',
    joinedAt: '2026-10-11T09:14:00Z',
    calledAt: '2026-10-11T09:25:00Z',
  },
  {
    id: 't-b283',
    ticketNumber: 'B283',
    serviceId: 'srv-fees',
    facilityId: 'fac-bursary',
    customerName: 'Lucas Fongang',
    status: 'waiting',
    joinedAt: '2026-10-11T09:18:00Z',
  },
  {
    id: 't-b284',
    ticketNumber: 'B284',
    serviceId: 'srv-fees',
    facilityId: 'fac-bursary',
    customerName: 'Wisdom B.',
    customerPhone: '+237 650 11 22 33',
    status: 'waiting',
    joinedAt: '2026-10-11T09:20:00Z',
  },
  {
    id: 't-b285',
    ticketNumber: 'B285',
    serviceId: 'srv-fees',
    facilityId: 'fac-bursary',
    customerName: 'Fabiola N.',
    status: 'waiting',
    joinedAt: '2026-10-11T09:22:00Z',
  },
  {
    id: 't-t101',
    ticketNumber: 'T101',
    serviceId: 'srv-transcripts',
    facilityId: 'fac-bursary',
    customerName: 'George Arrey',
    status: 'in_service',
    deskNumber: 3,
    staffName: 'Dr. Taku Comfort',
    joinedAt: '2026-10-11T09:05:00Z',
    calledAt: '2026-10-11T09:10:00Z',
    startedAt: '2026-10-11T09:12:00Z',
  },
  {
    id: 't-t102',
    ticketNumber: 'T102',
    serviceId: 'srv-transcripts',
    facilityId: 'fac-bursary',
    customerName: 'Bessie Ngando',
    status: 'waiting',
    joinedAt: '2026-10-11T09:21:00Z',
  },
  {
    id: 't-s045',
    ticketNumber: 'S045',
    serviceId: 'srv-cards',
    facilityId: 'fac-bursary',
    customerName: 'Clara Enow',
    status: 'waiting',
    joinedAt: '2026-10-11T09:24:00Z',
  },
];

// ============================================================================
// Multi-Tenant Sample Presets (Unbranded Demonstrations)
// ============================================================================

export interface TenantPreset {
  organization: Organization;
  facility: Facility;
  services: Service[];
  desks: Desk[];
  tickets: Ticket[];
}

export const demoTelecomPreset: TenantPreset = {
  organization: {
    id: 'org-sample-telecom',
    name: 'Apex Telecom Services (Sample)',
    slug: 'sample-telecom',
    category: 'Telecommunications',
  },
  facility: {
    id: 'fac-tel-downtown',
    orgId: 'org-sample-telecom',
    name: 'Downtown Customer Center',
    slug: 'downtown',
    location: '42 Commercial Avenue, Suite 100',
  },
  services: [
    {
      id: 'srv-tel-sim',
      facilityId: 'fac-tel-downtown',
      name: 'SIM Registration & Replacement',
      codePrefix: 'S',
      description: 'SIM card activations, biometric registration, and eSIM provisioning.',
      avgServiceMinutes: 5,
      isOpen: true,
    },
    {
      id: 'srv-tel-bill',
      facilityId: 'fac-tel-downtown',
      name: 'Bill Payment & Cash Desk',
      codePrefix: 'B',
      description: 'Postpaid bill settlement, device purchases, and cash transactions.',
      avgServiceMinutes: 3,
      isOpen: true,
    },
    {
      id: 'srv-tel-care',
      facilityId: 'fac-tel-downtown',
      name: 'Customer Support & Technical Care',
      codePrefix: 'C',
      description: 'Network inquiries, device troubleshooting, and account inquiries.',
      avgServiceMinutes: 8,
      isOpen: true,
    },
  ],
  desks: [
    {
      id: 'desk-tel-1',
      facilityId: 'fac-tel-downtown',
      number: 1,
      name: 'Counter 1 - Fast Cashier',
      supportedServiceIds: ['srv-tel-bill'],
      activeStaffName: 'Nathalie S.',
      status: 'open',
    },
    {
      id: 'desk-tel-2',
      facilityId: 'fac-tel-downtown',
      number: 2,
      name: 'Counter 2 - SIM Desk',
      supportedServiceIds: ['srv-tel-sim'],
      activeStaffName: 'Boris M.',
      status: 'open',
    },
    {
      id: 'desk-tel-3',
      facilityId: 'fac-tel-downtown',
      number: 3,
      name: 'Counter 3 - Technical Care',
      supportedServiceIds: ['srv-tel-care'],
      activeStaffName: 'Arthur K.',
      status: 'open',
    },
  ],
  tickets: [
    {
      id: 't-tel-s101',
      ticketNumber: 'S101',
      serviceId: 'srv-tel-sim',
      facilityId: 'fac-tel-downtown',
      customerName: 'Marcus Vance',
      status: 'waiting',
      joinedAt: new Date(Date.now() - 12 * 60000).toISOString(),
    },
    {
      id: 't-tel-b101',
      ticketNumber: 'B101',
      serviceId: 'srv-tel-bill',
      facilityId: 'fac-tel-downtown',
      customerName: 'Helena Troy',
      status: 'waiting',
      joinedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    },
  ],
};

export const demoHealthPreset: TenantPreset = {
  organization: {
    id: 'org-sample-health',
    name: 'Community Care Clinic (Sample)',
    slug: 'sample-clinic',
    category: 'Healthcare & Clinical',
  },
  facility: {
    id: 'fac-health-opd',
    orgId: 'org-sample-health',
    name: 'Outpatient Triage & Care',
    slug: 'outpatient',
    location: 'Building B, Ground Floor Triage',
  },
  services: [
    {
      id: 'srv-med-triage',
      facilityId: 'fac-health-opd',
      name: 'General Triage & Vitals',
      codePrefix: 'T',
      description: 'Blood pressure, temperature, and nurse assessment.',
      avgServiceMinutes: 4,
      isOpen: true,
    },
    {
      id: 'srv-med-consult',
      facilityId: 'fac-health-opd',
      name: 'Physician Consultation',
      codePrefix: 'C',
      description: 'Outpatient doctor examination and diagnosis.',
      avgServiceMinutes: 12,
      isOpen: true,
    },
    {
      id: 'srv-med-pharm',
      facilityId: 'fac-health-opd',
      name: 'Pharmacy & Dispensing',
      codePrefix: 'P',
      description: 'Prescription pickup and medication counseling.',
      avgServiceMinutes: 3,
      isOpen: true,
    },
  ],
  desks: [
    {
      id: 'desk-med-1',
      facilityId: 'fac-health-opd',
      number: 1,
      name: 'Triage Room 1',
      supportedServiceIds: ['srv-med-triage'],
      activeStaffName: 'Nurse Evelyn',
      status: 'open',
    },
    {
      id: 'desk-med-2',
      facilityId: 'fac-health-opd',
      number: 2,
      name: 'Consultation Room A',
      supportedServiceIds: ['srv-med-consult'],
      activeStaffName: 'Dr. Mensah',
      status: 'open',
    },
    {
      id: 'desk-med-3',
      facilityId: 'fac-health-opd',
      number: 3,
      name: 'Pharmacy Window 1',
      supportedServiceIds: ['srv-med-pharm'],
      activeStaffName: 'Pharm. Daniel',
      status: 'open',
    },
  ],
  tickets: [
    {
      id: 't-med-t101',
      ticketNumber: 'T101',
      serviceId: 'srv-med-triage',
      facilityId: 'fac-health-opd',
      customerName: 'Grace Abena',
      status: 'waiting',
      joinedAt: new Date(Date.now() - 8 * 60000).toISOString(),
    },
  ],
};

export const demoBankPreset: TenantPreset = {
  organization: {
    id: 'org-sample-bank',
    name: 'Metro Trust Bank (Sample)',
    slug: 'sample-bank',
    category: 'Banking & Financial',
  },
  facility: {
    id: 'fac-bank-main',
    orgId: 'org-sample-bank',
    name: 'Main Banking Hall',
    slug: 'main-hall',
    location: '15 Financial District Boulevard',
  },
  services: [
    {
      id: 'srv-bank-cash',
      facilityId: 'fac-bank-main',
      name: 'Cash Deposits & Withdrawals',
      codePrefix: 'C',
      description: 'Over-the-counter teller transactions and check encashment.',
      avgServiceMinutes: 4,
      isOpen: true,
    },
    {
      id: 'srv-bank-cs',
      facilityId: 'fac-bank-main',
      name: 'Customer Relations & Accounts',
      codePrefix: 'A',
      description: 'Account opening, card issuance, and international transfers.',
      avgServiceMinutes: 10,
      isOpen: true,
    },
  ],
  desks: [
    {
      id: 'desk-bank-1',
      facilityId: 'fac-bank-main',
      number: 1,
      name: 'Teller Window 1',
      supportedServiceIds: ['srv-bank-cash'],
      activeStaffName: 'Claire B.',
      status: 'open',
    },
    {
      id: 'desk-bank-2',
      facilityId: 'fac-bank-main',
      number: 2,
      name: 'Customer Relations Desk 1',
      supportedServiceIds: ['srv-bank-cs'],
      activeStaffName: 'Richard N.',
      status: 'open',
    },
  ],
  tickets: [
    {
      id: 't-bank-c101',
      ticketNumber: 'C101',
      serviceId: 'srv-bank-cash',
      facilityId: 'fac-bank-main',
      customerName: 'Samuel O.',
      status: 'waiting',
      joinedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    },
  ],
};

/**
 * Resolves a demo preset by organization slug. Defaults to University of Buea.
 */
export function getDemoTenantData(orgSlug: string = 'ubuea', facilitySlug?: string): TenantPreset {
  const cleanOrg = orgSlug.toLowerCase();
  if (cleanOrg === 'sample-telecom' || cleanOrg === 'telecom-demo') {
    return demoTelecomPreset;
  }
  if (cleanOrg === 'sample-clinic' || cleanOrg === 'health-demo') {
    return demoHealthPreset;
  }
  if (cleanOrg === 'sample-bank' || cleanOrg === 'bank-demo') {
    return demoBankPreset;
  }

  // Primary Default: University of Buea
  return {
    organization: initialOrganization,
    facility: initialFacility,
    services: initialServices,
    desks: initialDesks,
    tickets: initialTickets,
  };
}

/**
 * Returns all sample organizations for directory and demo navigation.
 */
export function getAllDemoOrganizations(): { organization: Organization; facility: Facility }[] {
  return [
    { organization: initialOrganization, facility: initialFacility },
    { organization: demoTelecomPreset.organization, facility: demoTelecomPreset.facility },
    { organization: demoHealthPreset.organization, facility: demoHealthPreset.facility },
    { organization: demoBankPreset.organization, facility: demoBankPreset.facility },
  ];
}
