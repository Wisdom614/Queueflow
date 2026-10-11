'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const industries = [
    {
      name: 'Higher Education',
      example: 'Bursaries, Admissions, Registrar & ID Cards',
      prefix: 'EDU',
    },
    {
      name: 'Healthcare & Clinics',
      example: 'Outpatient Triage, Consultations & Pharmacy',
      prefix: 'MED',
    },
    {
      name: 'Telecom & Banking',
      example: 'SIM Replacements, Account Desk & Cashiers',
      prefix: 'FIN',
    },
    {
      name: 'Civic & Government',
      example: 'Passport Services, Civil Registry & Licensing',
      prefix: 'GOV',
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8f8f5] text-[#17201d]">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8 py-10 sm:py-20">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">
          {/* Left: Focused Value Proposition */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#17201d] leading-[1.05]">
              Join the queue without standing in it.
            </h1>

            <p className="text-base sm:text-lg text-[#56605b] max-w-xl leading-relaxed">
              A configurable, real-time queuing platform connecting customers, service desks, and public displays. Zero physical lines. No accounts required.
            </p>

            {/* Essential CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/join"
                className="h-12 px-6 bg-[#17201d] text-[#e9ff6a] font-bold text-sm uppercase tracking-wider hover:bg-[#2c3832] transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0_#17201d]"
              >
                <span>Join a Queue</span>
                <span className="font-mono text-sm">→</span>
              </Link>

              <Link
                href="/staff"
                className="h-12 px-6 bg-white border border-[#17201d] text-[#17201d] font-semibold text-sm hover:bg-[#f3f4f1] transition-colors flex items-center justify-center"
              >
                Staff Console
              </Link>
            </div>
          </div>

          {/* Right: Clean Editorial Visual */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative border-2 border-[#17201d] bg-white shadow-[8px_8px_0_#17201d] overflow-hidden">
              <Image
                src="/images/queue-freedom.jpg"
                alt="Customer comfortably waiting remotely using mobile phone"
                width={800}
                height={500}
                priority
                className="w-full h-64 sm:h-80 object-cover"
              />
              <div className="p-4 bg-white border-t-2 border-[#17201d] flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase text-[#56605b] block">
                    Live Digital Pass
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-[#17201d]">
                    Ticket B284
                  </span>
                </div>
                <Link
                  href="/ticket/B284"
                  className="px-3 py-1.5 bg-[#17201d] text-[#e9ff6a] font-mono text-xs font-bold uppercase hover:bg-[#2c3832] transition-colors"
                >
                  View Sample Pass →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Industry Configurable Section */}
      <section className="border-y border-[#cfd4cd] bg-white py-12 sm:py-16 px-4 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#56605b] block mb-2">
                Configurable Architecture
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#17201d] leading-tight">
                Engineered for any organization with physical queues.
              </h2>
              <p className="text-sm text-[#56605b] mt-4 leading-relaxed">
                QueueFlow adapts to any organization. Administrators configure facilities, services, desks, and queue rules without changing application code.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-6">
                {industries.map((ind) => (
                  <div key={ind.name} className="p-3 border border-[#cfd4cd] bg-[#f8f8f5]">
                    <span className="font-mono text-[10px] px-1.5 py-0.2 bg-[#17201d] text-[#e9ff6a] font-bold">
                      {ind.prefix}
                    </span>
                    <h4 className="font-semibold text-xs text-[#17201d] mt-1.5">{ind.name}</h4>
                    <p className="text-[10px] text-[#56605b] mt-0.5 line-clamp-2">{ind.example}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-2 border-[#17201d] bg-white shadow-[6px_6px_0_#17201d] overflow-hidden">
              <Image
                src="/images/service-center.jpg"
                alt="Modern service desks with digital display screens in high-traffic center"
                width={800}
                height={500}
                className="w-full h-64 sm:h-80 object-cover"
              />
              <div className="p-3 bg-[#17201d] text-white flex items-center justify-between text-xs font-mono">
                <span className="text-[#e9ff6a]">● Multi-Desk Lobby Operations</span>
                <span className="text-[#aeb9b1]">Real-time Desk Sync</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Core Roles Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 bg-[#f8f8f5]">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#cfd4cd] pb-4 mb-8">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#56605b]">
                Platform Interfaces
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17201d] mt-1">
                Explore the four interfaces
              </h2>
            </div>
            <p className="text-xs text-[#56605b] max-w-xs">
              All interfaces stay in sync through a shared real-time queue engine.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Customer Role */}
            <Link
              href="/join"
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
                  Join instantly from a smartphone. Track queue position, estimated wait time, and receive audio turn alerts.
                </p>
              </div>
              <span className="mt-5 font-mono text-xs font-bold text-[#17201d] flex items-center gap-1">
                Open Customer Flow →
              </span>
            </Link>

            {/* Staff Role */}
            <Link
              href="/staff"
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
                  Streamlined station interface: Call Next, start service, complete, or mark no-shows with one tap.
                </p>
              </div>
              <span className="mt-5 font-mono text-xs font-bold text-[#17201d] flex items-center gap-1">
                Open Staff Console →
              </span>
            </Link>

            {/* Public Display Role */}
            <Link
              href="/display"
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
                  High-contrast departure-style board displaying &quot;Now Serving&quot; desks and upcoming queue numbers with sound chimes.
                </p>
              </div>
              <span className="mt-5 font-mono text-xs font-bold text-[#e9ff6a] flex items-center gap-1">
                Open Public Board →
              </span>
            </Link>

            {/* Admin & Facility Manager Role */}
            <Link
              href="/admin"
              className="p-5 sm:p-6 border-2 border-[#17201d] bg-white hover:shadow-[6px_6px_0_#17201d] transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-[#17201d] text-[#e9ff6a] font-bold uppercase">
                  04 &bull; Admin
                </span>
                <h3 className="text-lg font-bold text-[#17201d] mt-3 group-hover:underline">
                  Admin & Metrics
                </h3>
                <p className="text-xs text-[#56605b] mt-2 leading-relaxed">
                  Live throughput analytics, desk allocation, service configuration, and queue health monitoring.
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
            <span className="font-bold text-[#17201d]">QueueFlow</span> &bull; Virtual Queue Management Platform
          </div>
          <div>Swiss Editorial &bull; Restrained Neobrutalism</div>
        </div>
      </footer>
    </main>
  );
}
