'use client';

import React, { useState, useEffect } from 'react';
import { Service } from '@/types/queue';

interface ServiceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service | null;
  onSave: (data: Omit<Service, 'id' | 'facilityId'>) => void;
  existingPrefixes?: string[];
}

export function ServiceConfigModal({
  isOpen,
  onClose,
  service,
  onSave,
  existingPrefixes = [],
}: ServiceConfigModalProps) {
  const [name, setName] = useState('');
  const [codePrefix, setCodePrefix] = useState('');
  const [description, setDescription] = useState('');
  const [avgServiceMinutes, setAvgServiceMinutes] = useState(5);
  const [isOpenActive, setIsOpenActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      setName(service.name);
      setCodePrefix(service.codePrefix);
      setDescription(service.description);
      setAvgServiceMinutes(service.avgServiceMinutes);
      setIsOpenActive(service.isOpen);
    } else {
      setName('');
      setCodePrefix('');
      setDescription('');
      setAvgServiceMinutes(5);
      setIsOpenActive(true);
    }
    setError(null);
  }, [service, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanPrefix = codePrefix.trim().toUpperCase();

    if (!cleanName) {
      setError('Service name is required.');
      return;
    }

    if (!cleanPrefix) {
      setError('Code prefix is required (e.g., B, SIM, MED).');
      return;
    }

    if (cleanPrefix.length > 5) {
      setError('Code prefix must be 5 characters or fewer.');
      return;
    }

    // Check duplicate prefix unless updating same service
    const isPrefixDuplicate = existingPrefixes.some(
      (p) => p.toUpperCase() === cleanPrefix && (!service || service.codePrefix.toUpperCase() !== cleanPrefix)
    );

    if (isPrefixDuplicate) {
      setError(`Prefix "${cleanPrefix}" is already in use by another service.`);
      return;
    }

    if (avgServiceMinutes < 1 || avgServiceMinutes > 120) {
      setError('Average service duration must be between 1 and 120 minutes.');
      return;
    }

    onSave({
      name: cleanName,
      codePrefix: cleanPrefix,
      description: description.trim() || `${cleanName} service operations.`,
      avgServiceMinutes: Number(avgServiceMinutes),
      isOpen: isOpenActive,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg border-2 border-[#17201d] bg-white p-6 sm:p-8 shadow-[8px_8px_0_#17201d]">
        <div className="flex items-start justify-between border-b border-[#cfd4cd] pb-4 mb-6">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold text-[#56605b]">
              Queue Configuration
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17201d] mt-1">
              {service ? 'Configure Service' : 'Add New Service Category'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 border border-[#cfd4cd] text-[#56605b] hover:text-[#17201d] hover:border-[#17201d] font-mono text-xs font-bold"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border-l-4 border-rose-600 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#17201d] mb-1">
              Service Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SIM Registration, Fee Payment, Triage"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-[#17201d] px-3.5 py-2 text-sm text-[#17201d] focus:outline-none focus:ring-2 focus:ring-[#17201d]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17201d] mb-1">
                Ticket Prefix <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={5}
                placeholder="e.g. B, S, T, SIM"
                value={codePrefix}
                onChange={(e) => setCodePrefix(e.target.value.toUpperCase())}
                className="w-full border border-[#17201d] px-3.5 py-2 text-sm font-mono uppercase text-[#17201d] focus:outline-none focus:ring-2 focus:ring-[#17201d]"
              />
              <span className="font-mono text-[10px] text-[#56605b] mt-0.5 block">
                Tickets: {codePrefix ? `${codePrefix}101` : '—'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17201d] mb-1">
                Avg Duration (mins) <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={120}
                required
                value={avgServiceMinutes}
                onChange={(e) => setAvgServiceMinutes(parseInt(e.target.value, 10) || 5)}
                className="w-full border border-[#17201d] px-3.5 py-2 text-sm font-mono text-[#17201d] focus:outline-none focus:ring-2 focus:ring-[#17201d]"
              />
              <span className="font-mono text-[10px] text-[#56605b] mt-0.5 block">
                Used for wait estimation
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#17201d] mb-1">
              Customer Instructions / Description
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Provide bank deposit slips and registration receipt."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-[#cfd4cd] px-3.5 py-2 text-xs text-[#17201d] focus:border-[#17201d] focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isOpenActive}
                onChange={(e) => setIsOpenActive(e.target.checked)}
                className="size-4 accent-[#17201d]"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-[#17201d]">
                Service Open for Queuing
              </span>
            </label>
            <p className="text-[11px] text-[#56605b] ml-6 mt-0.5">
              If unchecked, customers cannot join this service queue.
            </p>
          </div>

          <div className="pt-4 border-t border-[#cfd4cd] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#cfd4cd] text-xs font-semibold hover:border-[#17201d] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#17201d] text-[#e9ff6a] font-mono text-xs font-bold uppercase hover:bg-[#2c3832] transition-colors shadow-[3px_3px_0_#cfd4cd]"
            >
              {service ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
