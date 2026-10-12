export type TicketStatus =
  | 'waiting'
  | 'called'
  | 'in_service'
  | 'completed'
  | 'no_show'
  | 'cancelled'
  | 'transferred';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  category: string;
}

export interface Facility {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  location: string;
}

export interface Service {
  id: string;
  facilityId: string;
  name: string;
  codePrefix: string;
  description: string;
  avgServiceMinutes: number;
  isOpen: boolean;
}

export interface Desk {
  id: string;
  facilityId: string;
  number: number;
  name: string;
  supportedServiceIds: string[];
  activeStaffName?: string;
  status: 'open' | 'closed' | 'break';
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  serviceId: string;
  facilityId: string;
  customerName: string;
  customerPhone?: string;
  status: TicketStatus;
  deskNumber?: number;
  staffName?: string;
  joinedAt: string;
  calledAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface QueueSummary {
  waitingCount: number;
  avgWaitMinutes: number;
  activeDesks: number;
}

export type UserRole = 'operator' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  assignedDeskNumber?: number;
}

