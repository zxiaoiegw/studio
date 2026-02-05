import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { MedicationProvider } from '@/context/medication-context';
import { RootHeader } from '@/components/root-header';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'PillPal',
  description: 'Your daily medication tracker.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/sign-in">
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        </head>
        <body className={cn('font-body antialiased', 'min-h-screen bg-background font-sans')}>
          <RootHeader />
          <MedicationProvider>
            {children}
            <Toaster />
          </MedicationProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
