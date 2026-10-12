import { describe, it, expect } from 'vitest';
import { getFacilityInitialData } from '../supabase/queue-service';

describe('Supabase Integration Tests', () => {
  it('successfully fetches seeded facility, services, and desks from Supabase', async () => {
    // Safely reads from environment or .env.local
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // In CI environments without live Supabase secrets, skip or read from env
      const fs = await import('fs');
      const path = await import('path');
      const envPath = path.resolve(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach((line) => {
          const [key, val] = line.split('=');
          if (key && val) process.env[key.trim()] = val.trim();
        });
      }
    }

    const data = await getFacilityInitialData('ubuea');

    expect(data.organization).toBeDefined();
    expect(data.organization.name).toBe('University of Buea');
    expect(data.facility).toBeDefined();
    expect(data.facility.name).toBe('Central Bursary & Student Accounts');
    expect(data.services.length).toBeGreaterThanOrEqual(3);
    expect(data.desks.length).toBeGreaterThanOrEqual(4);

    const feeService = data.services.find((s) => s.codePrefix === 'B');
    expect(feeService).toBeDefined();
    expect(feeService?.name).toBe('Tuition & Fee Payment');
  });
});
