'use client';

import React, { createContext, useContext, useSyncExternalStore, useCallback, useEffect } from 'react';
import { Ticket, Service, Desk, Organization, Facility, TicketStatus } from '@/types/queue';
import {
  initialOrganization,
  initialFacility,
  initialServices,
  initialDesks,
  initialTickets,
  getDemoTenantData,
} from './mock-data';
import {
  generateTicketNumber,
  calculateWaitingAhead,
  calculateEstimatedWaitMinutes,
  processCallNext,
  processTransferTicket,
} from './queue-engine';
import { supabase } from './supabase/client';
import {
  fetchQueueInitialState,
  joinQueueAction,
  callNextAction,
  updateTicketStatusAction,
  updateDeskStatusAction,
  transferTicketAction,
} from '@/app/actions/queue';

interface QueueContextType {
  organization: Organization;
  facility: Facility;
  services: Service[];
  desks: Desk[];
  tickets: Ticket[];
  joinQueue: (serviceId: string, customerName: string, customerPhone?: string) => Ticket;
  callNext: (deskNumber: number) => Ticket | null;
  startService: (ticketId: string) => void;
  completeService: (ticketId: string) => void;
  skipTicket: (ticketId: string) => void;
  cancelTicket: (ticketId: string) => void;
  transferTicket: (ticketId: string, targetServiceId: string) => void;
  getTicket: (ticketId: string) => Ticket | undefined;
  getService: (serviceId: string) => Service | undefined;
  getWaitingAheadCount: (ticket: Ticket) => number;
  getEstimatedWaitMinutes: (ticket: Ticket) => number;
  updateDeskStatus: (deskNumber: number, status: 'open' | 'closed' | 'break') => void;
  addService: (data: Omit<Service, 'id' | 'facilityId'>) => Service;
  updateService: (serviceId: string, updates: Partial<Service>) => void;
  deleteService: (serviceId: string) => void;
  resetToDefault: () => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

const STORAGE_KEY = 'queueflow_state_v1';
const CHANNEL_NAME = 'queueflow_channel';

interface StoredState {
  tickets: Ticket[];
  desks: Desk[];
  services: Service[];
}

const defaultState: StoredState = {
  tickets: initialTickets,
  desks: initialDesks,
  services: initialServices,
};

let memoryState: StoredState = defaultState;
let hasInitializedFromStorage = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function initStorageOnce() {
  if (hasInitializedFromStorage || typeof window === 'undefined') {
    return;
  }
  hasInitializedFromStorage = true;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as StoredState;
      if (parsed.tickets && parsed.desks) {
        memoryState = {
          tickets: parsed.tickets,
          desks: parsed.desks,
          services: parsed.services && parsed.services.length > 0 ? parsed.services : initialServices,
        };
      }
    }
  } catch {
    // fallback to defaultState
  }
}

function getStoredSnapshot(): StoredState {
  initStorageOnce();
  return memoryState;
}

function getServerSnapshot(): StoredState {
  return defaultState;
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  listeners.add(callback);

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue) as StoredState;
        memoryState = {
          tickets: parsed.tickets,
          desks: parsed.desks,
          services: parsed.services || initialServices,
        };
        notify();
      } catch {
        // ignore
      }
    }
  };

  let channel: BroadcastChannel | null = null;
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event) => {
      if (event.data?.type === 'SYNC') {
        memoryState = {
          tickets: event.data.tickets,
          desks: event.data.desks,
          services: event.data.services || memoryState.services,
        };
        notify();
      }
    };
  } catch {
    // BroadcastChannel unsupported
  }

  window.addEventListener('storage', handleStorage);

  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', handleStorage);
    channel?.close();
  };
}

function writeState(
  newTickets: Ticket[],
  newDesks: Desk[],
  newServices: Service[] = memoryState.services
) {
  memoryState = { tickets: newTickets, desks: newDesks, services: newServices };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState));
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: 'SYNC', ...memoryState });
      channel.close();
    }
  } catch {
    // ignore
  }
  notify();
}

interface QueueProviderProps {
  children: React.ReactNode;
  orgSlug?: string;
  facilitySlug?: string;
}

