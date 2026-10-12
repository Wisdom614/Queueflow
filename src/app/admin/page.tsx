'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQueue } from '@/lib/queue-context';
import { TicketStatus, Service } from '@/types/queue';
import { AuthGuard } from '@/components/AuthGuard';
import { QRCodeModal } from '@/components/QRCodeModal';
import { ServiceConfigModal } from '@/components/ServiceConfigModal';

export default function AdminPage() {
  const {
    organization,
    facility,
    services,
    desks,
    tickets,
    updateDeskStatus,
    cancelTicket,
    skipTicket,
    resetToDefault,
    addService,
    updateService,
  } = useQueue();

  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [resetConfirm, setResetConfirm] = useState(false);

  // Modal states for QR Codes & Service Configuration
  const [qrModal, setQrModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    url: string;
    serviceCode?: string;
  }>({
    isOpen: false,
    title: '',
    subtitle: '',
    url: '',
  });

  const [serviceModal, setServiceModal] = useState<{
    isOpen: boolean;
    service: Service | null;
  }>({
    isOpen: false,
    service: null,
  });

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://queueflow.app';

  const handleOpenFacilityQR = () => {
    setQrModal({
      isOpen: true,
      title: `${facility.name} — Lobby Portal`,
      subtitle: 'Scan at entrance to select a service and take a virtual ticket',
      url: `${origin}/join`,
    });
  };

  const handleOpenServiceQR = (service: Service) => {
    setQrModal({
      isOpen: true,
      title: service.name,
      subtitle: `Direct shortcut queue for ${service.name}`,
      url: `${origin}/join?service=${service.id}`,
      serviceCode: service.codePrefix,
    });
  };

  const handleSaveService = (data: Omit<Service, 'id' | 'facilityId'>) => {
    if (serviceModal.service) {
      updateService(serviceModal.service.id, data);
    } else {
      addService(data);
    }
    setServiceModal({ isOpen: false, service: null });
  };

  // Computed KPIs
  const totalTickets = tickets.length;
  const waitingTickets = useMemo(() => tickets.filter((t) => t.status === 'waiting'), [tickets]);
  const activeTickets = useMemo(
    () => tickets.filter((t) => t.status === 'called' || t.status === 'in_service'),
    [tickets]
  );
  const completedTickets = useMemo(
    () => tickets.filter((t) => t.status === 'completed'),
    [tickets]
  );
  const noShowTickets = useMemo(() => tickets.filter((t) => t.status === 'no_show'), [tickets]);
  const cancelledTickets = useMemo(
    () => tickets.filter((t) => t.status === 'cancelled'),
    [tickets]
  );

  const openDesksCount = desks.filter((d) => d.status === 'open').length;

  // Average wait time calculation for completed or currently active tickets
  const avgWaitMinutes = useMemo(() => {
    const serviced = tickets.filter((t) => t.calledAt && t.joinedAt);
    if (serviced.length === 0) return 6;
    const totalMinutes = serviced.reduce((acc, t) => {
      const diffMs = new Date(t.calledAt!).getTime() - new Date(t.joinedAt).getTime();
      return acc + Math.max(1, Math.round(diffMs / 60000));
    }, 0);
    return Math.round(totalMinutes / serviced.length);
  }, [tickets]);

  // Filtered tickets list
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesSearch =
        searchQuery === '' ||
        t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.customerPhone && t.customerPhone.includes(searchQuery));
      return matchesStatus && matchesSearch;
    });
  }, [tickets, statusFilter, searchQuery]);

  return (
    <AuthGuard requiredRole="admin">
      <main className="min-h-screen bg-[#f8f8f5] text-[#17201d] pb-20">
      {/* Header Bar */}
      <section className="border-b border-[#cfd4cd] bg-white px-4 sm:px-8 py-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#56605b]">
                {organization.name}
              </span>
              <span className="text-xs text-[#cfd4cd]">•</span>
              <span className="font-mono text-xs uppercase tracking-wider text-[#56605b]">
                {facility.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17201d] mt-1">
              Facility Command & Analytics
            </h1>
          </div>

          {/* Quick Actions & Live Heartbeat */}
          <div className="flex items-center flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 border border-[#cfd4cd] bg-[#f8f8f5] font-mono text-xs">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold">ENGINE ACTIVE</span>
            </div>

            <Link
              href="/staff"
              className="px-3 py-1.5 border border-[#17201d] bg-white font-mono text-xs font-bold hover:bg-[#f3f4f1] transition-colors"
            >
              Staff Console →
            </Link>

            <Link
              href="/display"
              className="px-3 py-1.5 border border-[#17201d] bg-[#17201d] text-[#e9ff6a] font-mono text-xs font-bold hover:bg-[#2c3832] transition-colors"
            >
              Lobby Board →
            </Link>

            <button
              type="button"
              onClick={handleOpenFacilityQR}
              className="px-3 py-1.5 border border-[#17201d] bg-white font-mono text-xs font-bold text-[#17201d] hover:bg-[#f3f4f1] transition-colors flex items-center gap-1.5"
            >
              <span>Entrance QR</span>
              <span className="text-[10px] bg-[#17201d] text-[#e9ff6a] px-1 py-0.2">POSTER</span>
            </button>

            {!resetConfirm ? (
              <button
                type="button"
                onClick={() => setResetConfirm(true)}
                className="px-3 py-1.5 border border-rose-300 text-rose-700 font-mono text-xs hover:bg-rose-50 transition-colors"
              >
                Reset Demo Data
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    resetToDefault();
                    setResetConfirm(false);
                  }}
                  className="px-3 py-1.5 bg-rose-600 text-white font-mono text-xs font-bold hover:bg-rose-700 transition-colors"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setResetConfirm(false)}
                  className="px-2 py-1.5 border border-[#cfd4cd] font-mono text-xs hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-8 mt-8 space-y-8">
        {/* KPI Metrics Matrix */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Waiting */}
          <div className="p-4 sm:p-5 border-2 border-[#17201d] bg-white shadow-[4px_4px_0_#17201d]">
            <span className="font-mono text-[11px] font-bold uppercase text-[#56605b] block">
              Waiting Now
            </span>
            <span className="font-mono text-3xl sm:text-4xl font-black text-[#17201d] block mt-1">
              {waitingTickets.length}
            </span>
            <span className="font-mono text-[10px] text-amber-700 mt-2 block font-medium">
              In Queue
            </span>
          </div>

          {/* Active At Desks */}
          <div className="p-4 sm:p-5 border-2 border-[#17201d] bg-[#17201d] text-white shadow-[4px_4px_0_#17201d]">
            <span className="font-mono text-[11px] font-bold uppercase text-[#e9ff6a] block">
              In Service
            </span>
            <span className="font-mono text-3xl sm:text-4xl font-black text-white block mt-1">
              {activeTickets.length}
            </span>
            <span className="font-mono text-[10px] text-[#aeb9b1] mt-2 block font-medium">
              At {openDesksCount} active desks
            </span>
          </div>

          {/* Completed */}
          <div className="p-4 sm:p-5 border-2 border-[#17201d] bg-white shadow-[4px_4px_0_#17201d]">
            <span className="font-mono text-[11px] font-bold uppercase text-[#56605b] block">
              Completed
            </span>
            <span className="font-mono text-3xl sm:text-4xl font-black text-emerald-700 block mt-1">
              {completedTickets.length}
            </span>
            <span className="font-mono text-[10px] text-[#56605b] mt-2 block font-medium">
              Served today
            </span>
          </div>

          {/* Avg Wait Minutes */}
          <div className="p-4 sm:p-5 border-2 border-[#17201d] bg-white shadow-[4px_4px_0_#17201d]">
            <span className="font-mono text-[11px] font-bold uppercase text-[#56605b] block">
              Avg Wait Time
            </span>
            <span className="font-mono text-3xl sm:text-4xl font-black text-[#17201d] block mt-1">
              {avgWaitMinutes}m
            </span>
            <span className="font-mono text-[10px] text-[#56605b] mt-2 block font-medium">
              Across services
            </span>
          </div>

          {/* Total Flow */}
          <div className="p-4 sm:p-5 border-2 border-[#17201d] bg-white shadow-[4px_4px_0_#17201d]">
            <span className="font-mono text-[11px] font-bold uppercase text-[#56605b] block">
              Total Volume
            </span>
            <span className="font-mono text-3xl sm:text-4xl font-black text-[#17201d] block mt-1">
              {totalTickets}
            </span>
            <span className="font-mono text-[10px] text-[#56605b] mt-2 block font-medium">
              All transactions
            </span>
          </div>

          {/* No Show Rate */}
          <div className="p-4 sm:p-5 border-2 border-[#17201d] bg-white shadow-[4px_4px_0_#17201d]">
            <span className="font-mono text-[11px] font-bold uppercase text-[#56605b] block">
              No-Show Rate
            </span>
            <span className="font-mono text-3xl sm:text-4xl font-black text-[#17201d] block mt-1">
              {totalTickets > 0 ? Math.round((noShowTickets.length / totalTickets) * 100) : 0}%
            </span>
            <span className="font-mono text-[10px] text-rose-600 mt-2 block font-medium">
              {noShowTickets.length} skipped / {cancelledTickets.length} cancelled
            </span>
          </div>
        </section>

        {/* Operational Grid: Desks Management & Services Overview */}
        <section className="grid lg:grid-cols-2 gap-8">
          {/* Desks Management */}
          <div className="border-2 border-[#17201d] bg-white p-5 sm:p-6 shadow-[6px_6px_0_#17201d]">
            <div className="flex items-center justify-between border-b border-[#cfd4cd] pb-3 mb-4">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-[#56605b]">
                  Live Allocation
                </span>
                <h2 className="text-lg font-bold text-[#17201d]">Active Desks & Counter Staff</h2>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 bg-[#f8f8f5] border border-[#cfd4cd] font-semibold">
                {openDesksCount} of {desks.length} Open
              </span>
            </div>

            <div className="space-y-3">
              {desks.map((desk) => {
                const currentTicket = tickets.find(
                  (t) =>
                    t.deskNumber === desk.number &&
                    (t.status === 'called' || t.status === 'in_service')
                );

                return (
                  <div
                    key={desk.id}
                    className="p-4 border border-[#cfd4cd] bg-[#f8f8f5] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black bg-[#17201d] text-white px-2 py-0.5">
                          DESK {desk.number}
                        </span>
                        <span className="font-bold text-sm text-[#17201d]">{desk.name}</span>
                        <span
                          className={`font-mono text-[10px] uppercase px-2 py-0.5 font-bold ${
                            desk.status === 'open'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : desk.status === 'break'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-gray-200 text-gray-700 border border-gray-300'
                          }`}
                        >
                          {desk.status}
                        </span>
                      </div>

                      <div className="font-mono text-xs text-[#56605b] mt-1.5 flex items-center gap-2">
                        <span>Staff: {desk.activeStaffName || 'Unassigned'}</span>
                        {currentTicket && (
                          <span className="text-[#17201d] font-bold bg-[#e9ff6a] px-1.5 py-0.2">
                            Serving: {currentTicket.ticketNumber} ({currentTicket.customerName})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Desk Status Controls */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => updateDeskStatus(desk.number, 'open')}
                        disabled={desk.status === 'open'}
                        className={`px-2.5 py-1 font-mono text-xs font-bold uppercase transition-colors ${
                          desk.status === 'open'
                            ? 'bg-[#17201d] text-[#e9ff6a] cursor-default'
                            : 'bg-white border border-[#cfd4cd] hover:border-[#17201d] text-[#17201d]'
                        }`}
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => updateDeskStatus(desk.number, 'break')}
                        disabled={desk.status === 'break'}
                        className={`px-2.5 py-1 font-mono text-xs font-bold uppercase transition-colors ${
                          desk.status === 'break'
                            ? 'bg-amber-500 text-white cursor-default'
                            : 'bg-white border border-[#cfd4cd] hover:border-[#17201d] text-[#17201d]'
                        }`}
                      >
                        Break
                      </button>
                      <button
                        type="button"
                        onClick={() => updateDeskStatus(desk.number, 'closed')}
                        disabled={desk.status === 'closed'}
                        className={`px-2.5 py-1 font-mono text-xs font-bold uppercase transition-colors ${
                          desk.status === 'closed'
                            ? 'bg-gray-700 text-white cursor-default'
                            : 'bg-white border border-[#cfd4cd] hover:border-[#17201d] text-[#17201d]'
                        }`}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Services Health & Configuration */}
          <div className="border-2 border-[#17201d] bg-white p-5 sm:p-6 shadow-[6px_6px_0_#17201d]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#cfd4cd] pb-3 mb-4 gap-3">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-[#56605b]">
                  Service Queues & Entry Points
                </span>
                <h2 className="text-lg font-bold text-[#17201d]">Services & QR Configurations</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenFacilityQR}
                  className="px-3 py-1.5 bg-[#17201d] text-[#e9ff6a] font-mono text-xs font-bold hover:bg-[#2c3832] transition-colors flex items-center gap-1.5 shadow-[2px_2px_0_#cfd4cd]"
                >
                  <span>Lobby QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setServiceModal({ isOpen: true, service: null })}
                  className="px-3 py-1.5 border border-[#17201d] bg-white text-[#17201d] font-mono text-xs font-bold hover:bg-[#f3f4f1] transition-colors"
                >
                  + Add Service
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {services.map((service) => {
                const serviceWaiting = waitingTickets.filter((t) => t.serviceId === service.id);
                const serviceServed = tickets.filter(
                  (t) => t.serviceId === service.id && t.status === 'completed'
                );

                return (
                  <div
                    key={service.id}
                    className="p-4 border border-[#cfd4cd] bg-[#f8f8f5] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#17201d] text-[#e9ff6a]">
                          {service.codePrefix}
                        </span>
                        <span className="font-bold text-sm text-[#17201d]">{service.name}</span>
                        <span
                          className={`font-mono text-[10px] uppercase px-1.5 py-0.2 font-bold ${
                            service.isOpen
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-gray-200 text-gray-700 border border-gray-300'
                          }`}
                        >
                          {service.isOpen ? 'Open' : 'Paused'}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-[#56605b] mt-1">
                        Avg duration: ~{service.avgServiceMinutes} mins • {serviceServed.length} served today
                      </p>
                      {service.description && (
                        <p className="text-[11px] text-[#56605b] mt-0.5 line-clamp-1">
                          {service.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-right sm:mr-2">
                        <span className="font-mono text-xl sm:text-2xl font-black text-[#17201d] block">
                          {serviceWaiting.length}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#56605b]">
                          Waiting
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenServiceQR(service)}
                          className="px-2.5 py-1 bg-white border border-[#17201d] text-[#17201d] font-mono text-xs font-bold hover:bg-[#f3f4f1] transition-colors"
                          title="Generate QR code for this specific service"
                        >
                          QR Code
                        </button>
                        <button
                          type="button"
                          onClick={() => setServiceModal({ isOpen: true, service })}
                          className="px-2.5 py-1 bg-white border border-[#cfd4cd] text-[#56605b] hover:text-[#17201d] hover:border-[#17201d] font-mono text-xs font-bold transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Real-time Ticket Audit Ledger */}
        <section className="border-2 border-[#17201d] bg-white p-5 sm:p-6 shadow-[6px_6px_0_#17201d]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#cfd4cd] pb-4 mb-4">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-[#56605b]">
                Real-Time Ledger
              </span>
              <h2 className="text-lg font-bold text-[#17201d]">Live Ticket Activity & Control</h2>
            </div>

            {/* Search & Status Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                placeholder="Search ticket # or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 border border-[#cfd4cd] text-xs font-mono focus:outline-none focus:border-[#17201d] bg-white"
              />

              <div className="flex items-center border border-[#cfd4cd] bg-[#f8f8f5] p-0.5">
                {(['all', 'waiting', 'called', 'in_service', 'completed', 'no_show'] as const).map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`px-2.5 py-1 font-mono text-[11px] font-bold uppercase transition-colors ${
                        statusFilter === status
                          ? 'bg-[#17201d] text-[#e9ff6a]'
                          : 'text-[#56605b] hover:text-[#17201d]'
                      }`}
                    >
                      {status === 'all' ? 'All' : status.replace('_', ' ')}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-[#17201d] bg-[#f8f8f5] font-mono text-[11px] uppercase tracking-wider text-[#56605b]">
                  <th className="py-2.5 px-3">Ticket #</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Desk / Staff</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cfd4cd] font-mono">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#56605b] font-mono text-sm">
                      No tickets matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => {
                    const srv = services.find((s) => s.id === ticket.serviceId);
                    return (
                      <tr key={ticket.id} className="hover:bg-[#f8f8f5] transition-colors">
                        <td className="py-3 px-3 font-bold text-sm text-[#17201d]">
                          <Link
                            href={`/ticket/${ticket.ticketNumber}`}
                            className="hover:underline flex items-center gap-1"
                          >
                            <span>{ticket.ticketNumber}</span>
                            <span className="text-[10px] text-[#56605b]">↗</span>
                          </Link>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-[#17201d] block font-sans">
                            {ticket.customerName}
                          </span>
                          {ticket.customerPhone && (
                            <span className="text-[10px] text-[#56605b] block">
                              {ticket.customerPhone}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-[#17201d] font-sans">
                          {srv?.name || ticket.serviceId}
                        </td>
                        <td className="py-3 px-3">
                          {ticket.deskNumber ? (
                            <span>
                              Desk {ticket.deskNumber} ({ticket.staffName || 'Staff'})
                            </span>
                          ) : (
                            <span className="text-[#aeb9b1]">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider inline-block ${
                              ticket.status === 'waiting'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : ticket.status === 'called'
                                ? 'bg-[#e9ff6a] text-[#17201d] font-black border border-[#17201d]'
                                : ticket.status === 'in_service'
                                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                : ticket.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-300'
                            }`}
                          >
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#56605b]">
                          {new Date(ticket.joinedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {ticket.status === 'waiting' && (
                            <button
                              type="button"
                              onClick={() => cancelTicket(ticket.id)}
                              className="px-2 py-0.5 border border-rose-300 text-rose-700 hover:bg-rose-50 text-[10px] font-bold"
                            >
                              Cancel
                            </button>
                          )}
                          {(ticket.status === 'called' || ticket.status === 'in_service') && (
                            <button
                              type="button"
                              onClick={() => skipTicket(ticket.id)}
                              className="px-2 py-0.5 border border-amber-300 text-amber-800 hover:bg-amber-50 text-[10px] font-bold"
                            >
                              No-Show
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* QR Code Presentation Modal */}
      <QRCodeModal
        isOpen={qrModal.isOpen}
        onClose={() => setQrModal((prev) => ({ ...prev, isOpen: false }))}
        title={qrModal.title}
        subtitle={qrModal.subtitle}
        url={qrModal.url}
        serviceCode={qrModal.serviceCode}
        orgName={organization.name}
        facilityName={facility.name}
      />

      {/* Service Configuration Modal */}
      <ServiceConfigModal
        isOpen={serviceModal.isOpen}
        onClose={() => setServiceModal({ isOpen: false, service: null })}
        service={serviceModal.service}
        onSave={handleSaveService}
        existingPrefixes={services.map((s) => s.codePrefix)}
      />
    </main>
  </AuthGuard>
  );
}
