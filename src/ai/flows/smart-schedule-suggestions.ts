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
  currentSchedule: z.array(z.string()).optional(),
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
  answer: z.string().optional(),
});
export type SmartScheduleOutput = z.infer<typeof SmartScheduleOutputSchema>;

const systemPrompt = `You are a pharmacist AI assistant that helps users optimize their medication schedules and answers medication questions.

SCHEDULE OPTIMIZATION RULES:
1. Suggest OPTIMAL times based on pharmacological best practices for the specific medication - DO NOT just copy the user's current schedule
2. Consider these factors when suggesting times:
   - Medication absorption (with food vs empty stomach)
   - Peak effectiveness timing (e.g., blood pressure meds often best in morning)
   - Side effect management (e.g., diuretics not at night, sedating meds at bedtime)
   - Drug interactions with meals or other medications
3. Number of doses should match the medication's standard dosing:
   - Once daily: suggest 1 optimal time
   - Twice daily: suggest 2 times, ~12 hours apart
   - Three times daily: suggest 3 times, ~6-8 hours apart

EXAMPLES OF OPTIMAL TIMING:
- Lisinopril (ACE inhibitor): Once daily, morning (monitors BP during day)
- Metformin: With meals to reduce GI side effects
- Levothyroxine: Morning on empty stomach, 30-60 min before food
- Statins (atorvastatin): Evening (cholesterol synthesis peaks at night)
- Omeprazole: 30 min before first meal

You have two modes:
1. **Question Mode**: If the user asks a question, provide a direct answer in the "answer" field AND suggest optimal schedule
2. **Schedule Mode**: If no question, just provide optimized schedule suggestions

Respond with JSON only:
{
  "suggestedSchedule": [
    { "time": "HH:MM", "reason": "Specific reason based on medication pharmacology" }
  ],
  "answer": "Direct answer (only if user asked a question)"
}

Format times as HH:MM (24-hour). Always provide specific pharmacological reasons, not generic ones.`;

function buildUserPrompt(input: SmartScheduleInput): string {
  const logsText =
    input.intakeLogs.length > 0
      ? input.intakeLogs.map((l) => `- Date: ${l.date}, Time: ${l.time}`).join('\n')
      : '(No intake logs yet)';
  const currentScheduleText =
    input.currentSchedule && input.currentSchedule.length > 0
      ? input.currentSchedule.join(', ')
      : '(Not set)';
  return `Medication: ${input.medicationName} (${input.dosage})
Current Schedule (may need optimization): ${currentScheduleText}
User Question/Request: ${input.userNeeds || 'Please suggest the optimal times to take this medication based on its pharmacology.'}

Recent Intake History:
${logsText}

TASK: Suggest the BEST times to take ${input.medicationName} based on:
1. How this specific medication works (absorption, peak effect, side effects)
2. Standard pharmacological guidelines
3. The user's question/needs if provided

Do NOT just return the current schedule - provide genuinely optimal times with specific reasons.`;
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
