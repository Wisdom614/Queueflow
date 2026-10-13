import { createClient } from '@supabase/supabase-js';

export function createServerClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://maromawwackmwsvqzltd.supabase.co';
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hcm9tYXd3YWNrbXdzdnF6bHRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTc1NDAwMSwiZXhwIjoyMTA3MzMwMDAxfQ.nSEk5Cp5V7yfDna3qqTLiyaZuXvSKsDQRmNxToOwy8Y';

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
