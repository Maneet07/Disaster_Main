'use server';

/**
 * @fileOverview Generates gamified quizzes of varying difficulties on different natural disaster scenarios.
 *
 * - generateQuiz - A function that generates a quiz based on the provided disaster type and difficulty.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateQuizInputSchema = z.object({
  disasterType: z
    .string()
    .describe('The type of natural disaster for the quiz (e.g., earthquake, flood, volcano).'),
  difficulty: z
    .string()
    .describe('The difficulty level of the quiz (e.g., easy, medium, hard).'),
  numberOfQuestions: z.number().describe('The number of questions to generate for the quiz.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  quiz: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(z.string()).describe('The possible answer options.'),
      correctAnswer: z.string().describe('The correct answer to the question.'),
    })
  ),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are a quiz generator for disaster preparedness education.

  Generate a quiz with {{numberOfQuestions}} questions about {{disasterType}} at the {{difficulty}} difficulty level.

  Each question should have 4 answer options, with one correct answer.

  Format the output as a JSON object with a 'quiz' array. Each object in the array should have these fields:
  - question: the quiz question
  - options: an array of 4 strings, the answer options
  - correctAnswer: the correct answer to the question, which must be one of the options.
  
  Do not include any explanations or additional text.  Only include the JSON.  Make sure the JSON is valid and parsable.
  Example:
  {
    "quiz": [
      {
        "question": "What is the first step you should take during an earthquake?",
        "options": ["Run outside immediately", "Drop, cover, and hold on", "Hide under a table", "Call emergency services"],
        "correctAnswer": "Drop, cover, and hold on"
      },
      {
        "question": "What is a sign that a flood is likely to occur?",
        "options": ["Clear skies", "Heavy rainfall", "Low humidity", "Rising temperatures"],
        "correctAnswer": "Heavy rainfall"
      }
    ]
  }`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
