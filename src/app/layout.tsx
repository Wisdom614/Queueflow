import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { QueueProvider } from '@/lib/queue-context';
import { Navigation } from '@/components/Navigation';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'QueueFlow — Virtual Queue Management',
  description: 'Join the queue without standing in it. Real-time queue intelligence and ticketing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8f8f5] text-[#17201d]">
        <QueueProvider>
          <Navigation />
          <div className="flex-1 flex flex-col">{children}</div>
        </QueueProvider>
      </body>
    </html>
  );
}
