
import { GoogleGenAI, Type } from "@google/genai";

// Always initialize with direct process.env.API_KEY reference
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMatchingAdvice = async (branch: string, specialty: string, question: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a Military Graduate Medical Education (GME) advisor. 
      The user is applying to a ${branch} residency in ${specialty}.
      Question: ${question}
      
      Provide professional, encouraging, and accurate advice regarding the Military Match process (MODS), 
      HPSP/USUHS requirements, and specific considerations for ${branch}.`,
    });
    // Use .text property directly
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to my advisor module. Please try again later.";
  }
};

export const findLocalRecruiters = async (zipCode: string, branch: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find and list 3 realistic HPSP (Health Professions Scholarship Program) recruiters for the ${branch} near zip code ${zipCode}. 
      Return a JSON array of objects with the following properties: 
      "id" (string), 
      "name" (string, include rank appropriate for the ${branch}), 
      "office" (string), 
      "phone" (string), 
      "distance" (string, strictly numeric value representing miles under 100, e.g., "3.2"). 
      DO NOT include the word "miles" or "mi" in the distance string.
      Ensure they sound like professional military recruiting offices.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              office: { type: Type.STRING },
              phone: { type: Type.STRING },
              distance: { type: Type.STRING }
            },
            required: ["id", "name", "office", "phone", "distance"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Recruiter Error:", error);
    return [];
  }
};

export const summarizeProgramStrengths = async (strengths: string[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the following residency program strengths into a compelling one-sentence pitch: ${strengths.join(", ")}`,
    });
    // Use .text property directly
    return response.text;
  } catch (error) {
    return strengths.join(", ");
  }
};

/**
 * Generates an American flag image using the image generation model.
 */
export const generateAmericanFlagImage = async () => {
  try {
    const prompt = "A high-quality, cinematic, professional photograph of the United States American Flag waving proudly against a clear blue sky. Dramatic lighting, sharp details, patriotism.";
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Flag Generation Error:", error);
    return null;
  }
};

/**
 * Generates a themed image for a residency program using the image generation model.
 */
export const generateProgramCoverImage = async (programName: string, specialty: string, location: string) => {
  try {
    const prompt = `A professional, cinematic, and clean photography style image for a medical residency program. 
    The program is ${programName} for ${specialty} located in ${location}. 
    The image should feature modern hospital architecture or a high-tech medical simulation environment, 
    conveying excellence, leadership, and military medicine. Avoid text in the image.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};
