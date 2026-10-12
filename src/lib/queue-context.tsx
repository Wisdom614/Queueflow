'use client';

import React, { createContext, useContext, useSyncExternalStore, useCallback, useEffect } from 'react';
import { Ticket, Service, Desk, Organization, Facility, TicketStatus } from '@/types/queue';
import {
  initialOrganization,
  initialFacility,
  initialServices,
  initialDesks,
  initialTickets,
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
  resetToDefault: () => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

const STORAGE_KEY = 'queueflow_state_v1';
const CHANNEL_NAME = 'queueflow_channel';

interface StoredState {
  tickets: Ticket[];
  desks: Desk[];
}

const defaultState: StoredState = {
  tickets: initialTickets,
  desks: initialDesks,
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
        memoryState = parsed;
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
        memoryState = JSON.parse(e.newValue) as StoredState;
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
        memoryState = { tickets: event.data.tickets, desks: event.data.desks };
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

function writeState(newTickets: Ticket[], newDesks: Desk[]) {
  memoryState = { tickets: newTickets, desks: newDesks };
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

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, getStoredSnapshot, getServerSnapshot);
  const tickets = state.tickets;
  const desks = state.desks;

  // Sync with Supabase on mount and establish real-time listening
  useEffect(() => {
    let isMounted = true;

    async function loadRemoteState() {
      try {
        const res = await fetchQueueInitialState();
        if (isMounted && res.success && res.data) {
          // If Supabase has today tickets, merge or write
          if (res.data.tickets && res.data.tickets.length > 0) {
            writeState(res.data.tickets, res.data.desks.length > 0 ? res.data.desks : memoryState.desks);
          }
        }
      } catch (err) {
        console.warn('Initial Supabase fetch skipped or offline, using cache:', err);
      }
    }

    loadRemoteState();

    // Supabase Realtime channel
    const channel = supabase
      .channel('queueflow_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        async () => {
          const res = await fetchQueueInitialState();
          if (res.success && res.data && res.data.tickets) {
            writeState(res.data.tickets, memoryState.desks);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'desks' },
        async () => {
          const res = await fetchQueueInitialState();
          if (res.success && res.data && res.data.desks) {
            writeState(memoryState.tickets, res.data.desks);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const getService = useCallback((serviceId: string) => {
    return initialServices.find((s) => s.id === serviceId);
  }, []);

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
        facilityId: initialFacility.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone?.trim() || undefined,
        status: 'waiting',
        joinedAt: new Date().toISOString(),
      };

      const updated = [...tickets, newTicket];
      writeState(updated, desks);

      // Async persist in Supabase
      joinQueueAction(serviceId, customerName, customerPhone).catch((err) => {
        console.warn('Background Supabase joinQueue failed:', err);
      });

      return newTicket;
    },
    [desks, getService, tickets]
  );

  const callNext = useCallback(
    (deskNumber: number): Ticket | null => {
      const { calledTicket, updatedTickets } = processCallNext(desks, tickets, deskNumber);
      if (calledTicket || updatedTickets !== tickets) {
        writeState(updatedTickets, desks);
      }

      // Async call in Supabase
      callNextAction(deskNumber).catch((err) => {
        console.warn('Background Supabase callNext failed:', err);
      });

      return calledTicket;
    },
    [desks, tickets]
  );

  const startService = useCallback(
    (ticketId: string) => {
      const updated = tickets.map((t) =>
        t.id === ticketId
          ? { ...t, status: 'in_service' as TicketStatus, startedAt: new Date().toISOString() }
          : t
      );
      writeState(updated, desks);
      updateTicketStatusAction(ticketId, 'in_service').catch((err) => {
        console.warn('Background Supabase startService failed:', err);
      });
    },
    [desks, tickets]
  );

  const completeService = useCallback(
    (ticketId: string) => {
      const updated = tickets.map((t) =>
        t.id === ticketId
          ? { ...t, status: 'completed' as TicketStatus, completedAt: new Date().toISOString() }
          : t
      );
      writeState(updated, desks);
      updateTicketStatusAction(ticketId, 'completed').catch((err) => {
        console.warn('Background Supabase completeService failed:', err);
      });
    },
    [desks, tickets]
  );

  const skipTicket = useCallback(
    (ticketId: string) => {
      const updated = tickets.map((t) =>
        t.id === ticketId ? { ...t, status: 'no_show' as TicketStatus } : t
      );
      writeState(updated, desks);
      updateTicketStatusAction(ticketId, 'no_show').catch((err) => {
        console.warn('Background Supabase skipTicket failed:', err);
      });
    },
    [desks, tickets]
  );

  const cancelTicket = useCallback(
    (ticketId: string) => {
      const updated = tickets.map((t) =>
        t.id === ticketId ? { ...t, status: 'cancelled' as TicketStatus } : t
      );
      writeState(updated, desks);
      updateTicketStatusAction(ticketId, 'cancelled').catch((err) => {
        console.warn('Background Supabase cancelTicket failed:', err);
      });
    },
    [desks, tickets]
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
        transferTicketAction(ticketId, targetServiceId).catch((err) => {
          console.warn('Background Supabase transferTicket failed:', err);
        });
      }
    },
    [desks, tickets]
  );

  const updateDeskStatus = useCallback(
    (deskNumber: number, status: 'open' | 'closed' | 'break') => {
      const updatedDesks = desks.map((d) =>
        d.number === deskNumber ? { ...d, status } : d
      );
      writeState(tickets, updatedDesks);
      updateDeskStatusAction(deskNumber, status).catch((err) => {
        console.warn('Background Supabase updateDeskStatus failed:', err);
      });
    },
    [desks, tickets]
  );

  const resetToDefault = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    writeState(initialTickets, initialDesks);
  }, []);

  return (
    <QueueContext.Provider
      value={{
        organization: initialOrganization,
        facility: initialFacility,
        services: initialServices,
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
