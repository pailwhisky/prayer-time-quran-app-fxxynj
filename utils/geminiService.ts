
import { GoogleGenerativeAI } from "@google/generative-ai";

const GOOGLE_AI_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

const initializeGemini = () => {
  if (!GOOGLE_AI_API_KEY) {
    console.warn('Google AI API key not found. AI features will be disabled.');
    return null;
  }

  if (!genAI) {
    try {
      genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
      console.log('Gemini AI initialized successfully');
    } catch (error) {
      console.error('Error initializing Gemini AI:', error);
      return null;
    }
  }

  return genAI;
};

export const generateEnhancedQuranQuote = async (topic: string = 'faith and spirituality'): Promise<any> => {
  try {
    const ai = initializeGemini();
    if (!ai) {
      throw new Error('Gemini AI not initialized');
    }

    const model = ai.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Generate an inspiring Quranic verse about ${topic}. 
    
    Provide the response in the following JSON format:
    {
      "arabic": "The verse in Arabic",
      "translation": "English translation",
      "reference": "Surah Name Chapter:Verse",
      "context": "Brief historical or situational context (2-3 sentences)",
      "reflection": "Personal reflection on how this applies to modern life (2-3 sentences)"
    }
    
    Make sure the verse is authentic and the reference is accurate. Focus on verses that provide comfort, guidance, or inspiration.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Error generating enhanced quote:', error);
    return null;
  }
};

export const askIslamicQuestion = async (question: string): Promise<string> => {
  try {
    const ai = initializeGemini();
    if (!ai) {
      return 'AI service is currently unavailable. Please check your API key configuration.';
    }

    const model = ai.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are a knowledgeable Islamic scholar assistant. Answer the following question about Islam with accuracy, respect, and clarity. Base your answers on authentic Islamic sources (Quran and Hadith). If you're unsure about something, acknowledge it.

Question: ${question}

Provide a clear, respectful, and informative answer. Include relevant Quranic verses or Hadith references when applicable.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error asking Islamic question:', error);
    return 'I apologize, but I encountered an error processing your question. Please try again later.';
  }
};

export const generateDailyHadith = async (): Promise<any> => {
  try {
    const ai = initializeGemini();
    if (!ai) {
      throw new Error('Gemini AI not initialized');
    }

    const model = ai.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Generate an authentic Hadith (saying of Prophet Muhammad ﷺ) for daily reflection.
    
    Provide the response in the following JSON format:
    {
      "hadith": "The Hadith text in English",
      "reference": "Collection name (e.g., Sahih Bukhari, Sahih Muslim) and number",
      "explanation": "Brief explanation of the Hadith's meaning and relevance (3-4 sentences)"
    }
    
    Choose a Hadith that provides practical guidance for daily life, moral teachings, or spiritual wisdom.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Error generating daily hadith:', error);
    return null;
  }
};

export const analyzeRecitation = async (audioData: string): Promise<any> => {
  try {
    const ai = initializeGemini();
    if (!ai) {
      throw new Error('Gemini AI not initialized');
    }

    // Note: This is a placeholder. Actual audio analysis would require
    // a multimodal model and proper audio processing
    return {
      accuracy: 85,
      feedback: 'Good recitation. Focus on tajweed rules for better pronunciation.',
      suggestions: [
        'Practice elongation (madd) rules',
        'Work on proper stops (waqf)',
        'Improve articulation points (makhraj)'
      ]
    };
  } catch (error) {
    console.error('Error analyzing recitation:', error);
    return null;
  }
};

export const generateSpiritualAdvice = async (context: string): Promise<string> => {
  try {
    const ai = initializeGemini();
    if (!ai) {
      return 'AI service is currently unavailable.';
    }

    const model = ai.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `As a compassionate Islamic advisor, provide spiritual guidance for someone experiencing: ${context}

Offer advice based on Islamic teachings, including relevant Quranic verses or Hadith. Be empathetic, practical, and encouraging.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating spiritual advice:', error);
    return 'Unable to generate advice at this time. Please try again later.';
  }
};

export const generatePrayerReflection = async (prayerName: string): Promise<string> => {
  try {
    const ai = initializeGemini();
    if (!ai) {
      return 'AI service is currently unavailable.';
    }

    const model = ai.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Generate a brief, inspiring reflection about ${prayerName} prayer in Islam. 
    
Include:
- The significance of this prayer
- A relevant Quranic verse or Hadith
- A practical tip for improving focus during this prayer

Keep it concise (3-4 sentences) and uplifting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating prayer reflection:', error);
    return `${prayerName} is a blessed time to connect with Allah. May your prayer be accepted.`;
  }
};

export const generatePersonalizedDua = async (need: string): Promise<string> => {
  try {
    const ai = initializeGemini();
    if (!ai) {
      return 'AI service is currently unavailable.';
    }

    const model = ai.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Generate a personalized Islamic dua (supplication) for someone seeking: ${need}

Provide:
1. A dua in English
2. Brief explanation of its significance
3. Relevant Quranic verse or Hadith if applicable

Keep it authentic to Islamic teachings and respectful.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating personalized dua:', error);
    return 'May Allah grant you what is best for you in this life and the hereafter. Ameen.';
  }
};

export const generateIslamicQuiz = async (
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<any> => {
  try {
    const ai = initializeGemini();
    if (!ai) {
      throw new Error('Gemini AI not initialized');
    }

    const model = ai.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Generate a ${difficulty} level Islamic quiz about ${topic}.
    
Provide 5 multiple-choice questions in the following JSON format:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of the correct answer"
    }
  ]
}

Make sure questions are accurate, educational, and appropriate for the difficulty level.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Error generating Islamic quiz:', error);
    return null;
  }
};

export const generateRamadanContent = async (
  type: 'suhoor' | 'iftar' | 'taraweeh'
): Promise<string> => {
  try {
    const ai = initializeGemini();
    if (!ai) {
      return 'AI service is currently unavailable.';
    }

    const model = ai.getGenerativeModel({ model: "gemini-pro" });

    let prompt = '';
    switch (type) {
      case 'suhoor':
        prompt = 'Provide a brief, inspiring message for Suhoor (pre-dawn meal) during Ramadan. Include a relevant dua and practical tips.';
        break;
      case 'iftar':
        prompt = 'Provide a brief, inspiring message for Iftar (breaking fast) during Ramadan. Include the traditional dua and a reflection.';
        break;
      case 'taraweeh':
        prompt = 'Provide a brief, inspiring message about Taraweeh prayers during Ramadan. Include benefits and encouragement.';
        break;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating Ramadan content:', error);
    return 'May Allah accept your fasting and prayers during this blessed month. Ramadan Mubarak!';
  }
};
