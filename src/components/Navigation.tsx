'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Omit navbar on public display for true fullscreen immersion
  if (pathname === '/display') {
    return null;
  }

  const links = [
    { href: '/', label: 'Overview' },
    { href: '/join', label: 'Join Queue' },
    { href: '/staff', label: 'Staff Console' },
    { href: '/admin', label: 'Admin & Metrics' },
    { href: '/display', label: 'Public Display' },
  ];

  return (
    <header className="border-b border-[#cfd4cd] bg-white sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-8 h-14 sm:h-16">
        {/* Brand */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2.5 font-bold tracking-tight text-[#17201d]"
        >
          <span className="grid size-7 sm:size-8 place-items-center bg-[#17201d] text-xs sm:text-sm font-bold text-[#e9ff6a]">
            Q
          </span>
          <span className="text-base sm:text-lg">QueueFlow</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors py-1 ${
                  isActive
                    ? 'text-[#17201d] font-bold border-b-2 border-[#17201d]'
                    : 'text-[#56605b] hover:text-[#17201d]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/join"
            onClick={() => setMobileMenuOpen(false)}
            className="inline-flex items-center border border-[#17201d] bg-[#e9ff6a] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#17201d] hover:bg-[#d8ef58] transition-colors"
          >
            Join Queue
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden size-8 grid place-items-center border border-[#cfd4cd] text-[#17201d] hover:border-[#17201d]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <span className="font-mono text-xs font-bold">✕</span>
            ) : (
              <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 5.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 5.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#cfd4cd] bg-white px-4 py-3 space-y-1 shadow-md">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 text-xs font-semibold tracking-wide ${
                  isActive
                    ? 'bg-[#17201d] text-[#e9ff6a]'
                    : 'text-[#17201d] hover:bg-[#f8f8f5]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
