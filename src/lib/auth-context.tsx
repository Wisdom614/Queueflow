'use client';

import React, { createContext, useContext } from 'react';
import { AuthUser, UserRole } from '@/types/queue';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (role: UserRole, name: string, pin: string, deskNumber?: number) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'queueflow_auth_session_v1';

let cachedUser: AuthUser | null = null;
let hasLoaded = false;
const authListeners = new Set<() => void>();

function getAuthSnapshot(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  if (!hasLoaded) {
    hasLoaded = true;
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        cachedUser = JSON.parse(stored);
      }
    } catch {
      // ignore
    }
  }
  return cachedUser;
}

function getAuthServerSnapshot(): AuthUser | null {
  return null;
}

function subscribeAuth(callback: () => void) {
  authListeners.add(callback);
  return () => {
    authListeners.delete(callback);
  };
}

function updateAuthUser(newUser: AuthUser | null) {
  cachedUser = newUser;
  try {
    if (newUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
  authListeners.forEach((l) => l());
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = React.useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthServerSnapshot);

  const login = (role: UserRole, name: string, pin: string, deskNumber?: number) => {
    const cleanPin = pin.trim();

    // Verification rules
    if (role === 'admin') {
      if (cleanPin !== '8888') {
        return { success: false, error: 'Invalid Supervisor PIN. (Default demo PIN is 8888)' };
      }
      const adminUser: AuthUser = {
        id: 'usr-admin',
        name: name.trim() || 'Facility Director',
        role: 'admin',
      };
      updateAuthUser(adminUser);
      return { success: true };
    }

    // Operator role
    if (cleanPin !== '1234' && cleanPin !== '8888') {
      return { success: false, error: 'Invalid Staff Station PIN. (Default demo PIN is 1234)' };
    }

    const operatorUser: AuthUser = {
      id: `usr-op-${Date.now().toString().slice(-4)}`,
      name: name.trim() || 'Counter Operator',
      role: 'operator',
      assignedDeskNumber: deskNumber || 1,
    };

    updateAuthUser(operatorUser);
    return { success: true };
  };

  const logout = () => {
    updateAuthUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
