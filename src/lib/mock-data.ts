import { Organization, Facility, Service, Desk, Ticket } from '@/types/queue';

// ============================================================================
// Authoritative Organization & Facility Defaults (University of Buea Preset)
// ============================================================================

export const initialOrganization: Organization = {
  id: 'debcd2ae-5875-4cef-829e-14583a7f0138',
  name: 'University of Buea',
  slug: 'ubuea',
  category: 'Higher Education',
};

export const initialFacility: Facility = {
  id: '83acffa3-28fc-419c-ba16-0a293608fc46',
  orgId: 'debcd2ae-5875-4cef-829e-14583a7f0138',
  name: 'Central Bursary & Student Accounts',
  slug: 'central-bursary',
  location: 'Administration Building, Ground Floor, Molyko Campus',
};

export const initialServices: Service[] = [
  {
    id: '1b1149fa-5673-4d74-9b19-55885b396c13',
    facilityId: '83acffa3-28fc-419c-ba16-0a293608fc46',
    name: 'Tuition & Fee Payment',
    codePrefix: 'B',
    description: 'Registration fee clearance, bank slip validation, and receipts.',
    avgServiceMinutes: 5,
    isOpen: true,
  },
  {
    id: 'bd0ebfc4-a463-48d9-a899-6f035ff8f173',
    facilityId: '83acffa3-28fc-419c-ba16-0a293608fc46',
    name: 'Official Transcripts & Certificates',
    codePrefix: 'T',
    description: 'Degree attestations, official transcripts, and document verification.',
    avgServiceMinutes: 10,
    isOpen: true,
  },
  {
    id: '52bc0cdb-3a37-4dc9-8cad-954584e8936a',
    facilityId: '83acffa3-28fc-419c-ba16-0a293608fc46',
    name: 'Student ID & Biometrics',
    codePrefix: 'S',
    description: 'Student badge replacements, photo capture, and smart card activation.',
    avgServiceMinutes: 4,
    isOpen: true,
  },
];

export const initialDesks: Desk[] = [
  {
    id: '8f86e5ec-7e94-4639-a3cd-a4cc013fd5a8',
    facilityId: '83acffa3-28fc-419c-ba16-0a293608fc46',
    number: 1,
    name: 'Desk 1 - Cashier A',
    supportedServiceIds: ['1b1149fa-5673-4d74-9b19-55885b396c13'],
    activeStaffName: 'Etonde Marie',
    status: 'open',
  },
  {
    id: '52a2863f-09c6-48d5-9c4a-c4eb70157614',
    facilityId: '83acffa3-28fc-419c-ba16-0a293608fc46',
    number: 2,
    name: 'Desk 2 - Cashier B',
    supportedServiceIds: ['1b1149fa-5673-4d74-9b19-55885b396c13'],
    activeStaffName: 'Tabe Roland',
    status: 'open',
  },
  {
    id: '64d9575e-5214-4971-aa96-fa5be8184790',
    facilityId: '83acffa3-28fc-419c-ba16-0a293608fc46',
    number: 3,
    name: 'Desk 3 - Records & Transcripts',
    supportedServiceIds: ['bd0ebfc4-a463-48d9-a899-6f035ff8f173'],
    activeStaffName: 'Ngwa Kenneth',
    status: 'open',
  },
  {
    id: '8a412cdf-e177-4442-be30-136e8124a36c',
    facilityId: '83acffa3-28fc-419c-ba16-0a293608fc46',
    number: 4,
    name: 'Desk 4 - ID Cards & Biometrics',
    supportedServiceIds: ['52bc0cdb-3a37-4dc9-8cad-954584e8936a'],
    activeStaffName: 'Bessong Clara',
    status: 'open',
  },
];

// In production, tickets are dynamic and loaded live from database or customer arrivals.
export const initialTickets: Ticket[] = [];

// ============================================================================
// Multi-Tenant Authoritative Industry Presets
// ============================================================================

export interface TenantPreset {
  organization: Organization;
  facility: Facility;
  services: Service[];
  desks: Desk[];
  tickets: Ticket[];
}

