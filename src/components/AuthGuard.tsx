'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types/queue';

interface AuthGuardProps {
  requiredRole: UserRole;
  children: React.ReactNode;
}

export function AuthGuard({ requiredRole, children }: AuthGuardProps) {
  const { user, isAuthenticated, login, logout } = useAuth();

  const [selectedStaffName, setSelectedStaffName] = useState('Etonde Marie');
  const [selectedDesk, setSelectedDesk] = useState(1);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  // If user is already authenticated with required role (or admin accessing operator area)
  const isAuthorized =
    isAuthenticated && (user?.role === requiredRole || (user?.role === 'admin' && requiredRole === 'operator'));

  if (isAuthorized) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Persistent Operator Station Bar */}
        <div className="bg-[#17201d] text-[#f8f8f5] px-4 sm:px-8 py-2 border-b border-[#2c3832] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="size-2 rounded-full bg-emerald-400"></span>
            <span>
              AUTHENTICATED: <strong className="text-[#e9ff6a]">{user?.name}</strong> (
              {user?.role === 'admin' ? 'SUPERVISOR' : `DESK ${user?.assignedDeskNumber || 1}`})
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user?.role === 'admin' && requiredRole === 'operator' && (
              <Link href="/admin" className="text-[#e9ff6a] underline hover:text-white">
                Open Admin Panel →
              </Link>
            )}
            <button
              type="button"
              onClick={logout}
              className="text-[#aeb9b1] hover:text-white underline uppercase text-[11px]"
            >
              Sign Out / Switch Operator
            </button>
          </div>
        </div>

        <div className="flex-1">{children}</div>
      </div>
    );
  }

  // Render Login Lockscreen
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = login(
      requiredRole,
      requiredRole === 'admin' ? 'Facility Director' : selectedStaffName,
      pin,
      selectedDesk
    );

    if (!result.success) {
      setError(result.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#f8f8f5]">
      <div className="w-full max-w-md border-2 border-[#17201d] bg-white p-6 sm:p-8 shadow-[8px_8px_0_#17201d]">
        <div className="border-b border-[#cfd4cd] pb-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#17201d] text-[#e9ff6a]">
              RESTRICTED ACCESS
            </span>
            <span className="font-mono text-xs text-[#56605b]">
              {requiredRole === 'admin' ? 'Role: Facility Admin' : 'Role: Counter Operator'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17201d] tracking-tight mt-3">
            {requiredRole === 'admin' ? 'Supervisor Access' : 'Station Authentication'}
          </h1>
          <p className="text-xs text-[#56605b] mt-1">
            {requiredRole === 'admin'
              ? 'Enter facility supervisor passcode to access queue configuration and analytics.'
              : 'Sign in to your assigned counter desk to call and serve tickets.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {requiredRole === 'operator' && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#17201d] uppercase font-mono mb-1">
                  Select Staff Member
                </label>
                <select
                  value={selectedStaffName}
                  onChange={(e) => {
                    setSelectedStaffName(e.target.value);
                    if (e.target.value === 'Etonde Marie') setSelectedDesk(1);
                    if (e.target.value === 'Tabe Roland') setSelectedDesk(2);
                    if (e.target.value === 'Ngwa Kenneth') setSelectedDesk(3);
                    if (e.target.value === 'Bessong Clara') setSelectedDesk(4);
                  }}
                  className="w-full h-11 px-3 border border-[#cfd4cd] text-sm bg-white focus:outline-none focus:border-[#17201d] font-sans"
                >
                  <option value="Etonde Marie">Etonde Marie (Cashier A)</option>
                  <option value="Tabe Roland">Tabe Roland (Cashier B)</option>
                  <option value="Ngwa Kenneth">Ngwa Kenneth (Records & Transcripts)</option>
                  <option value="Bessong Clara">Bessong Clara (ID Cards & Biometrics)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17201d] uppercase font-mono mb-1">
                  Operating Desk
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSelectedDesk(num)}
                      className={`h-10 font-mono text-xs font-bold border transition-colors ${
                        selectedDesk === num
                          ? 'border-[#17201d] bg-[#17201d] text-[#e9ff6a]'
                          : 'border-[#cfd4cd] bg-white text-[#17201d] hover:border-[#17201d]'
                      }`}
                    >
                      Desk {num}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#17201d] uppercase font-mono">
                {requiredRole === 'admin' ? 'Supervisor PIN' : 'Staff Passcode'}
              </label>
              <span className="font-mono text-[10px] text-[#56605b]">
                Demo PIN: {requiredRole === 'admin' ? '8888' : '1234'}
              </span>
            </div>
            <input
              type="password"
              inputMode="numeric"
              placeholder={requiredRole === 'admin' ? 'Enter 8888' : 'Enter 1234'}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full h-11 px-3 border border-[#cfd4cd] font-mono text-sm tracking-widest bg-white focus:outline-none focus:border-[#17201d]"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-[#17201d] text-[#e9ff6a] font-bold text-xs uppercase tracking-wider hover:bg-[#2c3832] transition-colors flex items-center justify-center gap-2 mt-2 shadow-[4px_4px_0_#17201d]"
          >
            <span>Authenticate Station</span>
            <span className="font-mono">→</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#cfd4cd] text-center font-mono text-[11px] text-[#56605b]">
          <Link href="/" className="hover:underline">
            ← Return to Public Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
