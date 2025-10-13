
import { GoogleGenerativeAI } from "@google/generative-ai";

const GOOGLE_AI_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

const initializeGemini = () => {
  if (!GOOGLE_AI_API_KEY) {
    console.warn('⚠️ Google AI API key not found. AI features will be disabled.');
    console.warn('Please set EXPO_PUBLIC_GOOGLE_AI_API_KEY in your .env file');
    return null;
  }

  if (!genAI) {
    try {
      genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
      console.log('✅ Gemini AI initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Gemini AI:', error);
      return null;
    }
  }

  return genAI;
};

export const generateEnhancedQuranQuote = async (topic: string = 'faith and spirituality'): Promise<any> => {
  try {
    console.log(`🤖 Generating enhanced Quran quote about: ${topic}`);
    const ai = initializeGemini();
    if (!ai) {
      console.warn('Gemini AI not initialized, returning null');
      return null;
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

    console.log('📝 Gemini response received');

    // Try to parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully parsed enhanced quote');
      return parsed;
    }

    console.warn('⚠️ Failed to parse JSON from Gemini response');
    return null;
  } catch (error) {
    console.error('❌ Error generating enhanced quote:', error);
    return null;
  }
};

export const askIslamicQuestion = async (question: string): Promise<{ answer: string; references?: string[] }> => {
  try {
    console.log(`🤖 Processing Islamic question: ${question}`);
    const ai = initializeGemini();
    if (!ai) {
      return {
        answer: 'AI service is currently unavailable. Please check your API key configuration in the .env file.',
        references: []
      };
    }

    const model = ai.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are a knowledgeable Islamic scholar assistant. Answer the following question about Islam with accuracy, respect, and clarity. Base your answers on authentic Islamic sources (Quran and Hadith). If you're unsure about something, acknowledge it.

Question: ${question}

Provide a clear, respectful, and informative answer. Include relevant Quranic verses or Hadith references when applicable. Format your response as follows:

ANSWER:
[Your detailed answer here]

REFERENCES:
- [Reference 1]
- [Reference 2]
(Include only if applicable)`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('📝 Gemini response received for Islamic question');

    // Parse answer and references
    const answerMatch = text.match(/ANSWER:\s*([\s\S]*?)(?=REFERENCES:|$)/);
    const referencesMatch = text.match(/REFERENCES:\s*([\s\S]*?)$/);

    const answer = answerMatch ? answerMatch[1].trim() : text;
    const references: string[] = [];

    if (referencesMatch) {
      const refText = referencesMatch[1];
      const refLines = refText.split('\n').filter(line => line.trim().startsWith('-'));
      references.push(...refLines.map(line => line.replace(/^-\s*/, '').trim()));
    }

    console.log('✅ Successfully processed Islamic question');
    return { answer, references: references.length > 0 ? references : undefined };
  } catch (error) {
    console.error('❌ Error asking Islamic question:', error);
    return {
      answer: 'I apologize, but I encountered an error processing your question. Please try again later.',
      references: []
    };
  }
};

export const generateDailyHadith = async (): Promise<any> => {
  try {
    console.log('🤖 Generating daily Hadith');
    const ai = initializeGemini();
    if (!ai) {
      console.warn('Gemini AI not initialized, returning null');
      return null;
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

    console.log('📝 Gemini response received for daily Hadith');

    // Try to parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully parsed daily Hadith');
      return parsed;
    }

    console.warn('⚠️ Failed to parse JSON from Gemini response');
    return null;
  } catch (error) {
    console.error('❌ Error generating daily hadith:', error);
    return null;
  }
};

export const analyzeRecitation = async (audioData: string): Promise<any> => {
  try {
    console.log('🤖 Analyzing recitation (placeholder)');
    const ai = initializeGemini();
    if (!ai) {
      console.warn('Gemini AI not initialized');
      return null;
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
    console.error('❌ Error analyzing recitation:', error);
    return null;
  }
};

export const generateSpiritualAdvice = async (context: string): Promise<string> => {
  try {
    console.log(`🤖 Generating spiritual advice for: ${context}`);
    const ai = initializeGemini();
    if (!ai) {
      return 'AI service is currently unavailable. Please check your API key configuration.';
    }

    const model = ai.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `As a compassionate Islamic advisor, provide spiritual guidance for someone experiencing: ${context}

Offer advice based on Islamic teachings, including relevant Quranic verses or Hadith. Be empathetic, practical, and encouraging. Keep your response concise but meaningful (3-4 paragraphs).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Successfully generated spiritual advice');
    return text;
  } catch (error) {
    console.error('❌ Error generating spiritual advice:', error);
    return 'Unable to generate advice at this time. Please try again later.';
  }
};