// 1. Telecom Preset (Metropolitan Telecom)
export const demoTelecomPreset: TenantPreset = {
  organization: {
    id: 'b1010000-0000-4000-8000-000000000001',
    name: 'Metropolitan Telecom',
    slug: 'sample-telecom',
    category: 'Telecommunications',
  },
  facility: {
    id: 'b2010000-0000-4000-8000-000000000001',
    orgId: 'b1010000-0000-4000-8000-000000000001',
    name: 'Downtown Customer Service Center',
    slug: 'downtown',
    location: '42 Commercial Avenue, Suite 100',
  },
  services: [
    {
      id: 'b3010000-0000-4000-8000-000000000001',
      facilityId: 'b2010000-0000-4000-8000-000000000001',
      name: 'SIM Registration & Replacement',
      codePrefix: 'S',
      description: 'SIM card activations, biometric registration, and eSIM provisioning.',
      avgServiceMinutes: 5,
      isOpen: true,
    },
    {
      id: 'b3010000-0000-4000-8000-000000000002',
      facilityId: 'b2010000-0000-4000-8000-000000000001',
      name: 'Postpaid Billing & Cash Desk',
      codePrefix: 'B',
      description: 'Postpaid bill settlement, device purchases, and cash transactions.',
      avgServiceMinutes: 4,
      isOpen: true,
    },
    {
      id: 'b3010000-0000-4000-8000-000000000003',
      facilityId: 'b2010000-0000-4000-8000-000000000001',
      name: 'Technical Device & Fiber Support',
      codePrefix: 'C',
      description: 'Network inquiries, device troubleshooting, and account inquiries.',
      avgServiceMinutes: 8,
      isOpen: true,
    },
  ],
  desks: [
    {
      id: 'b4010000-0000-4000-8000-000000000001',
      facilityId: 'b2010000-0000-4000-8000-000000000001',
      number: 1,
      name: 'Counter 1 - Fast Cashier & Billing',
      supportedServiceIds: ['b3010000-0000-4000-8000-000000000002'],
      activeStaffName: 'Nathalie S.',
      status: 'open',
    },
    {
      id: 'b4010000-0000-4000-8000-000000000002',
      facilityId: 'b2010000-0000-4000-8000-000000000001',
      number: 2,
      name: 'Counter 2 - SIM Registration Desk',
      supportedServiceIds: ['b3010000-0000-4000-8000-000000000001'],
      activeStaffName: 'Boris M.',
      status: 'open',
    },
    {
      id: 'b4010000-0000-4000-8000-000000000003',
      facilityId: 'b2010000-0000-4000-8000-000000000001',
      number: 3,
      name: 'Counter 3 - Technical Support Desk',
      supportedServiceIds: ['b3010000-0000-4000-8000-000000000003'],
      activeStaffName: 'Arthur K.',
      status: 'open',
    },
  ],
  tickets: [],
};

// 2. Clinical Preset (St. Jude Community Health)
export const demoHealthPreset: TenantPreset = {
  organization: {
    id: 'c1010000-0000-4000-8000-000000000001',
    name: 'St. Jude Community Health',
    slug: 'sample-clinic',
    category: 'Healthcare & Clinical',
  },
  facility: {
    id: 'c2010000-0000-4000-8000-000000000001',
    orgId: 'c1010000-0000-4000-8000-000000000001',
    name: 'Main Outpatient Clinic & Diagnostics',
    slug: 'outpatient',
    location: 'Building B, Ground Floor Triage Center',
  },
  services: [
    {
      id: 'c3010000-0000-4000-8000-000000000001',
      facilityId: 'c2010000-0000-4000-8000-000000000001',
      name: 'General Triage & Vital Signs',
      codePrefix: 'T',
      description: 'Blood pressure, temperature, and nurse assessment.',
      avgServiceMinutes: 4,
      isOpen: true,
    },
    {
      id: 'c3010000-0000-4000-8000-000000000002',
      facilityId: 'c2010000-0000-4000-8000-000000000001',
      name: 'Physician Consultation Room',
      codePrefix: 'C',
      description: 'Outpatient doctor examination and diagnosis.',
      avgServiceMinutes: 12,
      isOpen: true,
    },
    {
      id: 'c3010000-0000-4000-8000-000000000003',
      facilityId: 'c2010000-0000-4000-8000-000000000001',
      name: 'Pharmacy & Medication Dispensing',
      codePrefix: 'P',
      description: 'Prescription pickup and medication counseling.',
      avgServiceMinutes: 4,
      isOpen: true,
    },
  ],
  desks: [
    {
      id: 'c4010000-0000-4000-8000-000000000001',
      facilityId: 'c2010000-0000-4000-8000-000000000001',
      number: 1,
      name: 'Triage Room 1',
      supportedServiceIds: ['c3010000-0000-4000-8000-000000000001'],
      activeStaffName: 'Nurse Evelyn',
      status: 'open',
    },
    {
      id: 'c4010000-0000-4000-8000-000000000002',
      facilityId: 'c2010000-0000-4000-8000-000000000001',
      number: 2,
      name: 'Consultation Room A',
      supportedServiceIds: ['c3010000-0000-4000-8000-000000000002'],
      activeStaffName: 'Dr. Mensah',
      status: 'open',
    },
    {
      id: 'c4010000-0000-4000-8000-000000000003',
      facilityId: 'c2010000-0000-4000-8000-000000000001',
      number: 3,
      name: 'Pharmacy Window 1',
      supportedServiceIds: ['c3010000-0000-4000-8000-000000000003'],
      activeStaffName: 'Pharm. Daniel',
      status: 'open',
    },
  ],
  tickets: [],
};

