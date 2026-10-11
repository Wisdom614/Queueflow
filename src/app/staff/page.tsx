'use client';

import React, { useState } from 'react';
import { useQueue } from '@/lib/queue-context';

export default function StaffConsolePage() {
  const {
    desks,
    services,
    tickets,
    facility,
    organization,
    callNext,
    startService,
    completeService,
    skipTicket,
  } = useQueue();

  const [selectedDeskNumber, setSelectedDeskNumber] = useState<number>(1);
  const [mobileTab, setMobileTab] = useState<'station' | 'queue'>('station');

  const currentDesk = desks.find((d) => d.number === selectedDeskNumber) || desks[0];

  // Ticket currently in progress at this desk (called or in_service)
  const currentTicket = tickets.find(
    (t) =>
      t.deskNumber === currentDesk?.number &&
      (t.status === 'called' || t.status === 'in_service')
  );

  // Tickets waiting for this desk's supported services
  const supportedServiceIds = currentDesk?.supportedServiceIds || [];
  const waitingTickets = tickets.filter(
    (t) => t.status === 'waiting' && supportedServiceIds.includes(t.serviceId)
  );

  // Tickets completed today at this desk
  const completedToday = tickets.filter(
    (t) => t.deskNumber === currentDesk?.number && t.status === 'completed'
  );

  const getServiceName = (serviceId: string) => {
    return services.find((s) => s.id === serviceId)?.name || 'General';
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-8 py-5 sm:py-8">
      {/* Top Station Context & Desk Switcher */}
      <div className="border border-[#cfd4cd] bg-white p-4 sm:p-5 mb-5 shadow-[4px_4px_0_#d8dfd3]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#cfd4cd] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#56605b]">
                Staff Operational Station
              </span>
              <span className="text-[#cfd4cd]">&bull;</span>
              <span className="font-mono text-[11px] text-[#17201d] font-semibold">
                {organization.name} &bull; {facility.name}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17201d] mt-0.5">
              {currentDesk?.name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#29966e] animate-pulse" />
            <span className="font-mono text-xs font-semibold text-[#17201d]">
              Attendant: {currentDesk?.activeStaffName || 'Station Staff'}
            </span>
          </div>
        </div>

        {/* Quick Desk Selector Horizontal Pills */}
        <div className="pt-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#56605b] mr-1">
            Switch Desk:
          </span>
          {desks.map((d) => {
            const isSelected = d.number === currentDesk?.number;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDeskNumber(d.number)}
                className={`px-3 py-1 text-xs font-mono font-bold transition-all border ${
                  isSelected
                    ? 'bg-[#17201d] text-[#e9ff6a] border-[#17201d] shadow-[2px_2px_0_#cfd4cd]'
                    : 'bg-[#f8f8f5] text-[#56605b] border-[#cfd4cd] hover:border-[#17201d] hover:text-[#17201d]'
                }`}
              >
                Desk {d.number}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Ergonomic Segmented Tabs */}
      <div className="md:hidden grid grid-cols-2 gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMobileTab('station')}
          className={`py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-center border transition-all ${
            mobileTab === 'station'
              ? 'bg-[#17201d] text-[#e9ff6a] border-[#17201d] shadow-[2px_2px_0_#17201d]'
              : 'bg-white text-[#56605b] border-[#cfd4cd]'
          }`}
        >
          Station Controls
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('queue')}
          className={`py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-center border transition-all ${
            mobileTab === 'queue'
              ? 'bg-[#17201d] text-[#e9ff6a] border-[#17201d] shadow-[2px_2px_0_#17201d]'
              : 'bg-white text-[#56605b] border-[#cfd4cd]'
          }`}
        >
          Waitlist ({waitingTickets.length})
        </button>
      </div>

      <div className="grid md:grid-cols-[1.3fr_0.7fr] gap-6 items-start">
        {/* Left Column: ACTIVE OPERATION CONTROLS */}
        <section className={`${mobileTab === 'station' ? 'block' : 'hidden md:block'} space-y-5`}>
          {/* Active Serving Card */}
          <div className="border-2 border-[#17201d] bg-white shadow-[6px_6px_0_#17201d]">
            <div className="bg-[#17201d] text-white px-4 sm:px-6 py-3 flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-[#e9ff6a] font-bold">
                Desk {currentDesk?.number} Serving Slot
              </span>
              <span className="font-mono text-xs text-[#aeb9b1]">
                {currentTicket ? currentTicket.status.toUpperCase() : 'IDLE'}
              </span>
            </div>

            <div className="p-5 sm:p-7">
              {currentTicket ? (
                <div>
                  {/* Status Banner */}
                  <div
                    className={`p-2.5 mb-5 font-mono text-xs font-bold uppercase tracking-wider border flex items-center justify-between ${
                      currentTicket.status === 'called'
                        ? 'bg-[#e9ff6a] text-[#17201d] border-[#17201d] animate-pulse'
                        : 'bg-[#dff4e8] text-[#1b7752] border-[#1b7752]'
                    }`}
                  >
                    <span>
                      {currentTicket.status === 'called'
                        ? '● Ticket Called — Waiting for Customer'
                        : '● Customer Currently in Service'}
                    </span>
                    <span className="text-[10px]">
                      {currentTicket.calledAt
                        ? new Date(currentTicket.calledAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </span>
                  </div>

                  {/* Ticket Details */}
                  <div className="border-b border-[#cfd4cd] pb-5">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#56605b] block">
                      {getServiceName(currentTicket.serviceId)}
                    </span>
                    <div className="font-mono text-6xl sm:text-7xl font-extrabold tracking-tight text-[#17201d] my-1">
                      {currentTicket.ticketNumber}
                    </div>
                    <div className="space-y-1 text-sm text-[#17201d] mt-2">
                      <p>
                        Customer Name: <span className="font-bold">{currentTicket.customerName}</span>
                      </p>
                      {currentTicket.customerPhone && (
                        <p className="font-mono text-xs text-[#56605b]">
                          Phone: {currentTicket.customerPhone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Primary Touch Actions */}
                  <div className="pt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {currentTicket.status === 'called' ? (
                      <button
                        type="button"
                        onClick={() => startService(currentTicket.id)}
                        className="sm:col-span-2 h-14 bg-[#17201d] text-[#e9ff6a] font-bold text-sm uppercase tracking-wider hover:bg-[#2c3832] transition-colors flex items-center justify-center gap-2 shadow-[3px_3px_0_#17201d]"
                      >
                        <span>Customer Arrived &bull; Start Service</span>
                        <span className="font-mono text-base">→</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => completeService(currentTicket.id)}
                        className="sm:col-span-2 h-14 bg-[#1b7752] text-white font-bold text-sm uppercase tracking-wider hover:bg-[#145b3e] transition-colors flex items-center justify-center gap-2 shadow-[3px_3px_0_#145b3e]"
                      >
                        <span>Complete Service</span>
                        <span className="text-base">✓</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => skipTicket(currentTicket.id)}
                      className="h-14 border border-[#e02424] text-[#e02424] bg-white hover:bg-[#fdf2f2] font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center"
                    >
                      Skip / No-Show
                    </button>
                  </div>
                </div>
              ) : (
                /* Idle State */
                <div className="py-6 sm:py-10 text-center">
                  <span className="font-mono text-4xl text-[#cfd4cd] block mb-2">---</span>
                  <h3 className="text-lg font-bold text-[#17201d]">Desk Ready</h3>
                  <p className="text-xs text-[#56605b] mt-1 max-w-sm mx-auto">
                    No customer is currently called at Desk {currentDesk?.number}.
                  </p>

                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        const called = callNext(currentDesk?.number);
                        if (!called) {
                          alert('No customers are currently waiting for this desk services.');
                        }
                      }}
                      disabled={waitingTickets.length === 0}
                      className={`w-full sm:w-auto h-14 px-8 font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 border border-[#17201d] ${
                        waitingTickets.length > 0
                          ? 'bg-[#e9ff6a] text-[#17201d] shadow-[4px_4px_0_#17201d] hover:bg-[#d8ef58]'
                          : 'bg-[#f3f4f1] text-[#9ca3af] border-[#cfd4cd] cursor-not-allowed'
                      }`}
                    >
                      <span>Call Next Customer</span>
                      <span className="font-mono text-xs px-2 py-0.5 bg-[#17201d] text-[#e9ff6a]">
                        {waitingTickets.length} in queue
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-[#cfd4cd] bg-white p-3.5 sm:p-4 text-center sm:text-left">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#56605b] block">
                In Queue
              </span>
              <span className="font-mono text-2xl font-bold text-[#17201d]">
                {waitingTickets.length}
              </span>
            </div>

            <div className="border border-[#cfd4cd] bg-white p-3.5 sm:p-4 text-center sm:text-left">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#56605b] block">
                Served Today
              </span>
              <span className="font-mono text-2xl font-bold text-[#17201d]">
                {completedToday.length}
              </span>
            </div>

            <div className="border border-[#cfd4cd] bg-white p-3.5 sm:p-4 text-center sm:text-left">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#56605b] block">
                Desk State
              </span>
              <span className="font-mono text-xs font-bold text-[#1b7752] flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                <span className="size-2 rounded-full bg-[#1b7752]" />
                OPEN
              </span>
            </div>
          </div>
        </section>

        {/* Right Column: QUEUE WAITLIST STREAM */}
        <section
          className={`${mobileTab === 'queue' ? 'block' : 'hidden md:block'} border border-[#cfd4cd] bg-white p-4 sm:p-5`}
        >
          <div className="flex items-center justify-between border-b border-[#cfd4cd] pb-3 mb-4">
            <div>
              <h3 className="font-bold text-sm text-[#17201d]">Waiting Queue</h3>
              <p className="text-[11px] text-[#56605b]">Desk {currentDesk?.number} scope</p>
            </div>
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#f8f8f5] border border-[#cfd4cd]">
              {waitingTickets.length}
            </span>
          </div>

          {waitingTickets.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#56605b]">
              <span className="font-mono block">Queue Clear</span>
              <span className="text-[11px] text-[#9ca3af]">No customers waiting right now.</span>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {waitingTickets.map((ticket, index) => (
                <div
                  key={ticket.id}
                  className={`p-3 border flex items-center justify-between transition-colors ${
                    index === 0
                      ? 'border-[#17201d] bg-[#f8f8f5]'
                      : 'border-[#cfd4cd] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#56605b] w-5">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-[#17201d]">
                          {ticket.ticketNumber}
                        </span>
                        <span className="text-xs font-medium text-[#17201d] truncate max-w-[120px]">
                          {ticket.customerName}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-[#56605b] block">
                        {getServiceName(ticket.serviceId)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-[10px] text-[#56605b] block">
                      {new Date(ticket.joinedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {index === 0 && (
                      <span className="font-mono text-[9px] bg-[#e9ff6a] px-1 py-0.2 border border-[#17201d] font-bold">
                        NEXT UP
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
