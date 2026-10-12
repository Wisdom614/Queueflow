'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useQueue } from '@/lib/queue-context';
import { TicketStatus } from '@/types/queue';

export default function TicketTrackerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;

  const {
    getTicket,
    getService,
    getWaitingAheadCount,
    getEstimatedWaitMinutes,
    facility,
    organization,
    cancelTicket,
  } = useQueue();

  const ticket = getTicket(ticketId);
  const service = ticket ? getService(ticket.serviceId) : undefined;
  const aheadCount = ticket ? getWaitingAheadCount(ticket) : 0;
  const estMinutes = ticket ? getEstimatedWaitMinutes(ticket) : 0;

  const hasBeepedRef = React.useRef(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const playChime = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
      setAudioUnlocked(true);
    } catch {
      // Audio autoplay restrictions
    }
  }, []);

  // Sound chime and vibrate when called
  useEffect(() => {
    if (ticket?.status === 'called' && !hasBeepedRef.current) {
      hasBeepedRef.current = true;
      playChime();

      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([200, 100, 200, 100, 400]);
        } catch {
          // ignore
        }
      }
    }
  }, [ticket?.status, playChime]);

  if (!ticket) {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-16 text-center">
        <div className="border border-[#17201d] bg-white p-8 shadow-[6px_6px_0_#cfd4cd]">
          <span className="font-mono text-3xl font-bold text-[#17201d]">?</span>
          <h1 className="text-xl font-bold text-[#17201d] mt-4">Ticket Not Found</h1>
          <p className="text-xs text-[#56605b] mt-2 leading-relaxed">
            We couldn&apos;t find an active ticket with number <span className="font-mono font-bold text-[#17201d]">{ticketId}</span>.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href={`/${organization.slug}/${facility.slug}`}
              className="inline-flex h-11 items-center justify-center bg-[#17201d] text-[#e9ff6a] font-bold text-xs uppercase tracking-wider hover:bg-[#2e3b35]"
            >
              Take a new ticket
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center border border-[#cfd4cd] text-xs font-semibold hover:border-[#17201d]"
            >
              Return Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'called':
        return (
          <div className="bg-[#e9ff6a] text-[#17201d] border border-[#17201d] px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 animate-bounce">
            <span className="size-2 rounded-full bg-[#17201d]" />
            Your Turn Now — Proceed to Desk {ticket.deskNumber ?? 1}
          </div>
        );
      case 'in_service':
        return (
          <div className="bg-[#dff4e8] text-[#1b7752] border border-[#1b7752] px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
            <span className="size-2 rounded-full bg-[#1b7752] animate-pulse" />
            Being Served at Desk {ticket.deskNumber ?? 1}
          </div>
        );
      case 'completed':
        return (
          <div className="bg-[#f3f4f1] text-[#56605b] border border-[#cfd4cd] px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2">
            ✓ Service Completed
          </div>
        );
      case 'cancelled':
        return (
          <div className="bg-[#fdf2f2] text-[#9b1c1c] border border-[#e02424] px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2">
            Ticket Cancelled
          </div>
        );
      case 'no_show':
        return (
          <div className="bg-[#fef8e7] text-[#8e4b10] border border-[#e3a008] px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2">
            Marked as No-Show
          </div>
        );
      case 'waiting':
      default:
        return (
          <div className="bg-[#17201d] text-[#e9ff6a] px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#29966e] animate-pulse" />
              In Virtual Queue
            </span>
            <span className="text-[10px] text-[#aeb9b1]">Live updates</span>
          </div>
        );
    }
  };

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8 sm:py-12">
      {/* Editorial Neobrutalist Ticket Card */}
      <div className="border-2 border-[#17201d] bg-white shadow-[8px_8px_0_#17201d]">
        {/* Organization / Header */}
        <div className="bg-[#f8f8f5] border-b-2 border-[#17201d] p-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#56605b]">
              {organization.name}
            </p>
            <p className="text-xs font-bold text-[#17201d]">{facility.name}</p>
          </div>
          <div className="font-mono text-[11px] text-[#56605b] border border-[#cfd4cd] bg-white px-2 py-0.5">
            {new Date(ticket.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Status Banner */}
        <div className="p-4 bg-[#17201d] border-b border-[#314039]">
          {getStatusBadge(ticket.status)}
        </div>

        {/* Ticket Main Display */}
        <div className="p-6 text-center border-b border-[#cfd4cd]">
          <p className="font-mono text-xs uppercase tracking-wider text-[#56605b]">
            {service?.name || 'Service Queue'}
          </p>

          <h2 className="font-mono text-7xl sm:text-8xl font-bold tracking-tight text-[#17201d] my-3">
            {ticket.ticketNumber}
          </h2>

          <p className="text-xs text-[#56605b]">
            Ticket holder:{' '}
            <span className="font-semibold text-[#17201d]">{ticket.customerName}</span>
          </p>
        </div>

        {/* Dynamic Metric Grid */}
        {ticket.status === 'waiting' && (
          <div className="grid grid-cols-2 divide-x divide-[#cfd4cd] border-b border-[#cfd4cd] bg-[#f8f8f5]">
            <div className="p-4 text-center">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#56605b]">
                People Ahead
              </p>
              <p className="text-3xl font-bold font-mono text-[#17201d] mt-1">
                {aheadCount}
              </p>
            </div>
            <div className="p-4 text-center">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#56605b]">
                Est. Wait Time
              </p>
              <p className="text-3xl font-bold font-mono text-[#17201d] mt-1">
                ~{estMinutes} <span className="text-xs font-normal">min</span>
              </p>
            </div>
          </div>
        )}

        {ticket.status === 'called' && (
          <div className="p-5 bg-[#e9ff6a] border-b-2 border-[#17201d] text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-[#17201d] font-bold">
              Please proceed immediately to:
            </p>
            <p className="text-4xl font-extrabold text-[#17201d] my-1 font-mono">
              DESK {ticket.deskNumber ?? 1}
            </p>
            {ticket.staffName && (
              <p className="text-xs text-[#17201d]">Attendant: {ticket.staffName}</p>
            )}
          </div>
        )}

        {/* Audio & Vibration Unlock Banner */}
        <div className="p-3 bg-[#f8f8f5] border-b border-[#cfd4cd]">
          <button
            type="button"
            onClick={playChime}
            className="w-full py-2 px-3 border border-[#17201d] bg-white hover:bg-[#e9ff6a] transition-colors flex items-center justify-between text-xs font-mono"
          >
            <span className="flex items-center gap-2">
              <span>{audioUnlocked ? '🔊' : '🔔'}</span>
              <span className="font-bold">
                {audioUnlocked ? 'Turn Alerts Enabled' : 'Tap to Enable Audio & Vibration'}
              </span>
            </span>
            <span className="text-[10px] text-[#56605b] uppercase font-semibold">
              {audioUnlocked ? 'Test Sound' : 'Tap to Unlock'}
            </span>
          </button>
        </div>

        {/* Guidance Text */}
        <div className="p-4 bg-white text-xs text-[#56605b] border-b border-[#cfd4cd]">
          {ticket.status === 'waiting' && (
            <div className="flex items-start gap-2.5">
              <span className="text-base text-[#1b7752]">✓</span>
              <p className="leading-relaxed">
                You are not required to stand at the service area. Keep this window open or return when you see your estimated wait time reach 0.
              </p>
            </div>
          )}
          {ticket.status === 'called' && (
            <p className="font-medium text-[#17201d] leading-relaxed">
              Your ticket is currently on the display board. Please present this screen to Desk {ticket.deskNumber ?? 1}.
            </p>
          )}
          {ticket.status === 'completed' && (
            <p className="text-center text-[#1b7752] font-medium">
              Thank you for using QueueFlow. Have a productive day!
            </p>
          )}
        </div>

        {/* Actions / Management */}
        <div className="p-4 bg-[#f8f8f5] flex items-center justify-between gap-3 text-xs">
          <Link
            href="/join"
            className="text-[#56605b] hover:text-[#17201d] underline font-mono"
          >
            ← Join another queue
          </Link>

          {ticket.status === 'waiting' && (
            <div>
              {showCancelConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#e02424]">Sure?</span>
                  <button
                    onClick={() => cancelTicket(ticket.id)}
                    className="px-2 py-1 bg-[#e02424] text-white font-bold text-xs"
                  >
                    Yes, Cancel
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-2 py-1 border border-[#cfd4cd] bg-white text-xs"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-[#9b1c1c] hover:underline font-mono"
                >
                  Leave Queue
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cross-device link helper */}
      <div className="mt-6 border border-[#cfd4cd] bg-white p-3.5 text-center">
        <p className="font-mono text-[10px] uppercase tracking-wider text-[#56605b]">
          Keep your position saved
        </p>
        <p className="text-xs text-[#17201d] font-mono mt-1 select-all break-all bg-[#f8f8f5] p-2 border border-[#cfd4cd]">
          {typeof window !== 'undefined' ? window.location.href : `/ticket/${ticket.ticketNumber}`}
        </p>
      </div>
    </main>
  );
}
