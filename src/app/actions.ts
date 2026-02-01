'use server';

import { suggestOptimalSchedule, type SmartScheduleInput } from '@/ai/flows/smart-schedule-suggestions';
import { z } from 'zod';

const SmartScheduleActionInput = z.object({
  medicationName: z.string(),
  dosage: z.string(),
  intakeLogs: z.array(
    z.object({
      date: z.string(),
      time: z.string(),
    })
  ),
  userNeeds: z.string(),
});

export async function getSmartScheduleSuggestions(input: SmartScheduleInput) {
  const parsedInput = SmartScheduleActionInput.safeParse(input);

  if (!parsedInput.success) {
    console.error('Invalid input for smart schedule:', parsedInput.error);
    throw new Error('Invalid input.');
  }

  try {
    const result = await suggestOptimalSchedule(parsedInput.data);
    return result;
  } catch (error) {
    console.error('Error getting smart schedule suggestions:', error);
    return { error: 'Failed to generate suggestions. Please try again.' };
  }
}
