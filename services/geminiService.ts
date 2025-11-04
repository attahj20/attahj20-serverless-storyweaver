
import { GoogleGenAI, Type } from "@google/genai";
import type { ImagePart } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    storySegment: {
      type: Type.STRING,
      description: "The next paragraph of the story. It should be engaging and well-written, continuing from the previous part.",
    },
    choices: {
      type: Type.ARRAY,
      description: "An array of 2 to 3 distinct and interesting choices for the user to pick from to continue the story. Each choice should be a short, actionable phrase.",
      items: {
        type: Type.STRING,
      },
    },
  },
  required: ["storySegment", "choices"],
};

const parseJsonResponse = (text: string): { storySegment: string; choices: string[] } => {
  try {
    const cleanedText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Failed to parse JSON response:", text, error);
    throw new Error("The AI returned a response in an unexpected format.");
  }
};

export const generateInitialStory = async (
  premise: string,
  genre: string,
  tone: string,
  image: ImagePart | null
): Promise<{ storySegment: string; choices: string[] }> => {

  const systemInstruction = `You are an expert storyteller. Your task is to co-write an interactive story with a user.
  - The story should be in the "${genre}" genre.
  - The tone should be "${tone}".
  - Always generate a single, compelling paragraph for the story segment.
  - After the story segment, provide 2 or 3 distinct, engaging choices for the user to direct the story.
  - Your entire response MUST be a valid JSON object matching the provided schema.`;

  const prompt = `Start a new story based on this premise: "${premise}". ${image ? 'Use the provided image as inspiration for the setting or mood.' : ''}`;
  
  const contents = image ? { parts: [image, { text: prompt }] } : prompt;

  const response = await ai.models.generateContent({
    model: model,
    contents: contents,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.8,
    },
  });

  return parseJsonResponse(response.text);
};


export const generateStorySegment = async (
  history: { choice: string; segment: string }[],
  currentChoice: string
): Promise<{ storySegment: string; choices: string[] }> => {

  const storySoFar = history.map(h => `${h.segment}`).join('\n\n');

  const systemInstruction = `You are an expert storyteller continuing an interactive story.
  - The story context is provided below.
  - The user has just made a choice. Your task is to write the next part of the story based on that choice.
  - Generate a single, compelling paragraph that continues the narrative.
  - After the story segment, provide 2 or 3 new, distinct choices for the user.
  - Your entire response MUST be a valid JSON object matching the provided schema.`;
  
  const prompt = `
  STORY SO FAR:
  ---
  ${storySoFar}
  ---
  
  USER'S CHOICE: "${currentChoice}"
  
  Now, continue the story.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.8,
    },
  });

  return parseJsonResponse(response.text);
};
