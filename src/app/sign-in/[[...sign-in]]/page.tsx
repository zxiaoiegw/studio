'use client';

import { SignIn } from '@clerk/nextjs';
import { useDemoMode } from '@/context/demo-context';
import { Play } from 'lucide-react';

export default function SignInPage() {
  const { enterDemo } = useDemoMode();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <SignIn signUpUrl="/sign-up" />

        <div className="flex w-full items-center gap-3 px-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={enterDemo}
          className="flex w-full max-w-[316px] items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Play className="h-4 w-4" />
          Try Demo
        </button>
        <p className="text-xs text-muted-foreground">
          Explore the app with sample data — no account needed
        </p>
      </div>
    </div>
  );
}
