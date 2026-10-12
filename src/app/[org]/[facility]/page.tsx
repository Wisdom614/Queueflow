'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueue } from '@/lib/queue-context';
import Link from 'next/link';
import Image from 'next/image';

function TenantJoinQueueForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get('service');

  const { organization, facility, services, tickets, joinQueue } = useQueue();

  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [existingTicketInput, setExistingTicketInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  // If URL has ?service=srv-xyz, preselect that service
  useEffect(() => {
    if (serviceParam && services.some((s) => s.id === serviceParam)) {
      setSelectedServiceId(serviceParam);
    } else if (!selectedServiceId && services.length > 0) {
      setSelectedServiceId(services[0].id);
    }
  }, [serviceParam, services, selectedServiceId]);

  const selectedService = services.find((s) => s.id === selectedServiceId);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Please provide your name to join the queue.');
      return;
    }
    if (!selectedServiceId) {
      setError('Please select a service.');
      return;
    }

    if (selectedService && !selectedService.isOpen) {
      setError('This service is currently closed. Please select another service.');
      return;
    }

    try {
      const ticket = joinQueue(selectedServiceId, customerName, customerPhone);
      router.push(`/${organization.slug}/${facility.slug}/ticket/${ticket.ticketNumber}`);
    } catch {
      setError('Unable to issue ticket. Please try again.');
    }
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingTicketInput.trim()) return;
    router.push(`/${organization.slug}/${facility.slug}/ticket/${existingTicketInput.trim().toUpperCase()}`);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Location / Context Bar */}
      <div className="border border-[#cfd4cd] bg-white p-5 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#cfd4cd] pb-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#56605b]">
              {organization.name}
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.04em] text-[#17201d] mt-1">
              {facility.name}
            </h1>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start sm:self-auto bg-[#dff4e8] text-[#1b7752] px-3 py-1 text-xs font-medium font-mono">
            <span className="size-1.5 rounded-full bg-[#1b7752]" />
            Queues Active
          </span>
        </div>
        <p className="font-mono text-xs text-[#56605b] mt-3">{facility.location}</p>
      </div>

      <div className="grid md:grid-cols-[1.2fr_.8fr] gap-8">
        {/* Left: Service Selection & Join Form */}
        <section className="border border-[#17201d] bg-white p-6 sm:p-8 shadow-[6px_6px_0_#d8dfd3]">
          <div className="border-b border-[#cfd4cd] pb-4 mb-6">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#56605b]">Step 1 of 2</p>
            <h2 className="text-xl font-bold tracking-tight text-[#17201d] mt-1">
              Select your service point
            </h2>
          </div>

          <form onSubmit={handleJoin} className="space-y-6">
            <div className="space-y-3">
              {services.map((service) => {
                const waitingCount = tickets.filter(
                  (t) => t.serviceId === service.id && t.status === 'waiting'
                ).length;
                const isSelected = service.id === selectedServiceId;

                return (
                  <button
                    key={service.id}
                    type="button"
                    disabled={!service.isOpen}
                    onClick={() => {
                      setSelectedServiceId(service.id);
                      setError(null);
                    }}
                    className={`w-full text-left p-4 border transition-all ${
                      !service.isOpen
                        ? 'opacity-50 border-dashed border-[#cfd4cd] bg-gray-50 cursor-not-allowed'
                        : isSelected
                        ? 'border-[#17201d] bg-[#f8f8f5] shadow-[3px_3px_0_#17201d]'
                        : 'border-[#cfd4cd] hover:border-[#17201d] bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-[#17201d] text-[#e9ff6a]">
                            [{service.codePrefix}]
                          </span>
                          <span className="font-semibold text-sm sm:text-base text-[#17201d]">
                            {service.name}
                          </span>
                          {!service.isOpen && (
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-gray-200 text-gray-700">
                              Closed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#56605b] mt-1.5 leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-xs font-semibold text-[#17201d]">
                          {waitingCount} waiting
                        </div>
                        <div className="font-mono text-[10px] text-[#56605b] mt-0.5">
                          ~{waitingCount * service.avgServiceMinutes} min est.
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-[#cfd4cd] pt-6 space-y-4">
              <div className="border-b border-[#cfd4cd] pb-2">
                <p className="font-mono text-[11px] uppercase tracking-wider text-[#56605b]">Step 2 of 2</p>
                <h3 className="text-lg font-bold tracking-tight text-[#17201d]">
                  Customer Information
                </h3>
              </div>

              {error && (
                <div className="p-3 bg-[#fdf2f2] border-l-4 border-[#e02424] text-xs text-[#9b1c1c] font-medium">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="customer-name" className="block text-xs font-bold uppercase tracking-wider text-[#17201d] mb-1.5">
                  Full Name / Client Identifier <span className="text-[#e02424]">*</span>
                </label>
                <input
                  id="customer-name"
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border border-[#17201d] bg-white px-3.5 py-2.5 text-sm text-[#17201d] focus:outline-none focus:ring-2 focus:ring-[#17201d]"
                />
              </div>

              <div>
                <label htmlFor="customer-phone" className="block text-xs font-bold uppercase tracking-wider text-[#17201d] mb-1.5">
                  Mobile Number <span className="font-normal text-[#56605b]">(Optional for SMS alerts)</span>
                </label>
                <input
                  id="customer-phone"
                  type="tel"
                  placeholder="e.g. +237 6XX XX XX XX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full border border-[#cfd4cd] bg-white px-3.5 py-2.5 text-sm text-[#17201d] focus:border-[#17201d] focus:outline-none focus:ring-1 focus:ring-[#17201d]"
                />
                <p className="text-[11px] text-[#56605b] mt-1">
                  We only use this to send you a notification when your turn approaches.
                </p>
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-[#17201d] text-[#e9ff6a] font-bold text-sm tracking-wide uppercase hover:bg-[#2e3b35] transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0_#cfd4cd]"
              >
                <span>Take Virtual Ticket</span>
                <span className="font-mono text-xs">[{selectedService?.codePrefix || 'Q'}]</span>
              </button>
            </div>
          </form>
        </section>

        {/* Right Column: Existing Ticket Check & Guidance */}
        <div className="space-y-6">
          {/* Lookup Existing Ticket */}
          <section className="border border-[#cfd4cd] bg-white p-5">
            <h3 className="font-semibold text-sm text-[#17201d] mb-1">
              Already have a ticket?
            </h3>
            <p className="text-xs text-[#56605b] mb-3 leading-relaxed">
              Enter your ticket number to view your current position and live wait time.
            </p>
            <form onSubmit={handleLookup} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. B101"
                value={existingTicketInput}
                onChange={(e) => setExistingTicketInput(e.target.value)}
                className="w-full border border-[#cfd4cd] px-3 py-2 text-xs font-mono uppercase tracking-wider focus:border-[#17201d] focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#17201d] text-white text-xs font-semibold shrink-0 hover:bg-[#2e3b35]"
              >
                Track
              </button>
            </form>
          </section>

          {/* How It Works Reminder */}
          <section className="border border-[#cfd4cd] bg-[#f8f8f5] p-5">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-[#17201d] mb-3">
              How Virtual Queuing Works
            </h3>
            <ul className="space-y-2.5 text-xs text-[#56605b]">
              <li className="flex gap-2">
                <span className="font-mono font-bold text-[#17201d]">1.</span>
                <span>Receive an electronic ticket directly on your browser.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-mono font-bold text-[#17201d]">2.</span>
                <span>You do not need to stand in line. Check live updates from anywhere nearby.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-mono font-bold text-[#17201d]">3.</span>
                <span>When your ticket is called, your screen turns green and indicates your designated desk.</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function TenantJoinPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-mono text-xs">Loading queue interface...</div>}>
      <TenantJoinQueueForm />
    </Suspense>
  );
}
