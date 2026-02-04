'use client';

import { useEffect, useState, useCallback } from 'react';
import { Bell, Pill, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type RefillReminder = {
  id: string;
  name: string;
  refill: { quantity: number; reminderThreshold: number };
};

type MissedDose = {
  id: string;
  medicationName: string;
  time: string;
  dosage: string;
};

type Notifications = {
  refillReminders: RefillReminder[];
  missedDoses: MissedDose[];
};

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notifications | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      } else {
        setNotifications({ refillReminders: [], missedDoses: [] });
      }
    } catch {
      setNotifications({ refillReminders: [], missedDoses: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const refillItems = (notifications?.refillReminders ?? []).filter(
    (r) => !dismissedIds.has(`refill-${r.id}`)
  );
  const missedItems = (notifications?.missedDoses ?? []).filter(
    (m) => !dismissedIds.has(`missed-${m.id}`)
  );
  const totalUnread = refillItems.length + missedItems.length;
  const hasNotifications = refillItems.length > 0 || missedItems.length > 0;

  const handleMarkAllRead = () => {
    const ids = new Set<string>();
    refillItems.forEach((r) => ids.add(`refill-${r.id}`));
    missedItems.forEach((m) => ids.add(`missed-${m.id}`));
    setDismissedIds((prev) => new Set([...prev, ...ids]));
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          {totalUnread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full p-0 text-[10px]"
            >
              {totalUnread > 99 ? '99+' : totalUnread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold">Notifications</h3>
          {hasNotifications && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[320px]">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              Loading...
            </div>
          ) : !hasNotifications ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 opacity-40" />
              <p>No notifications</p>
              <p className="text-xs">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="p-2">
              {refillItems.length > 0 && (
                <div className="space-y-1">
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    Refill reminders
                  </p>
                  {refillItems.map((r) => (
                    <div
                      key={`refill-${r.id}`}
                      className={cn(
                        'flex gap-3 rounded-md px-3 py-2 text-sm',
                        'hover:bg-accent'
                      )}
                    >
                      <Pill className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <div>
                        <p className="font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.refill.quantity} left — reminder at {r.refill.reminderThreshold}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {missedItems.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    Missed doses
                  </p>
                  {missedItems.map((m) => (
                    <div
                      key={`missed-${m.id}`}
                      className={cn(
                        'flex gap-3 rounded-md px-3 py-2 text-sm',
                        'hover:bg-accent'
                      )}
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      <div>
                        <p className="font-medium">{m.medicationName}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.dosage} — {formatDate(m.time)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
