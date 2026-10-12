'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useQueue } from '@/lib/queue-context';

export default function PublicDisplayPage() {
  const { organization, facility, tickets, services } = useQueue();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [mobileTab, setMobileTab] = useState<'serving' | 'upnext'>('serving');

  const lastCalledIdRef = useRef<string | null>(null);

  // Clock
  useEffect(() => {
    const update = () => {
      setCurrentTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Now serving tickets (called or in_service)
  const nowServingTickets = tickets.filter(
    (t) => t.status === 'called' || t.status === 'in_service'
  );

  // Up next tickets (waiting)
  const upNextTickets = tickets.filter((t) => t.status === 'waiting');

  // Trigger audio chime when a new ticket is called
  useEffect(() => {
    const calledTicket = tickets.find((t) => t.status === 'called');
    if (calledTicket && calledTicket.id !== lastCalledIdRef.current) {
      lastCalledIdRef.current = calledTicket.id;

      if (soundEnabled && typeof window !== 'undefined') {
        try {
          const ctx = new (window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          // Dual chime
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
          osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.18); // G5
          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);

          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.7);
        } catch {
          // Autoplay policy
        }
      }
    }
  }, [tickets, soundEnabled]);

  const getServiceName = (serviceId: string) => {
    return services.find((s) => s.id === serviceId)?.name || 'General';
  };

  const toggleFullscreen = () => {
    if (typeof document !== 'undefined') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#0e1412] text-white flex flex-col justify-between selection:bg-[#e9ff6a] selection:text-[#17201d]">
      {/* Top Header */}
      <header className="border-b border-[#2d3833] bg-[#141c19] px-4 sm:px-8 py-3.5 sm:py-4">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
          {/* Left: Brand & Facility */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href={`/${organization.slug}/${facility.slug}`}
              className="size-8 sm:size-9 bg-[#17201d] text-[#e9ff6a] border border-[#2d3833] hover:border-[#e9ff6a] font-mono font-bold text-sm grid place-items-center transition-colors"
              title="Return to Facility Portal"
            >
              ←
            </Link>
            <div>
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-[#8a9690] block">
                {organization.name}
              </span>
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>{facility.name}</span>
                <span className="hidden md:inline-block font-mono text-[11px] px-2 py-0.5 bg-[#17201d] text-[#e9ff6a] border border-[#2d3833]">
                  LOBBY BOARD
                </span>
              </h1>
            </div>
          </div>

          {/* Right: Controls & Live Clock */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-2.5 py-1 text-xs font-mono border transition-colors flex items-center gap-1.5 ${
                soundEnabled
                  ? 'border-[#e9ff6a] text-[#e9ff6a] bg-[#17201d]'
                  : 'border-[#45514b] text-[#8a9690] bg-transparent'
              }`}
              title="Toggle Audio Turn Chime"
            >
              <span>{soundEnabled ? '🔔 Chime ON' : '🔕 Muted'}</span>
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden sm:inline-flex px-2.5 py-1 text-xs font-mono border border-[#45514b] text-[#8a9690] hover:text-white hover:border-white transition-colors"
            >
              ⛶ Fullscreen
            </button>

            {/* Digital Clock */}
            <div className="text-right">
              <span className="font-mono text-lg sm:text-2xl font-bold tracking-tight text-[#e9ff6a] block leading-none">
                {currentTime}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#8a9690]">
                Live Sync
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Segmented Switcher */}
        <div className="md:hidden grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#2d3833]">
          <button
            onClick={() => setMobileTab('serving')}
            className={`py-2 text-xs font-mono font-bold uppercase tracking-wider text-center border transition-all ${
              mobileTab === 'serving'
                ? 'bg-[#e9ff6a] text-[#17201d] border-[#e9ff6a]'
                : 'bg-[#17201d] text-[#8a9690] border-[#2d3833]'
            }`}
          >
            ● Now Serving ({nowServingTickets.length})
          </button>
          <button
            onClick={() => setMobileTab('upnext')}
            className={`py-2 text-xs font-mono font-bold uppercase tracking-wider text-center border transition-all ${
              mobileTab === 'upnext'
                ? 'bg-[#e9ff6a] text-[#17201d] border-[#e9ff6a]'
                : 'bg-[#17201d] text-[#8a9690] border-[#2d3833]'
            }`}
          >
            Up Next ({upNextTickets.length})
          </button>
        </div>
      </header>

      {/* Main Board Content */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-8 py-6 sm:py-8">
        <div className="grid md:grid-cols-[1.5fr_1fr] gap-6 lg:gap-8 items-start">
          {/* Column 1: NOW SERVING */}
          <section className={`${mobileTab === 'serving' ? 'block' : 'hidden md:block'} space-y-4`}>
            <div className="flex items-center justify-between border-b border-[#2d3833] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-[#e9ff6a] animate-ping" />
                <h2 className="font-mono text-xs sm:text-sm uppercase tracking-widest text-[#e9ff6a] font-bold">
                  NOW SERVING
                </h2>
              </div>
              <span className="font-mono text-[11px] text-[#8a9690]">
                Proceed to assigned desk immediately
              </span>
            </div>

            {nowServingTickets.length === 0 ? (
              <div className="border border-dashed border-[#2d3833] bg-[#141c19] p-10 sm:p-16 text-center">
                <span className="font-mono text-3xl sm:text-4xl text-[#45514b] block mb-2">---</span>
                <p className="text-base font-semibold text-white">All Desks Standby</p>
                <p className="text-xs text-[#8a9690] mt-1">
                  Next customer numbers will appear here momentarily.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {nowServingTickets.map((ticket) => {
                  const isCalling = ticket.status === 'called';
                  return (
                    <div
                      key={ticket.id}
                      className={`border-2 p-5 sm:p-6 transition-all flex flex-col justify-between ${
                        isCalling
                          ? 'border-[#e9ff6a] bg-[#1a2420] shadow-[0_0_20px_rgba(233,255,106,0.15)] animate-pulse'
                          : 'border-[#2d3833] bg-[#141c19]'
                      }`}
                    >
                      {/* Service & Calling Status Tag */}
                      <div className="flex items-center justify-between border-b border-[#2d3833] pb-3">
                        <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-[#8a9690] truncate max-w-[140px]">
                          {getServiceName(ticket.serviceId)}
                        </span>
                        <span
                          className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                            isCalling
                              ? 'bg-[#e9ff6a] text-[#17201d] border-[#e9ff6a]'
                              : 'bg-[#29966e] text-white border-[#29966e]'
                          }`}
                        >
                          {isCalling ? 'CALLING' : 'IN SERVICE'}
                        </span>
                      </div>

                      {/* Giant Ticket Number */}
                      <div className="my-6 text-center">
                        <span className="font-mono text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white block">
                          {ticket.ticketNumber}
                        </span>
                      </div>

                      {/* Desk Assignment Target */}
                      <div className="bg-[#0e1412] border border-[#2d3833] p-3 text-center">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#8a9690] block">
                          PLEASE PROCEED TO
                        </span>
                        <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#e9ff6a]">
                          DESK {ticket.deskNumber ?? 1}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Column 2: UP NEXT QUEUE */}
          <section className={`${mobileTab === 'upnext' ? 'block' : 'hidden md:block'} space-y-4`}>
            <div className="flex items-center justify-between border-b border-[#2d3833] pb-2.5">
              <h2 className="font-mono text-xs sm:text-sm uppercase tracking-widest text-white font-bold">
                UP NEXT IN QUEUE
              </h2>
              <span className="font-mono text-[11px] text-[#e9ff6a]">
                {upNextTickets.length} waiting
              </span>
            </div>

            {upNextTickets.length === 0 ? (
              <div className="border border-[#2d3833] bg-[#141c19] p-8 text-center text-xs text-[#8a9690]">
                <p className="font-mono">Queue is empty</p>
                <p className="text-[10px] mt-1 text-[#56605b]">No customers waiting right now.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                {upNextTickets.map((t, index) => (
                  <div
                    key={t.id}
                    className={`p-3.5 border transition-all flex items-center justify-between ${
                      index === 0
                        ? 'border-[#e9ff6a] bg-[#17201d]'
                        : 'border-[#2d3833] bg-[#141c19]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-[#8a9690] w-6">
                        #{index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-2xl font-extrabold text-white">
                            {t.ticketNumber}
                          </span>
                          {index === 0 && (
                            <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 bg-[#e9ff6a] text-[#17201d] font-bold">
                              NEXT
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-[#8a9690] block">
                          {getServiceName(t.serviceId)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs text-[#8a9690] block">
                        {new Date(t.joinedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="font-mono text-[10px] text-[#56605b]">
                        Ticket issued
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Public Board Ticker Footer */}
      <footer className="border-t border-[#2d3833] bg-[#141c19] px-4 sm:px-8 py-3">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-[#8a9690]">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#29966e]" />
            <span>Automated Audio Turn Announcements Active</span>
          </div>
          <div className="text-[#e9ff6a] text-center sm:text-right">
            Join virtually without waiting at the desk &bull; queueflow.app
          </div>
        </div>
      </footer>
    </main>
  );
}
