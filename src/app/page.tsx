'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface TenantDemoCard {
  id: string;
  name: string;
  sector: string;
  badge: string;
  tagline: string;
  orgSlug: string;
  facilitySlug: string;
  facilityName: string;
  services: string[];
  metrics: { estWait: string; serviceCount: string; openDesks: number };
}

const DEMO_TENANTS: TenantDemoCard[] = [
  {
    id: 'ubuea',
    name: 'University of Buea',
    sector: 'Higher Education',
    badge: 'Academic Preset',
    tagline: 'Student fees, clearance, admissions, and ID card operations on Molyko campus.',
    orgSlug: 'ubuea',
    facilitySlug: 'central-bursary',
    facilityName: 'Central Bursary & Student Accounts',
    services: ['Tuition & Fee Payment (B)', 'Official Transcripts & Certificates (T)', 'Student ID & Biometrics (S)'],
    metrics: { estWait: '4-8 min', serviceCount: '3 Queues', openDesks: 4 },
  },
  {
    id: 'sample-telecom',
    name: 'Metropolitan Telecom',
    sector: 'Telecommunications',
    badge: 'Telecom Preset',
    tagline: 'High-volume SIM registration, fiber installations, and billing support.',
    orgSlug: 'sample-telecom',
    facilitySlug: 'downtown',
    facilityName: 'Downtown Customer Service Center',
    services: ['SIM Registration & Replacement (S)', 'Postpaid Billing & Cash Desk (B)', 'Technical Device & Fiber Support (C)'],
    metrics: { estWait: '4-6 min', serviceCount: '3 Queues', openDesks: 3 },
  },
  {
    id: 'sample-clinic',
    name: 'St. Jude Community Health',
    sector: 'Healthcare & Clinics',
    badge: 'Clinical Preset',
    tagline: 'Outpatient patient intake, medical consultations, and dispensary.',
    orgSlug: 'sample-clinic',
    facilitySlug: 'outpatient',
    facilityName: 'Main Outpatient Clinic & Diagnostics',
    services: ['General Triage & Vital Signs (T)', 'Physician Consultation Room (C)', 'Pharmacy & Medication Dispensing (P)'],
    metrics: { estWait: '4-12 min', serviceCount: '3 Queues', openDesks: 3 },
  },
  {
    id: 'sample-bank',
    name: 'Apex Commercial Bank',
    sector: 'Retail Banking',
    badge: 'Financial Preset',
    tagline: 'Teller cash transactions, foreign exchange, and corporate accounts.',
    orgSlug: 'sample-bank',
    facilitySlug: 'main-hall',
    facilityName: 'Corporate Banking Branch',
    services: ['Cash Deposits & Withdrawals (C)', 'Account Operations & Customer Care (A)', 'Foreign Exchange & Wire Transfers (F)'],
    metrics: { estWait: '4-10 min', serviceCount: '3 Queues', openDesks: 3 },
  },
];

