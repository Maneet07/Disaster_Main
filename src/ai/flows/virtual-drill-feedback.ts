'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing personalized feedback on virtual disaster drill simulations.
 *
 * The flow takes student's performance data as input and returns AI-powered feedback to improve preparedness.
 *
 * @file VirtualDrillFeedbackFlow.ts
 * @file VirtualDrillFeedbackInput.ts
 * @file VirtualDrillFeedbackOutput.ts
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VirtualDrillFeedbackInputSchema = z.object({
  scenario: z.string().describe('The type of disaster drill scenario (e.g., earthquake, flood).'),
  performanceData: z.string().describe('JSON string of the student performance data during the simulation.'),
  studentDetails: z.string().describe('JSON string of the student details like age group')
});
export type VirtualDrillFeedbackInput = z.infer<typeof VirtualDrillFeedbackInputSchema>;

const VirtualDrillFeedbackOutputSchema = z.object({
  feedback: z.string().describe('AI-powered personalized feedback on the student performance.'),
  suggestions: z.string().describe('Suggestions that a student should take for better results'),
});
export type VirtualDrillFeedbackOutput = z.infer<typeof VirtualDrillFeedbackOutputSchema>;

export async function virtualDrillFeedback(input: VirtualDrillFeedbackInput): Promise<VirtualDrillFeedbackOutput> {
  return virtualDrillFeedbackFlow(input);
}

const virtualDrillFeedbackPrompt = ai.definePrompt({
  name: 'virtualDrillFeedbackPrompt',
  input: {schema: VirtualDrillFeedbackInputSchema},
  output: {schema: VirtualDrillFeedbackOutputSchema},
  prompt: `You are an AI-powered educational tool that provides personalized feedback to students based on their performance in virtual disaster drill simulations.

  Scenario: {{{scenario}}}
  Performance Data: {{{performanceData}}}
  Student Details: {{{studentDetails}}}

  Based on the scenario and the performance data, provide specific and actionable feedback to the student. Also provide suggestions that the student should take for better results. Consider what the student did well, what they could improve on, and why those improvements are important for their safety and preparedness. Return output in JSON format.
`,
});

const virtualDrillFeedbackFlow = ai.defineFlow(
  {
    name: 'virtualDrillFeedbackFlow',
    inputSchema: VirtualDrillFeedbackInputSchema,
    outputSchema: VirtualDrillFeedbackOutputSchema,
  },
  async input => {
    const {output} = await virtualDrillFeedbackPrompt(input);
    return output!;
  }
);
