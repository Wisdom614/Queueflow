'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createOrganizationAction,
  OnboardServiceInput,
  OnboardDeskInput,
} from '@/app/actions/queue';

interface IndustryPreset {
  category: string;
  defaultFacilityName: string;
  defaultLocation: string;
  services: OnboardServiceInput[];
  desks: OnboardDeskInput[];
}

const PRESET_TEMPLATES: Record<string, IndustryPreset> = {
  'Higher Education': {
    category: 'Higher Education',
    defaultFacilityName: 'Central Student Services',
    defaultLocation: 'Administrative Complex, Ground Floor',
    services: [
      { name: 'Tuition & Fee Payment', codePrefix: 'B', avgServiceMinutes: 5 },
      { name: 'Official Transcripts & Certificates', codePrefix: 'T', avgServiceMinutes: 10 },
      { name: 'Student ID & Biometrics', codePrefix: 'S', avgServiceMinutes: 4 },
    ],
    desks: [
      { number: 1, name: 'Desk 1 - Cashier A', activeStaffName: 'Etonde Marie' },
      { number: 2, name: 'Desk 2 - Cashier B', activeStaffName: 'Tabe Roland' },
      { number: 3, name: 'Desk 3 - Records & Clearance', activeStaffName: 'Ngwa Kenneth' },
    ],
  },
  'Healthcare & Clinics': {
    category: 'Healthcare & Clinics',
    defaultFacilityName: 'Main Outpatient Clinic',
    defaultLocation: 'Building A, Ground Floor Intake',
    services: [
      { name: 'General Triage & Vital Signs', codePrefix: 'T', avgServiceMinutes: 4 },
      { name: 'Physician Consultation Room', codePrefix: 'C', avgServiceMinutes: 12 },
      { name: 'Pharmacy & Medication Dispensing', codePrefix: 'P', avgServiceMinutes: 4 },
    ],
    desks: [
      { number: 1, name: 'Triage Room 1', activeStaffName: 'Nurse Evelyn' },
      { number: 2, name: 'Consultation Room A', activeStaffName: 'Dr. Mensah' },
      { number: 3, name: 'Pharmacy Counter 1', activeStaffName: 'Pharm. Daniel' },
    ],
  },
  'Telecommunications': {
    category: 'Telecommunications',
    defaultFacilityName: 'Downtown Service Center',
    defaultLocation: 'Commercial Avenue, Suite 100',
    services: [
      { name: 'SIM Registration & eSIM Setup', codePrefix: 'S', avgServiceMinutes: 5 },
      { name: 'Postpaid Billing & Cash Desk', codePrefix: 'B', avgServiceMinutes: 4 },
      { name: 'Technical Device & Fiber Support', codePrefix: 'C', avgServiceMinutes: 8 },
    ],
    desks: [
      { number: 1, name: 'Counter 1 - Quick Cashier', activeStaffName: 'Nathalie S.' },
      { number: 2, name: 'Counter 2 - SIM Desk', activeStaffName: 'Boris M.' },
      { number: 3, name: 'Counter 3 - Tech Support', activeStaffName: 'Arthur K.' },
    ],
  },
  'Banking & Finance': {
    category: 'Banking & Finance',
    defaultFacilityName: 'Main Commercial Branch',
    defaultLocation: 'Financial District Boulevard',
    services: [
      { name: 'Cash Deposits & Withdrawals', codePrefix: 'C', avgServiceMinutes: 4 },
      { name: 'Account Operations & Cards', codePrefix: 'A', avgServiceMinutes: 8 },
      { name: 'Foreign Exchange & Remittance', codePrefix: 'F', avgServiceMinutes: 6 },
    ],
    desks: [
      { number: 1, name: 'Teller Window 1', activeStaffName: 'Claire B.' },
      { number: 2, name: 'Teller Window 2', activeStaffName: 'Patrick N.' },
      { number: 3, name: 'Customer Relations Desk', activeStaffName: 'Diane T.' },
    ],
  },
  'Civic & Government': {
    category: 'Civic & Government',
    defaultFacilityName: 'Public Service Hall',
    defaultLocation: 'City Administrative Center',
    services: [
      { name: 'Passport & Identity Verification', codePrefix: 'P', avgServiceMinutes: 10 },
      { name: 'Civil Registry & Birth Records', codePrefix: 'R', avgServiceMinutes: 7 },
      { name: 'Licensing & Document Attestation', codePrefix: 'L', avgServiceMinutes: 5 },
    ],
    desks: [
      { number: 1, name: 'Counter 1 - Intake', activeStaffName: 'Officer Ndip' },
      { number: 2, name: 'Counter 2 - Processing', activeStaffName: 'Officer Taku' },
    ],
  },
};

