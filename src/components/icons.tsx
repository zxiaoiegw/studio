import { Pill } from 'lucide-react';

export const LogoIcon = () => (
  <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
    <Pill className="size-5" />
  </div>
);

export const Logo = () => (
  <div className="flex items-center gap-2 text-lg font-bold text-foreground">
    <LogoIcon />
    <span className="font-headline">PillPal</span>
  </div>
);
