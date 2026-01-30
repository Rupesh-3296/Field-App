
import { GoogleGenAI, Type } from '@google/genai';
import type { FormData, Crop, Language } from '../types';

if (!process.env.API_KEY) {
  // This is a placeholder for development.
  // In a real environment, the API key would be securely managed.
  console.warn("API_KEY environment variable not set. Using a placeholder.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const cropRecommendationSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        cropName: { type: Type.STRING, description: 'The common name of the crop.' },
        scientificName: { type: Type.STRING, description: 'The scientific (Latin) name of the crop.' },
        emoji: { type: Type.STRING, description: 'A single, suitable emoji that represents the crop (e.g., 🌾 for rice).' },
        description: { type: Type.STRING, description: 'A brief description of the crop and why it is suitable.' },
        plantingSeason: { type: Type.STRING, description: 'The optimal season or months for planting.' },
        waterNeeds: { type: Type.STRING, description: 'General water requirements (e.g., Low, Medium, High).' },
        marketValue: { type: Type.STRING, description: 'Estimated market value or profitability (e.g., High, Medium, Low).' },
        soilPreference: { type: Type.STRING, description: 'The preferred soil type for this specific crop.' },
      },
      required: ['cropName', 'emoji', 'description', 'plantingSeason', 'waterNeeds', 'marketValue'],
    },
};

export const getCropRecommendations = async (formData: FormData, thinkingMode: boolean, language: Language): Promise<Crop[]> => {
  const modelName = thinkingMode ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const config: any = {
    responseMimeType: 'application/json',
    responseSchema: cropRecommendationSchema,
  };

  if (thinkingMode) {
    config.thinkingConfig = { thinkingBudget: 32768 };
  }
  
  const languageMap = {
    en: 'English',
    es: 'Spanish',
    hi: 'Hindi',
    te: 'Telugu',
    ta: 'Tamil',
    kn: 'Kannada'
  };
  const targetLanguage = languageMap[language] || 'English';

  const prompt = `
    Please act as an expert agricultural advisor. Based on the farming conditions for the location specified below, recommend 4 highly suitable crops.
    Your entire response, including all text values in the final JSON output, MUST be in the ${targetLanguage} language. This includes crop names, descriptions, planting seasons, etc.

    Use your knowledge to determine the typical average annual rainfall and average temperature for this location to inform your recommendations.
    The user has specified a preference for crops with a ${formData.cost} cost of cultivation. Please factor this into your recommendations.

    For each crop, provide the following details:
    - 'cropName': The common name of the crop.
    - 'scientificName': The scientific (Latin) name of the crop (if available).
    - 'emoji': A single, suitable emoji that represents the crop (e.g., 🌾 for rice).
    - 'description': A brief description of the crop and why it is suitable for the given conditions.
    - 'plantingSeason': The optimal season or months for planting.
    - 'waterNeeds': General water requirements (e.g., Low, Medium, High).
    - 'marketValue': Estimated market value or profitability (e.g., High, Medium, Low).
    - 'soilPreference': The preferred soil type for this specific crop (if applicable).
    
    Conditions:
    - Location: Approximately at Latitude ${formData.latitude}, Longitude ${formData.longitude}. The user identifies this location as "${formData.locationName}".
    - Soil Type: ${formData.soilType || 'Not specified'}
    - Climate: ${formData.climate || 'Not specified'}
    - Preferred Cost of Cultivation: ${formData.cost}

    Provide the output as a JSON array of objects, strictly following the provided schema. Do not add any extra text or explanation outside of the JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config,
    });

    const jsonText = response.text.trim();
    const recommendations: Crop[] = JSON.parse(jsonText);
    return recommendations;
  } catch (error) {
    console.error("Error fetching crop recommendations:", error);
    throw new Error("Failed to get recommendations from AI model.");
  }
};