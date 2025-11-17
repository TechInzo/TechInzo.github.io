
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // A check to ensure the API key is available. 
  // In a real deployed environment, this would be set.
  console.warn("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getMedicationInfo = async (medicationName: string): Promise<string> => {
  if (!API_KEY) {
    return "Gemini API is not configured. Please provide an API key.";
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide a brief, simple, one-paragraph explanation for the common use of the medication "${medicationName}". Do not provide medical advice, dosage information, or side effects. Start the explanation with "This medication is commonly used for...". Keep the language easy to understand for a non-medical person.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching medication info from Gemini:", error);
    throw new Error("Failed to communicate with the Gemini API.");
  }
};
