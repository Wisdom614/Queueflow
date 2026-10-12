import React from 'react';
import { QueueProvider } from '@/lib/queue-context';

export default async function TenantFacilityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string; facility: string }>;
}) {
  const { org, facility } = await params;

  return (
    <QueueProvider orgSlug={org} facilitySlug={facility}>
      {children}
    </QueueProvider>
  );
}