export const generatePrayerReflection = async (prayerName: string): Promise<string> => {
  try {
    console.log(`🤖 Generating prayer reflection for: ${prayerName}`);
    const ai = initializeGemini();
    if (!ai) {
      return `${prayerName} is a blessed time to connect with Allah. May your prayer be accepted.`;
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
    const text = response.text();

    console.log('✅ Successfully generated prayer reflection');
    return text;
  } catch (error) {
    console.error('❌ Error generating prayer reflection:', error);
    return `${prayerName} is a blessed time to connect with Allah. May your prayer be accepted.`;
  }
};

export const generatePersonalizedDua = async (need: string): Promise<string> => {
  try {
    console.log(`🤖 Generating personalized dua for: ${need}`);
    const ai = initializeGemini();
    if (!ai) {
      return 'May Allah grant you what is best for you in this life and the hereafter. Ameen.';
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
    const text = response.text();

    console.log('✅ Successfully generated personalized dua');
    return text;
  } catch (error) {
    console.error('❌ Error generating personalized dua:', error);
    return 'May Allah grant you what is best for you in this life and the hereafter. Ameen.';
  }
};

export const generateIslamicQuiz = async (
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<any> => {
  try {
    console.log(`🤖 Generating Islamic quiz - Topic: ${topic}, Difficulty: ${difficulty}`);
    const ai = initializeGemini();
    if (!ai) {
      console.warn('Gemini AI not initialized');
      return null;
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

    console.log('📝 Gemini response received for Islamic quiz');

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully parsed Islamic quiz');
      return parsed;
    }

    console.warn('⚠️ Failed to parse JSON from Gemini response');
    return null;
  } catch (error) {
    console.error('❌ Error generating Islamic quiz:', error);
    return null;
  }
};

export const generateRamadanContent = async (
  type: 'suhoor' | 'iftar' | 'taraweeh'
): Promise<string> => {
  try {
    console.log(`🤖 Generating Ramadan content for: ${type}`);
    const ai = initializeGemini();
    if (!ai) {
      return 'May Allah accept your fasting and prayers during this blessed month. Ramadan Mubarak!';
    }

    const model = ai.getGenerativeModel({ model: "gemini-pro" });

    let prompt = '';
    switch (type) {
      case 'suhoor':
        prompt = 'Provide a brief, inspiring message for Suhoor (pre-dawn meal) during Ramadan. Include a relevant dua and practical tips. Keep it concise (2-3 paragraphs).';
        break;
      case 'iftar':
        prompt = 'Provide a brief, inspiring message for Iftar (breaking fast) during Ramadan. Include the traditional dua and a reflection. Keep it concise (2-3 paragraphs).';
        break;
      case 'taraweeh':
        prompt = 'Provide a brief, inspiring message about Taraweeh prayers during Ramadan. Include benefits and encouragement. Keep it concise (2-3 paragraphs).';
        break;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Successfully generated Ramadan content');
    return text;
  } catch (error) {
    console.error('❌ Error generating Ramadan content:', error);
    return 'May Allah accept your fasting and prayers during this blessed month. Ramadan Mubarak!';
  }
};

// Test function to verify API key is working
export const testGeminiConnection = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testing Gemini AI connection...');
    const ai = initializeGemini();
    if (!ai) {
      console.error('❌ Gemini AI not initialized - API key missing or invalid');
      return false;
    }

    const model = ai.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent('Say "Hello" in one word.');
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini AI connection test successful:', text);
    return true;
  } catch (error) {
    console.error('❌ Gemini AI connection test failed:', error);
    return false;
  }
};
