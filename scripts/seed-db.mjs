import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load from .env.local if present
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const [key, val] = line.split('=');
    if (key && val) process.env[key.trim()] = val.trim();
  });
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !serviceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey);

async function seed() {
  console.log('Seeding Supabase database with initial facility, services, and desks...');

  // 1. Organization
  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .upsert({
      name: 'University of Buea',
      slug: 'ubuea',
      category: 'Higher Education',
    }, { onConflict: 'slug' })
    .select()
    .single();

  if (orgErr) throw orgErr;
  console.log('Organization created:', org.name, org.id);

  // 2. Facility
  const { data: fac, error: facErr } = await supabase
    .from('facilities')
    .upsert({
      org_id: org.id,
      name: 'Central Bursary & Student Accounts',
      location: 'Administration Building, Ground Floor',
      timezone: 'Africa/Douala',
    }, { onConflict: 'id' })
    .select()
    .single();

  if (facErr) throw facErr;
  console.log('Facility created:', fac.name, fac.id);

  // 3. Services
  const servicesToInsert = [
    {
      facility_id: fac.id,
      name: 'Tuition & Fee Payment',
      code_prefix: 'B',
      avg_service_minutes: 5,
      is_active: true,
    },
    {
      facility_id: fac.id,
      name: 'Official Transcripts & Certificates',
      code_prefix: 'T',
      avg_service_minutes: 10,
      is_active: true,
    },
    {
      facility_id: fac.id,
      name: 'Student ID & Biometrics',
      code_prefix: 'S',
      avg_service_minutes: 4,
      is_active: true,
    },
  ];

  const { data: services, error: srvErr } = await supabase
    .from('services')
    .insert(servicesToInsert)
    .select();

  if (srvErr) throw srvErr;
  console.log(`Inserted ${services.length} services.`);

  const srvFees = services.find((s) => s.code_prefix === 'B');
  const srvTranscripts = services.find((s) => s.code_prefix === 'T');
  const srvCards = services.find((s) => s.code_prefix === 'S');

  // 4. Desks
  const desksToInsert = [
    {
      facility_id: fac.id,
      number: 1,
      name: 'Desk 1 - Cashier A',
      status: 'open',
      active_staff_name: 'Etonde Marie',
    },
    {
      facility_id: fac.id,
      number: 2,
      name: 'Desk 2 - Cashier B',
      status: 'open',
      active_staff_name: 'Tabe Roland',
    },
    {
      facility_id: fac.id,
      number: 3,
      name: 'Desk 3 - Records & Transcripts',
      status: 'open',
      active_staff_name: 'Ngwa Kenneth',
    },
    {
      facility_id: fac.id,
      number: 4,
      name: 'Desk 4 - ID Cards & Biometrics',
      status: 'paused',
      active_staff_name: 'Bessong Clara',
    },
  ];

  const { data: desks, error: deskErr } = await supabase
    .from('desks')
    .insert(desksToInsert)
    .select();

  if (deskErr) throw deskErr;
  console.log(`Inserted ${desks.length} desks.`);

  // 5. Desk-Services mapping
  const deskServices = [
    { desk_id: desks[0].id, service_id: srvFees.id },
    { desk_id: desks[1].id, service_id: srvFees.id },
    { desk_id: desks[2].id, service_id: srvTranscripts.id },
    { desk_id: desks[3].id, service_id: srvCards.id },
  ];

  const { error: dsErr } = await supabase
    .from('desk_services')
    .insert(deskServices);

  if (dsErr) throw dsErr;
  console.log('Desk-services associations created.');

  console.log('Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