export default function Home() {
  const [activeTenantId, setActiveTenantId] = useState<string>('ubuea');
  const activeTenant = DEMO_TENANTS.find((t) => t.id === activeTenantId) || DEMO_TENANTS[0];

  return (
    <main className="min-h-screen bg-[#f8f8f5] text-[#17201d]">
      {/* Platform Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8 py-10 sm:py-16">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-14 items-center">
          {/* Left: Headline & Product Overview */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 border border-[#17201d] bg-white px-3 py-1 text-xs font-mono font-bold tracking-wider uppercase text-[#17201d]">
              <span className="size-2 bg-[#17201d] animate-pulse" />
              Multi-Organization Queue Management SaaS
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#17201d] leading-[1.05]">
              One platform. Every physical queue.
            </h1>

            <p className="text-base sm:text-lg text-[#56605b] max-w-xl leading-relaxed">
              QueueFlow enables universities, clinics, telecom offices, and financial branches to configure multiple facilities, service desks, and queue rules with complete data isolation.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/onboard"
                className="h-12 px-6 bg-[#17201d] text-[#e9ff6a] font-bold text-sm uppercase tracking-wider hover:bg-[#2c3832] transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0_#17201d]"
              >
                <span>Register Organization</span>
                <span className="font-mono text-sm">→</span>
              </Link>

              <Link
                href={`/${activeTenant.orgSlug}/${activeTenant.facilitySlug}`}
                className="h-12 px-6 bg-white border border-[#17201d] text-[#17201d] font-semibold text-sm hover:bg-[#f3f4f1] transition-colors flex items-center justify-center gap-2"
              >
                <span>Explore Preset: {activeTenant.name}</span>
                <span className="font-mono text-xs text-[#56605b]">↗</span>
              </Link>

              <Link
                href={`/${activeTenant.orgSlug}/admin`}
                className="h-12 px-5 bg-white border border-[#cfd4cd] text-[#56605b] font-mono text-xs hover:text-[#17201d] hover:border-[#17201d] transition-colors flex items-center justify-center"
              >
                Admin Panel
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-2 text-xs font-mono text-[#56605b]">
              <div>
                <span className="font-bold text-[#17201d]">Zero</span> app install needed
              </div>
              <div className="h-3 w-px bg-[#cfd4cd]" />
              <div>
                <span className="font-bold text-[#17201d]">Instant</span> QR code check-in
              </div>
              <div className="h-3 w-px bg-[#cfd4cd]" />
              <div>
                <span className="font-bold text-[#17201d]">Realtime</span> Supabase sync
              </div>
            </div>
          </div>

          {/* Right: Live Digital Pass Card */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative border-2 border-[#17201d] bg-white shadow-[8px_8px_0_#17201d] overflow-hidden">
              <Image
                src="/images/queue-freedom.jpg"
                alt="Customer comfortably waiting remotely using mobile phone"
                width={800}
                height={500}
                priority
                className="w-full h-60 sm:h-72 object-cover"
              />
              <div className="p-4 bg-white border-t-2 border-[#17201d]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] uppercase text-[#56605b] block">
                      Live Customer Intake
                    </span>
                    <span className="font-mono text-xl sm:text-2xl font-black text-[#17201d]">
                      Instant Virtual Pass
                    </span>
                  </div>
                  <Link
                    href={`/${activeTenant.orgSlug}/${activeTenant.facilitySlug}`}
                    className="px-3.5 py-1.5 bg-[#17201d] text-[#e9ff6a] font-mono text-xs font-bold uppercase hover:bg-[#2c3832] transition-colors"
                  >
                    Take Pass →
                  </Link>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#56605b] border-t border-[#f0f0ed] pt-2">
                  <span>Facility: {activeTenant.facilityName}</span>
                  <span className="text-[#17201d] font-bold">Zero Physical Lines</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Tenant Demo Switcher & Directory */}
      <section className="border-y border-[#cfd4cd] bg-white py-12 sm:py-16 px-4 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#cfd4cd] pb-6 mb-8">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#56605b]">
                Interactive Tenant Directory
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17201d] mt-1">
                Explore Pre-Configured Multi-Tenant Workspaces
              </h2>
            </div>
            <p className="text-xs text-[#56605b] max-w-md">
              QueueFlow isolates configuration, tickets, and real-time broadcasts per facility. Select an organization preset below to test customer, staff, and display flows.
            </p>
          </div>

          {/* Tenant Selector Tabs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {DEMO_TENANTS.map((tenant) => {
              const isSelected = tenant.id === activeTenantId;
              return (
                <button
                  key={tenant.id}
                  onClick={() => setActiveTenantId(tenant.id)}
                  className={`text-left p-4 border-2 transition-all ${
                    isSelected
                      ? 'border-[#17201d] bg-[#f8f8f5] shadow-[4px_4px_0_#17201d]'
                      : 'border-[#cfd4cd] bg-white hover:border-[#17201d]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 bg-[#17201d] text-[#e9ff6a]">
                      {tenant.badge}
                    </span>
                    {isSelected && (
                      <span className="size-2 bg-[#17201d] rounded-full" />
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-[#17201d] mt-2.5 truncate">
                    {tenant.name}
                  </h3>
                  <p className="text-[11px] text-[#56605b] mt-0.5 font-mono truncate">
                    /{tenant.orgSlug}/{tenant.facilitySlug}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Tenant Showcase Pane */}
          <div className="border-2 border-[#17201d] bg-[#f8f8f5] p-6 sm:p-8">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Organization Details */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs uppercase px-2 py-0.5 bg-[#17201d] text-white font-bold">
                    {activeTenant.sector}
                  </span>
                  <span className="font-mono text-xs text-[#56605b]">
                    Scoped Facility: <strong className="text-[#17201d]">{activeTenant.facilityName}</strong>
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-[#17201d]">
                  {activeTenant.name}
                </h3>
                <p className="text-sm text-[#56605b] leading-relaxed">
                  {activeTenant.tagline}
                </p>

                {/* Configured Services List */}
                <div className="pt-2">
                  <span className="font-mono text-[11px] font-bold uppercase text-[#56605b] block mb-2">
                    Configured Services & Ticket Prefixes:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeTenant.services.map((srv) => (
                      <span
                        key={srv}
                        className="font-mono text-xs px-2.5 py-1 border border-[#cfd4cd] bg-white text-[#17201d]"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Live Stats */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#cfd4cd]">
                  <div className="p-3 bg-white border border-[#cfd4cd]">
                    <span className="font-mono text-[10px] text-[#56605b] block">Avg Pace</span>
                    <span className="font-mono text-lg sm:text-xl font-bold text-[#17201d]">
                      {activeTenant.metrics.estWait}
                    </span>
                  </div>
                  <div className="p-3 bg-white border border-[#cfd4cd]">
                    <span className="font-mono text-[10px] text-[#56605b] block">Service Points</span>
                    <span className="font-mono text-lg sm:text-xl font-bold text-[#17201d]">
                      {activeTenant.metrics.serviceCount}
                    </span>
                  </div>
                  <div className="p-3 bg-white border border-[#cfd4cd]">
                    <span className="font-mono text-[10px] text-[#56605b] block">Active Desks</span>
                    <span className="font-mono text-lg sm:text-xl font-bold text-[#17201d]">
                      {activeTenant.metrics.openDesks} counters
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Deep-Links */}
              <div className="lg:col-span-5 space-y-3">
                <span className="font-mono text-[11px] font-bold uppercase text-[#56605b] block">
                  Launch Interface For This Facility:
                </span>

                <Link
                  href={`/${activeTenant.orgSlug}/${activeTenant.facilitySlug}`}
                  className="flex items-center justify-between p-3.5 border-2 border-[#17201d] bg-white hover:bg-[#e9ff6a] transition-all group"
                >
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase text-[#56605b] group-hover:text-[#17201d] block">
                      Customer Entry Point
                    </span>
                    <strong className="text-sm text-[#17201d]">Mobile Join & Ticket Scanner</strong>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#17201d]">/{activeTenant.orgSlug}/{activeTenant.facilitySlug} →</span>
                </Link>

                <Link
                  href={`/${activeTenant.orgSlug}/${activeTenant.facilitySlug}/staff`}
                  className="flex items-center justify-between p-3.5 border border-[#17201d] bg-white hover:bg-[#17201d] hover:text-white transition-all group"
                >
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase text-[#56605b] group-hover:text-[#aeb9b1] block">
                      Staff Station
                    </span>
                    <strong className="text-sm group-hover:text-white text-[#17201d]">Counter Calling Console</strong>
                  </div>
                  <span className="font-mono text-xs font-bold">/staff →</span>
                </Link>

                <Link
                  href={`/${activeTenant.orgSlug}/${activeTenant.facilitySlug}/display`}
                  className="flex items-center justify-between p-3.5 border border-[#17201d] bg-[#17201d] text-white hover:border-[#e9ff6a] transition-all"
                >
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase text-[#e9ff6a] block">
                      Lobby Hardware Screen
                    </span>
                    <strong className="text-sm text-white">Full-Screen Arrival Board</strong>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#e9ff6a]">/display →</span>
                </Link>

                <Link
                  href={`/${activeTenant.orgSlug}/admin`}
                  className="flex items-center justify-between p-3.5 border border-[#cfd4cd] bg-white hover:border-[#17201d] transition-all"
                >
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase text-[#56605b] block">
                      Facility Administration
                    </span>
                    <strong className="text-sm text-[#17201d]">Config, QR Posters & Analytics</strong>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#17201d]">/admin →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 4 Core Interfaces Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 bg-[#f8f8f5]">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#cfd4cd] pb-4 mb-8">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#56605b]">
                Platform Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17201d] mt-1">
                Unified Engine, Four Specialized Experiences
              </h2>
            </div>
            <p className="text-xs text-[#56605b] max-w-xs">
              Every interface updates in sub-second latency through facility-scoped websocket channels.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Customer Role */}
            <Link
              href={`/${activeTenant.orgSlug}/${activeTenant.facilitySlug}`}
              className="p-5 sm:p-6 border-2 border-[#17201d] bg-white hover:shadow-[6px_6px_0_#17201d] transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-[#17201d] text-[#e9ff6a] font-bold uppercase">
                  01 &bull; Customer
                </span>
                <h3 className="text-lg font-bold text-[#17201d] mt-3 group-hover:underline">
                  Join & Track
                </h3>
                <p className="text-xs text-[#56605b] mt-2 leading-relaxed">
                  Join via QR or web. Receive live queue position, estimated wait countdown, and turn vibration alerts.
                </p>
              </div>
              <span className="mt-5 font-mono text-xs font-bold text-[#17201d] flex items-center gap-1">
                Open Customer Flow →
              </span>
            </Link>

            {/* Staff Role */}
            <Link
              href={`/${activeTenant.orgSlug}/${activeTenant.facilitySlug}/staff`}
              className="p-5 sm:p-6 border-2 border-[#17201d] bg-white hover:shadow-[6px_6px_0_#17201d] transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-[#17201d] text-white font-bold uppercase">
                  02 &bull; Staff
                </span>
                <h3 className="text-lg font-bold text-[#17201d] mt-3 group-hover:underline">
                  Staff Station
                </h3>
                <p className="text-xs text-[#56605b] mt-2 leading-relaxed">
                  Fast counter interface: Call Next, initiate service, mark no-show, or transfer ticket to another queue.
                </p>
              </div>
              <span className="mt-5 font-mono text-xs font-bold text-[#17201d] flex items-center gap-1">
                Open Staff Console →
              </span>
            </Link>

            {/* Public Display Role */}
            <Link
              href={`/${activeTenant.orgSlug}/${activeTenant.facilitySlug}/display`}
              className="p-5 sm:p-6 border-2 border-[#17201d] bg-[#17201d] text-white hover:shadow-[6px_6px_0_#cfd4cd] transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-[#e9ff6a] text-[#17201d] font-bold uppercase">
                  03 &bull; Lobby Screen
                </span>
                <h3 className="text-lg font-bold text-white mt-3 group-hover:underline">
                  Public Board
                </h3>
                <p className="text-xs text-[#aeb9b1] mt-2 leading-relaxed">
                  High-contrast departure board showing Now Serving desks and upcoming passes with audio alert chimes.
                </p>
              </div>
              <span className="mt-5 font-mono text-xs font-bold text-[#e9ff6a] flex items-center gap-1">
                Open Public Board →
              </span>
            </Link>

            {/* Admin & Facility Manager Role */}
            <Link
              href={`/${activeTenant.orgSlug}/admin`}
              className="p-5 sm:p-6 border-2 border-[#17201d] bg-white hover:shadow-[6px_6px_0_#17201d] transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-[#17201d] text-[#e9ff6a] font-bold uppercase">
                  04 &bull; Admin
                </span>
                <h3 className="text-lg font-bold text-[#17201d] mt-3 group-hover:underline">
                  Admin & Posters
                </h3>
                <p className="text-xs text-[#56605b] mt-2 leading-relaxed">
                  Add custom services, configure desk assignments, generate printable QR posters, and inspect analytics.
                </p>
              </div>
              <span className="mt-5 font-mono text-xs font-bold text-[#17201d] flex items-center gap-1">
                Open Admin Panel →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#cfd4cd] px-4 sm:px-8 py-6 bg-white">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#56605b] font-mono">
          <div>
            <span className="font-bold text-[#17201d]">QueueFlow</span> &bull; Multi-Tenant Virtual Queue Platform
          </div>
          <div>Swiss Editorial &bull; Restrained Neobrutalism</div>
        </div>
      </footer>
    </main>
  );
}