// 3. Retail Banking Preset (Apex Commercial Bank)
export const demoBankPreset: TenantPreset = {
  organization: {
    id: 'd1010000-0000-4000-8000-000000000001',
    name: 'Apex Commercial Bank',
    slug: 'sample-bank',
    category: 'Retail Banking',
  },
  facility: {
    id: 'd2010000-0000-4000-8000-000000000001',
    orgId: 'd1010000-0000-4000-8000-000000000001',
    name: 'Corporate Banking Branch',
    slug: 'main-hall',
    location: '15 Financial District Boulevard',
  },
  services: [
    {
      id: 'd3010000-0000-4000-8000-000000000001',
      facilityId: 'd2010000-0000-4000-8000-000000000001',
      name: 'Cash Deposits & Withdrawals',
      codePrefix: 'C',
      description: 'Over-the-counter teller transactions and check encashment.',
      avgServiceMinutes: 4,
      isOpen: true,
    },
    {
      id: 'd3010000-0000-4000-8000-000000000002',
      facilityId: 'd2010000-0000-4000-8000-000000000001',
      name: 'Account Operations & Customer Care',
      codePrefix: 'A',
      description: 'Account opening, card issuance, and customer support.',
      avgServiceMinutes: 8,
      isOpen: true,
    },
    {
      id: 'd3010000-0000-4000-8000-000000000003',
      facilityId: 'd2010000-0000-4000-8000-000000000001',
      name: 'Foreign Exchange & Wire Transfers',
      codePrefix: 'F',
      description: 'International remittance, wire transfers, and currency exchange.',
      avgServiceMinutes: 6,
      isOpen: true,
    },
  ],
  desks: [
    {
      id: 'd4010000-0000-4000-8000-000000000001',
      facilityId: 'd2010000-0000-4000-8000-000000000001',
      number: 1,
      name: 'Teller Window 1',
      supportedServiceIds: ['d3010000-0000-4000-8000-000000000001'],
      activeStaffName: 'Claire B.',
      status: 'open',
    },
    {
      id: 'd4010000-0000-4000-8000-000000000002',
      facilityId: 'd2010000-0000-4000-8000-000000000001',
      number: 2,
      name: 'Teller Window 2',
      supportedServiceIds: ['d3010000-0000-4000-8000-000000000001'],
      activeStaffName: 'Patrick N.',
      status: 'open',
    },
    {
      id: 'd4010000-0000-4000-8000-000000000003',
      facilityId: 'd2010000-0000-4000-8000-000000000001',
      number: 3,
      name: 'Customer Relations Executive',
      supportedServiceIds: ['d3010000-0000-4000-8000-000000000002', 'd3010000-0000-4000-8000-000000000003'],
      activeStaffName: 'Diane T.',
      status: 'open',
    },
  ],
  tickets: [],
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
