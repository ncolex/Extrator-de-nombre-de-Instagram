
import { GoogleGenAI, Type } from "@google/genai";

// Helper function to convert a File object to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Result is in the format "data:image/jpeg;base64,..."
      // We need to strip the prefix
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Initialize the Gemini AI client
// IMPORTANT: The API key must be set in the environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * Analyzes an image file using Gemini and extracts Instagram usernames.
 * @param file The image file to process.
 * @returns A promise that resolves to an array of found usernames.
 */
export const extractUsernamesFromImage = async (file: File): Promise<string[]> => {
  try {
    const base64Data = await fileToBase64(file);

    const imagePart = {
      inlineData: {
        mimeType: file.type,
        data: base64Data,
      },
    };

    const textPart = {
        text: `Analyze this image to find any Instagram usernames. Usernames may start with '@'. Extract all of them. Only return valid usernames.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            usernames: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: 'An Instagram username found in the image, without the "@" symbol.'
              }
            }
          },
        },
      }
    });

    const jsonText = response.text.trim();
    if (jsonText) {
        const parsed = JSON.parse(jsonText);
        return parsed.usernames || [];
    }
    return [];

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Re-throw with a more descriptive message while preserving the original cause
    if (error instanceof Error) {
      throw new Error(`Image processing failed: ${error.message}`);
    }
    throw new Error('Image processing failed due to an unknown error.');
  }
};