export function QueueProvider({
  children,
  orgSlug = 'ubuea',
  facilitySlug,
}: QueueProviderProps) {
  const demoPreset = React.useMemo(
    () => getDemoTenantData(orgSlug, facilitySlug),
    [orgSlug, facilitySlug]
  );
  const [organization, setOrganization] = React.useState<Organization>(demoPreset.organization);
  const [facility, setFacility] = React.useState<Facility>(demoPreset.facility);

  useEffect(() => {
    const updatedPreset = getDemoTenantData(orgSlug, facilitySlug);
    setOrganization(updatedPreset.organization);
    setFacility(updatedPreset.facility);
  }, [orgSlug, facilitySlug]);

  const state = useSyncExternalStore(subscribe, getStoredSnapshot, getServerSnapshot);
  const tickets = state.tickets;
  const desks = state.desks;
  const services = state.services || initialServices;

  // Sync with Supabase on mount and establish scoped real-time listening
  useEffect(() => {
    let isMounted = true;

    async function loadRemoteState() {
      try {
        const res = await fetchQueueInitialState(orgSlug, facilitySlug);
        if (isMounted && res.success && res.data) {
          setOrganization(res.data.organization);
          setFacility(res.data.facility);
          if (res.data.tickets && res.data.tickets.length > 0) {
            writeState(res.data.tickets, res.data.desks.length > 0 ? res.data.desks : memoryState.desks, res.data.services);
          } else if (res.data.services && res.data.services.length > 0) {
            writeState(memoryState.tickets, res.data.desks, res.data.services);
          }
        }
      } catch (err) {
        console.warn(`Initial Supabase fetch for ${orgSlug}/${facilitySlug || ''} skipped or offline, using cache:`, err);
      }
    }

    loadRemoteState();

    // Supabase Realtime channel strictly filtered to this facility
    const channelName = `queueflow_realtime_${facility.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets', filter: `facility_id=eq.${facility.id}` },
        async () => {
          const res = await fetchQueueInitialState(orgSlug, facilitySlug);
          if (res.success && res.data && res.data.tickets) {
            writeState(res.data.tickets, memoryState.desks, memoryState.services);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'desks', filter: `facility_id=eq.${facility.id}` },
        async () => {
          const res = await fetchQueueInitialState(orgSlug, facilitySlug);
          if (res.success && res.data && res.data.desks) {
            writeState(memoryState.tickets, res.data.desks, memoryState.services);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [facility.id, facilitySlug, orgSlug]);

  const getService = useCallback(
    (serviceId: string) => {
      return services.find((s) => s.id === serviceId);
    },
    [services]
  );

  const getTicket = useCallback(
    (ticketId: string) => {
      return tickets.find(
        (t) => t.id === ticketId || t.ticketNumber.toLowerCase() === ticketId.toLowerCase()
      );
    },
    [tickets]
  );

  const getWaitingAheadCount = useCallback(
    (ticket: Ticket) => {
      return calculateWaitingAhead(tickets, ticket);
    },
    [tickets]
  );

  const getEstimatedWaitMinutes = useCallback(
    (ticket: Ticket) => {
      if (ticket.status !== 'waiting') return 0;
      const ahead = calculateWaitingAhead(tickets, ticket);
      const service = getService(ticket.serviceId);
      const avgMins = service?.avgServiceMinutes ?? 6;

      const activeDesks = desks.filter(
        (d) => d.status === 'open' && d.supportedServiceIds.includes(ticket.serviceId)
      ).length;

      return calculateEstimatedWaitMinutes(ahead, avgMins, activeDesks);
    },
    [desks, getService, tickets]
  );

  const joinQueue = useCallback(
    (serviceId: string, customerName: string, customerPhone?: string): Ticket => {
      const service = getService(serviceId);
      const prefix = service?.codePrefix ?? 'Q';
      const ticketNumber = generateTicketNumber(prefix, tickets);

      const newTicket: Ticket = {
        id: `t-${ticketNumber.toLowerCase()}-${Date.now().toString().slice(-4)}`,
        ticketNumber,
        serviceId,
        facilityId: facility.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone?.trim() || undefined,
        status: 'waiting',
        joinedAt: new Date().toISOString(),
      };

      const updated = [...tickets, newTicket];
      writeState(updated, desks);

      // Async persist in Supabase
      joinQueueAction(serviceId, customerName, customerPhone, facility.id).catch((err) => {
        console.warn('Background Supabase joinQueue failed:', err);
      });

      return newTicket;
    },
    [desks, facility.id, getService, tickets]
  );

  const callNext = useCallback(
    (deskNumber: number): Ticket | null => {
      const { calledTicket, updatedTickets } = processCallNext(desks, tickets, deskNumber);
      if (calledTicket || updatedTickets !== tickets) {
        writeState(updatedTickets, desks);
      }

      // Async call in Supabase with facility isolation
      callNextAction(deskNumber, undefined, facility.id, orgSlug).catch((err) => {
        console.warn('Background Supabase callNext failed:', err);
      });

      return calledTicket;
    },
    [desks, facility.id, orgSlug, tickets]
  );

  const startService = useCallback(
    (ticketId: string) => {
      const updated = tickets.map((t) =>
        t.id === ticketId
          ? { ...t, status: 'in_service' as TicketStatus, startedAt: new Date().toISOString() }
          : t
      );
      writeState(updated, desks);
      updateTicketStatusAction(ticketId, 'in_service', undefined, facility.id).catch((err) => {
        console.warn('Background Supabase startService failed:', err);
      });
    },
    [desks, facility.id, tickets]
  );

  const completeService = useCallback(
    (ticketId: string) => {
      const updated = tickets.map((t) =>
        t.id === ticketId
          ? { ...t, status: 'completed' as TicketStatus, completedAt: new Date().toISOString() }
          : t
      );
      writeState(updated, desks);
      updateTicketStatusAction(ticketId, 'completed', undefined, facility.id).catch((err) => {
        console.warn('Background Supabase completeService failed:', err);
      });
    },
    [desks, facility.id, tickets]
  );

  const skipTicket = useCallback(
    (ticketId: string) => {
      const updated = tickets.map((t) =>
        t.id === ticketId ? { ...t, status: 'no_show' as TicketStatus } : t
      );
      writeState(updated, desks);
      updateTicketStatusAction(ticketId, 'no_show', undefined, facility.id).catch((err) => {
        console.warn('Background Supabase skipTicket failed:', err);
      });
    },
    [desks, facility.id, tickets]
  );

  const cancelTicket = useCallback(
    (ticketId: string) => {
      const updated = tickets.map((t) =>
        t.id === ticketId ? { ...t, status: 'cancelled' as TicketStatus } : t
      );
      writeState(updated, desks);
      updateTicketStatusAction(ticketId, 'cancelled', undefined, facility.id).catch((err) => {
        console.warn('Background Supabase cancelTicket failed:', err);
      });
    },
    [desks, facility.id, tickets]
  );

  const transferTicket = useCallback(
    (ticketId: string, targetServiceId: string) => {
      const { transferredTicket, updatedTickets } = processTransferTicket(
        tickets,
        ticketId,
        targetServiceId
      );
      if (transferredTicket) {
        writeState(updatedTickets, desks);
        transferTicketAction(ticketId, targetServiceId, undefined, facility.id).catch((err) => {
          console.warn('Background Supabase transferTicket failed:', err);
        });
      }
    },
    [desks, facility.id, tickets]
  );

  const updateDeskStatus = useCallback(
    (deskNumber: number, status: 'open' | 'closed' | 'break') => {
      const updatedDesks = desks.map((d) =>
        d.number === deskNumber ? { ...d, status } : d
      );
      writeState(tickets, updatedDesks);
      updateDeskStatusAction(deskNumber, status, facility.id).catch((err) => {
        console.warn('Background Supabase updateDeskStatus failed:', err);
      });
    },
    [desks, facility.id, tickets]
  );

  const addService = useCallback(
    (data: Omit<Service, 'id' | 'facilityId'>) => {
      const newService: Service = {
        ...data,
        id: `srv-${Date.now().toString().slice(-6)}`,
        facilityId: facility.id,
      };
      const updatedServices = [...services, newService];
      // Automatically associate the new service with open desks so counters can call tickets
      const updatedDesks = desks.map((d) => ({
        ...d,
        supportedServiceIds: d.supportedServiceIds.includes(newService.id)
          ? d.supportedServiceIds
          : [...d.supportedServiceIds, newService.id],
      }));
      writeState(tickets, updatedDesks, updatedServices);
      return newService;
    },
    [desks, facility.id, services, tickets]
  );

  const updateService = useCallback(
    (serviceId: string, updates: Partial<Service>) => {
      const updatedServices = services.map((s) =>
        s.id === serviceId ? { ...s, ...updates } : s
      );
      writeState(tickets, desks, updatedServices);
    },
    [desks, services, tickets]
  );

  const deleteService = useCallback(
    (serviceId: string) => {
      const updatedServices = services.filter((s) => s.id !== serviceId);
      writeState(tickets, desks, updatedServices);
    },
    [desks, services, tickets]
  );

  const resetToDefault = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    writeState(demoPreset.tickets, demoPreset.desks, demoPreset.services);
  }, [demoPreset.desks, demoPreset.services, demoPreset.tickets]);

  return (
    <QueueContext.Provider
      value={{
        organization,
        facility,
        services,
        desks,
        tickets,
        joinQueue,
        callNext,
        startService,
        completeService,
        skipTicket,
        cancelTicket,
        transferTicket,
        getTicket,
        getService,
        getWaitingAheadCount,
        getEstimatedWaitMinutes,
        updateDeskStatus,
        addService,
        updateService,
        deleteService,
        resetToDefault,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
}
