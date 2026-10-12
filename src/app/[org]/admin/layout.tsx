import React from 'react';
import { QueueProvider } from '@/lib/queue-context';

export default async function TenantAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}) {
  const { org } = await params;

  return (
    <QueueProvider orgSlug={org}>
      {children}
    </QueueProvider>
  );
}
