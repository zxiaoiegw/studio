'use client';
import { useState, useTransition } from 'react';
import type { Medication } from '@/lib/types';
import { useMedication } from '@/context/medication-context';
import { getSmartScheduleSuggestions } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, Wand2, Clock, Sparkles } from 'lucide-react';
import type { SmartScheduleOutput } from '@/ai/flows/smart-schedule-suggestions';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type SmartScheduleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication: Medication;
};

export function SmartScheduleDialog({ open, onOpenChange, medication }: SmartScheduleDialogProps) {
  const { getLogsForMedication, updateMedication } = useMedication();
  const [userNeeds, setUserNeeds] = useState('');
  const [suggestions, setSuggestions] = useState<SmartScheduleOutput | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(async () => {
      const logs = getLogsForMedication(medication.id);
      const intakeLogs = logs.map(log => {
        const date = new Date(log.time);
        return {
          date: date.toISOString().split('T')[0],
          time: date.toTimeString().split(' ')[0].substring(0, 5),
        };
      });

      const result = await getSmartScheduleSuggestions({
        medicationName: medication.name,
        dosage: medication.dosage,
        intakeLogs,
        userNeeds,
      });

      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
        setSuggestions(null);
      } else {
        setSuggestions(result);
      }
    });
  };

  const applySuggestions = () => {
    if (suggestions) {
      const newTimes = suggestions.suggestedSchedule.map(s => s.time);
      updateMedication({ ...medication, schedule: { ...medication.schedule, times: newTimes } });
      toast({
        title: 'Schedule Updated!',
        description: `Smart schedule applied for ${medication.name}.`,
        className: 'bg-accent text-accent-foreground border-accent'
      });
      onOpenChange(false);
      resetState();
    }
  };

  const resetState = () => {
    setUserNeeds('');
    setSuggestions(null);
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline">
            <Wand2 className="text-primary" />
            Smart Schedule Suggestions
          </DialogTitle>
          <DialogDescription>
            Get AI-powered recommendations for {medication.name} based on your logs and preferences.
          </DialogDescription>
        </DialogHeader>

        {!suggestions ? (
          <div className="space-y-4 py-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="user-needs">Any preferences or issues? (optional)</Label>
              <Textarea
                id="user-needs"
                placeholder="e.g., 'I feel drowsy after my morning dose', 'I prefer taking it with meals.'"
                value={userNeeds}
                onChange={(e) => setUserNeeds(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={handleGenerate} disabled={isPending} className="w-full">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate Suggestions
            </Button>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <Alert>
                <AlertTitle>New Suggested Schedule</AlertTitle>
                <AlertDescription>Here is the AI-optimized schedule for you.</AlertDescription>
            </Alert>
            <ul className="space-y-3">
              {suggestions.suggestedSchedule.map((item, index) => (
                <li key={index} className="p-3 rounded-lg bg-secondary">
                  <p className="font-semibold flex items-center gap-2">
                    <Clock size={16} className="text-primary" /> {new Date(`1970-01-01T${item.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 pl-1 border-l-2 ml-2 border-primary/50">{item.reason}</p>
                </li>
              ))}
            </ul>
            <DialogFooter className="sm:justify-between gap-2">
              <Button variant="ghost" onClick={() => setSuggestions(null)}>Try Again</Button>
              <Button onClick={applySuggestions}>Apply this Schedule</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
