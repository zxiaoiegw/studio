'use client';

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';

const APP_ROUTES = ['/dashboard', '/medications', '/reports'];

export function RootHeader() {
  const pathname = usePathname();
  const isAppRoute = APP_ROUTES.some((route) => pathname?.startsWith(route));

  if (isAppRoute) return null;

  return (
    <header className="flex justify-end items-center gap-4 px-4 py-2 border-b">
      <SignedOut>
        <SignInButton mode="modal" />
        <SignUpButton mode="modal" />
      </SignedOut>
      <SignedIn>
        <UserButton />
        <button>
          <Bell size={20} />
        </button>
      </SignedIn>
    </header>
  );
}
