'use server';

/**
 * @fileOverview AI-powered emergency checklist generator.
 *
 * - generateChecklist - A function that generates a disaster-specific checklist.
 * - ChecklistInput - The input type for the generateChecklist function.
 * - ChecklistOutput - The return type for the generateChecklist function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ChecklistInputSchema = z.object({
  disasterType: z
    .string()
    .describe('The type of disaster to generate a checklist for.'),
});

export type ChecklistInput = z.infer<typeof ChecklistInputSchema>;

const ChecklistOutputSchema = z.object({
  checklistItems: z
    .array(z.string())
    .describe('A list of essential items for the specified disaster.'),
});

export type ChecklistOutput = z.infer<typeof ChecklistOutputSchema>;

export async function generateChecklist(input: ChecklistInput): Promise<ChecklistOutput> {
  return generateChecklistFlow(input);
}

const checklistPrompt = ai.definePrompt({
  name: 'checklistPrompt',
  input: {schema: ChecklistInputSchema},
  output: {schema: ChecklistOutputSchema},
  prompt: `You are an expert in disaster preparedness. Generate a checklist of essential items for the following disaster type: {{{disasterType}}}. The checklist should be comprehensive but concise, providing practical and actionable steps to ensure safety and preparedness. Each item should be a single actionable step.

Example Output:
{
  "checklistItems": [
    "Assemble a disaster supply kit with water, food, and first-aid supplies",
    "Develop a family communication plan",
    "Identify safe spots in your home during a disaster"
  ]
}
`, // Ensuring valid JSON format
});

const generateChecklistFlow = ai.defineFlow(
  {
    name: 'generateChecklistFlow',
    inputSchema: ChecklistInputSchema,
    outputSchema: ChecklistOutputSchema,
  },
  async input => {
    const {output} = await checklistPrompt(input);
    return output!;
  }
);
