import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://maromawwackmwsvqzltd.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hcm9tYXd3YWNrbXdzdnF6bHRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3NTQwMDEsImV4cCI6MjEwNzMzMDAwMX0.eygDI7hJkjtPMGxPFnYo-lBZ11uCfa35X3590E9DvpA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
