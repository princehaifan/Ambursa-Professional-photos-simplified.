import { GoogleGenAI, Modality } from "@google/genai";

const base64ToMimeType = (base64: string): string => {
  const mime = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
  if (mime && mime.length) {
    return mime[1];
  }
  return 'image/jpeg'; // fallback
};

export const editImageWithAi = async (base64ImageData: string, prompt: string): Promise<string | null> => {
  try {
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
      // This error will now be caught by the UI layer during an action,
      // instead of crashing the entire application on initial load.
      throw new Error("API_KEY environment variable is not set.");
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const mimeType = base64ToMimeType(base64ImageData);
    const pureBase64 = base64ImageData.split(',')[1];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: pureBase64,
              mimeType: mimeType,
            },
          },
          {
            text: `Perform the following edit on the provided image: "${prompt}". Your response must only be the edited image file. Do not include any text, commentary, or explanation.`,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    if (response.promptFeedback?.blockReason) {
      throw new Error(`BLOCKED: ${response.promptFeedback.blockReason}`);
    }

    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const newBase64 = part.inlineData.data;
          const newMimeType = part.inlineData.mimeType;
          return `data:${newMimeType};base64,${newBase64}`;
        }
      }
    }
    
    // If the loop completes without returning an image, but there was no block, it means AI didn't return an image.
    throw new Error('NO_IMAGE: The AI response did not contain an image.');

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Re-throw the error to be handled by the calling function
    throw error;
  }
};
