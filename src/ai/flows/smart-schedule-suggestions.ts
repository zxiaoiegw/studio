'use server';

/**
 * @fileOverview Provides smart schedule suggestions for medication intake based on user logs.
 *
 * - suggestOptimalSchedule - A function that analyzes medication intake logs and suggests optimal reminder times.
 * - SmartScheduleInput - The input type for the suggestOptimalSchedule function.
 * - SmartScheduleOutput - The return type for the suggestOptimalSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartScheduleInputSchema = z.object({
  medicationName: z.string().describe('The name of the medication.'),
  dosage: z.string().describe('The dosage of the medication (e.g., 10mg, 2 tablets).'),
  intakeLogs: z.array(
    z.object({
      date: z.string().describe('The date the medication was taken (ISO format).'),
      time: z.string().describe('The time the medication was taken (HH:MM format).'),
    })
  ).describe('Array of medication intake logs, including date and time.'),
  userNeeds: z.string().describe('User-reported needs and preferences regarding medication schedule.'),
});
export type SmartScheduleInput = z.infer<typeof SmartScheduleInputSchema>;

const SmartScheduleOutputSchema = z.object({
  suggestedSchedule: z.array(
    z.object({
      time: z.string().describe('Suggested time for medication intake (HH:MM format).'),
      reason: z.string().describe('Reasoning behind the suggested time.'),
    })
  ).describe('Suggested medication intake schedule with reasoning.'),
});
export type SmartScheduleOutput = z.infer<typeof SmartScheduleOutputSchema>;

export async function suggestOptimalSchedule(input: SmartScheduleInput): Promise<SmartScheduleOutput> {
  return smartScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartSchedulePrompt',
  input: {schema: SmartScheduleInputSchema},
  output: {schema: SmartScheduleOutputSchema},
  prompt: `You are an AI assistant designed to analyze medication intake logs and suggest optimal, personalized reminder times to improve adherence and efficacy, minimizing side effects and maximizing benefits.

  Medication Name: {{{medicationName}}}
  Dosage: {{{dosage}}}
  User Needs: {{{userNeeds}}}

  Intake Logs:
  {{#each intakeLogs}}
  - Date: {{{date}}}, Time: {{{time}}}
  {{/each}}

  Based on the provided intake logs and user needs, suggest an optimal medication schedule. Provide reasoning for each suggested time.
  Format the suggested time as HH:MM.
  `,
});

const smartScheduleFlow = ai.defineFlow(
  {
    name: 'smartScheduleFlow',
    inputSchema: SmartScheduleInputSchema,
    outputSchema: SmartScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
