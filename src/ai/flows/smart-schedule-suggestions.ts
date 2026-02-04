'use server';

/**
 * @fileOverview Provides smart schedule suggestions for medication intake based on user logs.
 * Uses OpenAI (OPENAI_API_KEY) for AI suggestions.
 *
 * - suggestOptimalSchedule - Analyzes medication intake logs and suggests optimal reminder times.
 * - SmartScheduleInput - The input type for the suggestOptimalSchedule function.
 * - SmartScheduleOutput - The return type for the suggestOptimalSchedule function.
 */

import OpenAI from 'openai';
import { z } from 'zod';

const SmartScheduleInputSchema = z.object({
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
export type SmartScheduleInput = z.infer<typeof SmartScheduleInputSchema>;

const SmartScheduleOutputSchema = z.object({
  suggestedSchedule: z.array(
    z.object({
      time: z.string(),
      reason: z.string(),
    })
  ),
});
export type SmartScheduleOutput = z.infer<typeof SmartScheduleOutputSchema>;

const systemPrompt = `You are an AI assistant designed to analyze medication intake logs and suggest optimal, personalized reminder times to improve adherence and efficacy, minimizing side effects and maximizing benefits.

Respond with a JSON object only, no other text. The object must have this exact shape:
{
  "suggestedSchedule": [
    { "time": "HH:MM", "reason": "Brief reason for this time" }
  ]
}
Format each suggested time as HH:MM (24-hour). Include at least one suggestion.`;

function buildUserPrompt(input: SmartScheduleInput): string {
  const logsText =
    input.intakeLogs.length > 0
      ? input.intakeLogs.map((l) => `- Date: ${l.date}, Time: ${l.time}`).join('\n')
      : '(No intake logs yet)';
  return `Medication Name: ${input.medicationName}
Dosage: ${input.dosage}
User Needs: ${input.userNeeds}

Intake Logs:
${logsText}

Based on the provided intake logs and user needs, suggest an optimal medication schedule. Provide reasoning for each suggested time. Respond with JSON only.`;
}

export async function suggestOptimalSchedule(
  input: SmartScheduleInput
): Promise<SmartScheduleOutput> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set.');
  }

  const openai = new OpenAI({ apiKey });
  const userPrompt = buildUserPrompt(input);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI.');
  }

  const parsed = JSON.parse(content) as unknown;
  const result = SmartScheduleOutputSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error('Invalid response shape from OpenAI.');
  }
  return result.data;
}