export default function OnboardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Organization & Facility Profile
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [category, setCategory] = useState('Healthcare & Clinics');
  const [facilityName, setFacilityName] = useState('');
  const [facilitySlug, setFacilitySlug] = useState('');
  const [location, setLocation] = useState('');

  // Step 2: Services
  const [services, setServices] = useState<OnboardServiceInput[]>(
    PRESET_TEMPLATES['Healthcare & Clinics'].services
  );

  // Step 3: Desks
  const [desks, setDesks] = useState<OnboardDeskInput[]>(
    PRESET_TEMPLATES['Healthcare & Clinics'].desks
  );

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{
    orgSlug: string;
    facilitySlug: string;
  } | null>(null);

  // Auto-slugify helper
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const handleOrgNameChange = (val: string) => {
    setOrgName(val);
    setOrgSlug(slugify(val));
  };

  const handleFacilityNameChange = (val: string) => {
    setFacilityName(val);
    setFacilitySlug(slugify(val));
  };

  const applyCategoryPreset = (selectedCat: string) => {
    setCategory(selectedCat);
    const preset = PRESET_TEMPLATES[selectedCat];
    if (preset) {
      if (!facilityName) {
        setFacilityName(preset.defaultFacilityName);
        setFacilitySlug(slugify(preset.defaultFacilityName));
      }
      if (!location) {
        setLocation(preset.defaultLocation);
      }
      setServices([...preset.services]);
      setDesks([...preset.desks]);
    }
  };

  // Service Management
  const addServiceRow = () => {
    setServices((prev) => [
      ...prev,
      {
        name: `Service Point ${prev.length + 1}`,
        codePrefix: String.fromCharCode(65 + (prev.length % 26)),
        avgServiceMinutes: 5,
      },
    ]);
  };

  const updateServiceRow = (index: number, field: keyof OnboardServiceInput, val: any) => {
    setServices((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const removeServiceRow = (index: number) => {
    if (services.length <= 1) return;
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  // Desk Management
  const addDeskRow = () => {
    setDesks((prev) => [
      ...prev,
      {
        number: prev.length + 1,
        name: `Counter ${prev.length + 1}`,
        activeStaffName: `Attendant ${prev.length + 1}`,
      },
    ]);
  };

  const updateDeskRow = (index: number, field: keyof OnboardDeskInput, val: any) => {
    setDesks((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const removeDeskRow = (index: number) => {
    if (desks.length <= 1) return;
    setDesks((prev) => prev.filter((_, i) => i !== index));
  };

  // Submission handler
  const handleLaunch = async () => {
    setError(null);
    if (!orgName.trim()) {
      setError('Please provide an organization name.');
      setCurrentStep(1);
      return;
    }
    if (!facilityName.trim()) {
      setError('Please provide a branch or facility name.');
      setCurrentStep(1);
      return;
    }
    if (services.length === 0) {
      setError('Please configure at least one service queue.');
      setCurrentStep(2);
      return;
    }
    if (desks.length === 0) {
      setError('Please configure at least one service counter.');
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createOrganizationAction({
        organizationName: orgName.trim(),
        organizationSlug: orgSlug.trim() || slugify(orgName),
        category: category.trim(),
        facilityName: facilityName.trim(),
        facilitySlug: facilitySlug.trim() || slugify(facilityName),
        location: location.trim() || 'Main Operations Center',
        services,
        desks,
      });

      if (!res.success || !res.orgSlug || !res.facilitySlug) {
        throw new Error(res.error || 'Failed to create organization');
      }

      setCreatedResult({
        orgSlug: res.orgSlug,
        facilitySlug: res.facilitySlug,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to register organization. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Confirmation Screen
  if (createdResult) {
    const orgUrl = `/${createdResult.orgSlug}/${createdResult.facilitySlug}`;
    const adminUrl = `/${createdResult.orgSlug}/admin`;
    const staffUrl = `/${createdResult.orgSlug}/${createdResult.facilitySlug}/staff`;
    const displayUrl = `/${createdResult.orgSlug}/${createdResult.facilitySlug}/display`;

    return (
      <main className="min-h-screen bg-[#f8f8f5] text-[#17201d] py-12 px-4 sm:px-8">
        <div className="mx-auto max-w-3xl border-2 border-[#17201d] bg-white shadow-[8px_8px_0_#17201d] p-6 sm:p-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="size-3 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider font-bold text-emerald-800">
              Workspace Successfully Provisioned
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#17201d] tracking-tight">
            {orgName} is Live on QueueFlow
          </h1>

          <p className="text-sm text-[#56605b] mt-2 leading-relaxed">
            Your facility, service queues, counters, and real-time synchronization channels have been created and isolated in the database.
          </p>

          {/* Quick Endpoints Card */}
          <div className="mt-8 border border-[#cfd4cd] bg-[#f8f8f5] p-5 space-y-3 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#cfd4cd]">
              <span className="text-[#56605b]">Customer Mobile Entry:</span>
              <strong className="text-[#17201d]">{orgUrl}</strong>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#cfd4cd]">
              <span className="text-[#56605b]">Facility Command & Posters:</span>
              <strong className="text-[#17201d]">{adminUrl}</strong>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-[#56605b]">Lobby TV Screen:</span>
              <strong className="text-[#17201d]">{displayUrl}</strong>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <Link
              href={adminUrl}
              className="h-14 bg-[#17201d] text-[#e9ff6a] font-bold text-xs uppercase tracking-wider hover:bg-[#2c3832] transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0_#17201d]"
            >
              <span>Download Entrance QR Posters</span>
              <span className="font-mono text-base">→</span>
            </Link>

            <Link
              href={staffUrl}
              className="h-14 bg-white border-2 border-[#17201d] text-[#17201d] font-bold text-xs uppercase tracking-wider hover:bg-[#f3f4f1] transition-colors flex items-center justify-center"
            >
              Open Staff Calling Station
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-[#cfd4cd] flex items-center justify-between text-xs text-[#56605b]">
            <Link href={orgUrl} className="hover:text-[#17201d] underline">
              View Mobile Customer Kiosk →
            </Link>
            <Link href="/" className="hover:text-[#17201d] font-mono">
              Return to Platform Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f8f5] text-[#17201d] py-10 px-4 sm:px-8 pb-20">
      <div className="mx-auto max-w-4xl">
        {/* Header Title */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-[#56605b] hover:text-[#17201d] mb-3"
          >
            ← Return to Home
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#cfd4cd] pb-4">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#56605b] block">
                Self-Service Onboarding
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#17201d] mt-0.5">
                Register Your Organization
              </h1>
            </div>
            <span className="font-mono text-xs px-3 py-1 bg-[#17201d] text-[#e9ff6a] font-bold uppercase self-start sm:self-auto">
              Step {currentStep} of 4
            </span>
          </div>
        </div>

        {/* Step Progress Pills */}
        <div className="grid grid-cols-4 gap-2 mb-8 font-mono text-xs">
          {[
            { num: 1, label: '01. Profile & Branch' },
            { num: 2, label: '02. Service Queues' },
            { num: 3, label: '03. Desks & Staff' },
            { num: 4, label: '04. Review & Launch' },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setCurrentStep(s.num)}
              className={`p-3 text-left border transition-all ${
                currentStep === s.num
                  ? 'border-[#17201d] bg-[#17201d] text-[#e9ff6a] font-bold'
                  : currentStep > s.num
                  ? 'border-[#17201d] bg-white text-[#17201d] font-semibold'
                  : 'border-[#cfd4cd] bg-white text-[#8a9690]'
              }`}
            >
              <span className="block truncate">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 border border-rose-400 bg-rose-50 text-rose-800 text-xs font-mono">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 1: ORGANIZATION & FACILITY PROFILE */}
        {/* =================================================================== */}
        {currentStep === 1 && (
          <section className="border-2 border-[#17201d] bg-white p-6 sm:p-8 shadow-[6px_6px_0_#17201d] space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#17201d]">Entity & Branch Information</h2>
              <p className="text-xs text-[#56605b] mt-1">
                Enter your organization details. This creates your isolated tenant namespace.
              </p>
            </div>

            {/* Quick Sector Presets Buttons */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#56605b] mb-2 font-bold">
                Industry Sector (Loads Recommended Services):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.keys(PRESET_TEMPLATES).map((catName) => (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => applyCategoryPreset(catName)}
                    className={`p-2.5 text-xs text-left border transition-all ${
                      category === catName
                        ? 'border-[#17201d] bg-[#17201d] text-[#e9ff6a] font-bold'
                        : 'border-[#cfd4cd] bg-[#f8f8f5] hover:border-[#17201d]'
                    }`}
                  >
                    {catName}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#17201d] mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => handleOrgNameChange(e.target.value)}
                  placeholder="e.g. Douala Port Authority, City Health Clinic"
                  className="w-full h-11 px-3.5 border border-[#17201d] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#17201d]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#17201d] mb-1">
                  Workspace URL Slug *
                </label>
                <div className="flex items-center border border-[#17201d] bg-[#f8f8f5] px-3 h-11 text-xs font-mono">
                  <span className="text-[#56605b]">queueflow.app/</span>
                  <input
                    type="text"
                    value={orgSlug}
                    onChange={(e) => setOrgSlug(slugify(e.target.value))}
                    placeholder="douala-port"
                    className="flex-1 bg-transparent px-1 font-bold text-[#17201d] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 pt-2 border-t border-[#cfd4cd]">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#17201d] mb-1">
                  First Branch or Facility Name *
                </label>
                <input
                  type="text"
                  value={facilityName}
                  onChange={(e) => handleFacilityNameChange(e.target.value)}
                  placeholder="e.g. Main Passenger Terminal, Central Branch"
                  className="w-full h-11 px-3.5 border border-[#17201d] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#17201d]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#17201d] mb-1">
                  Facility Slug *
                </label>
                <div className="flex items-center border border-[#17201d] bg-[#f8f8f5] px-3 h-11 text-xs font-mono">
                  <span className="text-[#56605b]">.../</span>
                  <input
                    type="text"
                    value={facilitySlug}
                    onChange={(e) => setFacilitySlug(slugify(e.target.value))}
                    placeholder="main-terminal"
                    className="flex-1 bg-transparent px-1 font-bold text-[#17201d] focus:outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono font-bold uppercase text-[#17201d] mb-1">
                  Physical Location / Address
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Maritime Avenue, Bonanjo, Douala"
                  className="w-full h-11 px-3.5 border border-[#17201d] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#17201d]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  if (!orgName.trim() || !facilityName.trim()) {
                    setError('Please provide organization name and facility name.');
                    return;
                  }
                  setError(null);
                  setCurrentStep(2);
                }}
                className="h-12 px-8 bg-[#17201d] text-[#e9ff6a] font-bold text-xs uppercase tracking-wider hover:bg-[#2c3832] transition-colors flex items-center gap-2"
              >
                <span>Continue to Service Queues</span>
                <span className="font-mono text-sm">→</span>
              </button>
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* STEP 2: SERVICE QUEUES & PREFIXES */}
        {/* =================================================================== */}
        {currentStep === 2 && (
          <section className="border-2 border-[#17201d] bg-white p-6 sm:p-8 shadow-[6px_6px_0_#17201d] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#cfd4cd] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#17201d]">Service Queues & Ticket Codes</h2>
                <p className="text-xs text-[#56605b] mt-0.5">
                  Configure the services customers can choose from when scanning at the entrance.
                </p>
              </div>
              <button
                type="button"
                onClick={addServiceRow}
                className="px-3.5 py-2 border border-[#17201d] bg-[#f8f8f5] hover:bg-[#17201d] hover:text-[#e9ff6a] font-mono text-xs font-bold uppercase transition-colors"
              >
                + Add Service
              </button>
            </div>

            {/* Services Table */}
            <div className="space-y-3">
              {services.map((srv, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-[#17201d] bg-[#f8f8f5] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  <div className="sm:col-span-6">
                    <label className="block text-[10px] font-mono uppercase text-[#56605b] mb-1 font-bold">
                      Service Name
                    </label>
                    <input
                      type="text"
                      value={srv.name}
                      onChange={(e) => updateServiceRow(idx, 'name', e.target.value)}
                      placeholder="e.g. Cashier, Document Attestation"
                      className="w-full h-10 px-3 border border-[#cfd4cd] bg-white text-xs font-medium focus:outline-none focus:border-[#17201d]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-mono uppercase text-[#56605b] mb-1 font-bold">
                      Ticket Prefix
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={srv.codePrefix}
                      onChange={(e) => updateServiceRow(idx, 'codePrefix', e.target.value.toUpperCase())}
                      placeholder="B"
                      className="w-full h-10 px-3 border border-[#cfd4cd] bg-white text-xs font-mono font-bold text-center uppercase focus:outline-none focus:border-[#17201d]"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-mono uppercase text-[#56605b] mb-1 font-bold">
                      Est. Minutes
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={srv.avgServiceMinutes}
                      onChange={(e) =>
                        updateServiceRow(idx, 'avgServiceMinutes', parseInt(e.target.value) || 5)
                      }
                      className="w-full h-10 px-3 border border-[#cfd4cd] bg-white text-xs font-mono text-center focus:outline-none focus:border-[#17201d]"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    {services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeServiceRow(idx)}
                        className="text-rose-600 hover:text-rose-800 text-xs font-mono p-1"
                        title="Remove Service"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-[#cfd4cd]">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="h-12 px-6 border border-[#17201d] bg-white font-mono text-xs font-bold hover:bg-[#f3f4f1] transition-colors"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={() => {
                  if (services.length === 0) {
                    setError('Please configure at least one service queue.');
                    return;
                  }
                  setError(null);
                  setCurrentStep(3);
                }}
                className="h-12 px-8 bg-[#17201d] text-[#e9ff6a] font-bold text-xs uppercase tracking-wider hover:bg-[#2c3832] transition-colors flex items-center gap-2"
              >
                <span>Continue to Desks & Counters</span>
                <span className="font-mono text-sm">→</span>
              </button>
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* STEP 3: DESKS & COUNTERS */}
        {/* =================================================================== */}
        {currentStep === 3 && (
          <section className="border-2 border-[#17201d] bg-white p-6 sm:p-8 shadow-[6px_6px_0_#17201d] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#cfd4cd] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#17201d]">Service Desks & Counters</h2>
                <p className="text-xs text-[#56605b] mt-0.5">
                  Add the desks where staff will call numbers and serve arriving customers.
                </p>
              </div>
              <button
                type="button"
                onClick={addDeskRow}
                className="px-3.5 py-2 border border-[#17201d] bg-[#f8f8f5] hover:bg-[#17201d] hover:text-[#e9ff6a] font-mono text-xs font-bold uppercase transition-colors"
              >
                + Add Counter
              </button>
            </div>

            {/* Desks Table */}
            <div className="space-y-3">
              {desks.map((d, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-[#17201d] bg-[#f8f8f5] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  <div className="sm:col-span-2">
                    <span className="block text-[10px] font-mono uppercase text-[#56605b] mb-1 font-bold">
                      Counter #{idx + 1}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#17201d] bg-white px-3 py-2 block border border-[#cfd4cd] text-center">
                      Desk {idx + 1}
                    </span>
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-[10px] font-mono uppercase text-[#56605b] mb-1 font-bold">
                      Station Display Name
                    </label>
                    <input
                      type="text"
                      value={d.name}
                      onChange={(e) => updateDeskRow(idx, 'name', e.target.value)}
                      placeholder={`Desk ${idx + 1} - Customer Support`}
                      className="w-full h-10 px-3 border border-[#cfd4cd] bg-white text-xs font-medium focus:outline-none focus:border-[#17201d]"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-mono uppercase text-[#56605b] mb-1 font-bold">
                      Assigned Staff Attendant
                    </label>
                    <input
                      type="text"
                      value={d.activeStaffName || ''}
                      onChange={(e) => updateDeskRow(idx, 'activeStaffName', e.target.value)}
                      placeholder="Attendant Name"
                      className="w-full h-10 px-3 border border-[#cfd4cd] bg-white text-xs focus:outline-none focus:border-[#17201d]"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    {desks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDeskRow(idx)}
                        className="text-rose-600 hover:text-rose-800 text-xs font-mono p-1"
                        title="Remove Counter"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-[#cfd4cd]">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="h-12 px-6 border border-[#17201d] bg-white font-mono text-xs font-bold hover:bg-[#f3f4f1] transition-colors"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={() => {
                  if (desks.length === 0) {
                    setError('Please configure at least one service counter.');
                    return;
                  }
                  setError(null);
                  setCurrentStep(4);
                }}
                className="h-12 px-8 bg-[#17201d] text-[#e9ff6a] font-bold text-xs uppercase tracking-wider hover:bg-[#2c3832] transition-colors flex items-center gap-2"
              >
                <span>Review & Launch</span>
                <span className="font-mono text-sm">→</span>
              </button>
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* STEP 4: REVIEW & INSTANT LAUNCH */}
        {/* =================================================================== */}
        {currentStep === 4 && (
          <section className="border-2 border-[#17201d] bg-white p-6 sm:p-8 shadow-[6px_6px_0_#17201d] space-y-6">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#17201d] text-[#e9ff6a] font-bold">
                Ready for Provisioning
              </span>
              <h2 className="text-2xl font-black text-[#17201d] mt-2">
                Review Workspace Configuration
              </h2>
              <p className="text-xs text-[#56605b] mt-1">
                Your workspace will be provisioned in PostgreSQL with isolated realtime events and dynamic routing.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 border-y border-[#cfd4cd] py-5 font-mono text-xs">
              <div className="p-3 bg-[#f8f8f5] border border-[#cfd4cd]">
                <span className="text-[#56605b] block text-[10px] uppercase">Organization:</span>
                <strong className="text-sm text-[#17201d] block mt-0.5">{orgName}</strong>
                <span className="text-[#56605b] text-[11px]">/{orgSlug} ({category})</span>
              </div>

              <div className="p-3 bg-[#f8f8f5] border border-[#cfd4cd]">
                <span className="text-[#56605b] block text-[10px] uppercase">Facility Branch:</span>
                <strong className="text-sm text-[#17201d] block mt-0.5">{facilityName}</strong>
                <span className="text-[#56605b] text-[11px]">Location: {location || 'Not specified'}</span>
              </div>
            </div>

            {/* Configured Services & Desks Preview */}
            <div className="space-y-4">
              <div>
                <span className="font-mono text-xs font-bold uppercase text-[#56605b] block mb-2">
                  Configured Services ({services.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {services.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 border border-[#cfd4cd] bg-[#f8f8f5] font-mono text-xs text-[#17201d]"
                    >
                      <strong>[{s.codePrefix}]</strong> {s.name} (~{s.avgServiceMinutes}m)
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-mono text-xs font-bold uppercase text-[#56605b] block mb-2">
                  Service Desks ({desks.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {desks.map((d, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 border border-[#cfd4cd] bg-[#f8f8f5] font-mono text-xs text-[#17201d]"
                    >
                      Desk {idx + 1}: {d.name} {d.activeStaffName ? `(${d.activeStaffName})` : ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#cfd4cd]">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-full sm:w-auto h-12 px-6 border border-[#17201d] bg-white font-mono text-xs font-bold hover:bg-[#f3f4f1] transition-colors"
              >
                ← Back to Edit
              </button>

              <button
                type="button"
                onClick={handleLaunch}
                disabled={isSubmitting}
                className="w-full sm:w-auto h-14 px-10 bg-[#17201d] text-[#e9ff6a] font-bold text-sm uppercase tracking-wider hover:bg-[#2c3832] transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0_#17201d] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Provisioning Workspace in Database...</span>
                ) : (
                  <>
                    <span>Launch QueueFlow Workspace</span>
                    <span className="font-mono text-base">→</span>
                  </>
                )}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
