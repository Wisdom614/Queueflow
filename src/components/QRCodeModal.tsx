'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  url: string;
  serviceCode?: string;
  orgName?: string;
  facilityName?: string;
}

export function QRCodeModal({
  isOpen,
  onClose,
  title,
  subtitle,
  url,
  serviceCode,
  orgName = 'QueueFlow',
  facilityName = 'Service Center',
}: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Render QR Code onto canvas whenever URL or isOpen changes
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      url,
      {
        width: 280,
        margin: 2,
        color: {
          dark: '#17201d',
          light: '#ffffff',
        },
      },
      (error) => {
        if (error) console.error('Failed to generate QR Code:', error);
      }
    );
  }, [isOpen, url]);

  if (!isOpen) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback
    }
  };

  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-qrcode.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      {/* Modal Card */}
      <div className="relative w-full max-w-lg border-2 border-[#17201d] bg-white p-6 sm:p-8 shadow-[8px_8px_0_#17201d] transition-all">
        {/* Header Bar */}
        <div className="flex items-start justify-between border-b border-[#cfd4cd] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#56605b]">
                {orgName}
              </span>
              <span className="text-[#cfd4cd] text-xs">&bull;</span>
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#56605b]">
                {facilityName}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17201d] mt-1 flex items-center gap-2">
              {title}
              {serviceCode && (
                <span className="px-2 py-0.5 bg-[#17201d] text-[#e9ff6a] font-mono text-xs font-black">
                  [{serviceCode}]
                </span>
              )}
            </h2>
            <p className="text-xs text-[#56605b] mt-1">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 border border-[#cfd4cd] text-[#56605b] hover:text-[#17201d] hover:border-[#17201d] transition-colors font-mono text-xs font-bold"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* QR Code Presentation */}
        <div className="my-6 flex flex-col items-center justify-center p-6 bg-[#f8f8f5] border border-[#cfd4cd]">
          <div className="p-3 bg-white border border-[#17201d] shadow-[4px_4px_0_#17201d]">
            <canvas ref={canvasRef} className="block size-52 sm:size-60" />
          </div>

          <p className="font-mono text-xs text-[#56605b] mt-3 font-medium text-center">
            Scan with any smartphone camera to take a ticket
          </p>
        </div>

        {/* URL Display & 1-Click Copy */}
        <div className="space-y-3">
          <label className="block font-mono text-[11px] font-bold uppercase text-[#56605b]">
            Direct Customer URL:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={url}
              className="w-full bg-[#f8f8f5] border border-[#cfd4cd] px-3 py-2 text-xs font-mono text-[#17201d] select-all focus:outline-none focus:border-[#17201d]"
            />
            <button
              type="button"
              onClick={handleCopyUrl}
              className={`px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase transition-colors shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#17201d] text-[#e9ff6a] hover:bg-[#2c3832]'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 pt-4 border-t border-[#cfd4cd] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDownloadImage}
              className="flex-1 sm:flex-initial px-3.5 py-2 border border-[#17201d] bg-white text-[#17201d] font-mono text-xs font-bold hover:bg-[#f3f4f1] transition-colors"
            >
              Download PNG
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-3.5 py-2 border border-[#17201d] bg-white text-[#17201d] font-mono text-xs font-bold hover:bg-[#f3f4f1] transition-colors"
            >
              Print Poster
            </button>
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto text-center px-4 py-2 bg-[#17201d] text-[#e9ff6a] font-mono text-xs font-bold hover:bg-[#2c3832] transition-colors"
          >
            Test Join Link &rarr;
          </a>
        </div>
      </div>

      {/* Hidden Printable Poster Container (revealed only during print) */}
      {isPrinting && (
        <div className="hidden print:flex fixed inset-0 bg-white z-[9999] flex-col items-center justify-center p-12 text-center text-[#17201d]">
          <div className="border-4 border-[#17201d] p-12 max-w-xl w-full flex flex-col items-center">
            <span className="font-mono text-sm uppercase tracking-widest text-[#56605b] font-bold">
              {orgName} &bull; {facilityName}
            </span>
            <h1 className="text-4xl font-black uppercase mt-3 tracking-tight">
              Scan to Join the Queue
            </h1>
            <p className="text-base text-[#56605b] mt-2 max-w-md">
              {title}: {subtitle}
            </p>

            <div className="my-8 p-4 border-2 border-[#17201d]">
              <canvas ref={canvasRef} className="size-72" />
            </div>

            <div className="grid grid-cols-3 gap-6 text-left border-t border-[#cfd4cd] pt-6 w-full text-xs font-mono">
              <div>
                <span className="font-bold block text-sm">1. SCAN</span>
                <span className="text-[#56605b]">Point phone camera at QR code</span>
              </div>
              <div>
                <span className="font-bold block text-sm">2. TICKET</span>
                <span className="text-[#56605b]">Enter name & receive electronic pass</span>
              </div>
              <div>
                <span className="font-bold block text-sm">3. RELAX</span>
                <span className="text-[#56605b]">Track wait time remotely</span>
              </div>
            </div>

            <div className="mt-8 font-mono text-xs text-[#56605b]">
              Or visit: <span className="font-bold text-[#17201d]">{url}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
