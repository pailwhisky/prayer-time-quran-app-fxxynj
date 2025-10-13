
import { GoogleGenerativeAI } from "@google/generative-ai";

const GOOGLE_AI_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

// Initialize the Gemini AI client
function initializeGemini() {
  if (!GOOGLE_AI_API_KEY) {
    console.warn('⚠️ Google AI API key not configured. Please set EXPO_PUBLIC_GOOGLE_AI_API_KEY in your environment.');
    console.warn('Islamic AI features will use fallback content.');
    return false;
  }

  if (!genAI) {
    try {
      genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
      model = genAI.getGenerativeModel({ model: "gemini-pro" });
      console.log('✅ Gemini AI initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Gemini AI:', error);
      return false;
    }
  }

  return true;
}

export interface QuranVerseEnhanced {
  arabic: string;
  translation: string;
  reference: string;
  context: string;
  reflection: string;
}

export interface IslamicQuestion {
  question: string;
  answer: string;
  references: string[];
}

/**
 * Generate an enhanced Quran quote with AI-powered context and reflection
 * Uses GOOGLE_AI_API_KEY for Gemini AI
 */
export async function generateEnhancedQuranQuote(topic?: string): Promise<QuranVerseEnhanced | null> {
  try {
    if (!initializeGemini()) {
      console.log('Using fallback Quran quote');
      return null;
    }

    const prompt = topic 
      ? `Provide a relevant Quran verse about ${topic} with its Arabic text, English translation, reference (Surah:Ayah), brief context, and a short spiritual reflection. Format as JSON with keys: arabic, translation, reference, context, reflection.`
      : `Provide an inspiring Quran verse with its Arabic text, English translation, reference (Surah:Ayah), brief context, and a short spiritual reflection. Format as JSON with keys: arabic, translation, reference, context, reflection.`;

    console.log('🤖 Generating enhanced Quran quote with Gemini AI...');
    const result = await model!.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      return null;
    }

    // Try to parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ Enhanced Quran quote generated successfully');
        return parsed;
      }
    } catch (e) {
      console.log('Could not parse JSON, using text response');
    }

    return null;
  } catch (error) {
    console.error('Error generating enhanced quote:', error);
    return null;
  }
}

/**
 * Get AI-powered answer to Islamic questions
 * Uses GOOGLE_AI_API_KEY for Gemini AI
 */
export async function askIslamicQuestion(question: string): Promise<IslamicQuestion | null> {
  try {
    if (!initializeGemini()) {
      return {
        question,
        answer: 'AI assistant is currently unavailable. Please check your API key configuration.',
        references: []
      };
    }

    const prompt = `As an Islamic knowledge assistant, answer this question: "${question}". 
    Provide a clear, respectful answer based on Quran and authentic Hadith. 
    Include relevant references. Format as JSON with keys: question, answer, references (array of strings).`;

    console.log('🤖 Processing Islamic question with Gemini AI...');
    const result = await model!.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      return null;
    }

    // Try to parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ Islamic question answered successfully');
        return parsed;
      }
    } catch (e) {
      console.log('Could not parse JSON, returning text response');
      return {
        question,
        answer: text,
        references: []
      };
    }

    return null;
  } catch (error) {
    console.error('Error asking Islamic question:', error);
    return null;
  }
}

/**
 * Generate personalized daily Hadith with explanation
 * Uses GOOGLE_AI_API_KEY for Gemini AI
 */
export async function generateDailyHadith(): Promise<{ hadith: string; explanation: string; reference: string } | null> {
  try {
    if (!initializeGemini()) {
      console.log('Using fallback Hadith');
      return null;
    }

    const prompt = `Provide an authentic Hadith with its English translation, a brief explanation of its meaning and relevance to daily life, and the reference (collection and number). Format as JSON with keys: hadith, explanation, reference.`;

    console.log('🤖 Generating daily Hadith with Gemini AI...');
    const result = await model!.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      return null;
    }

    // Try to parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ Daily Hadith generated successfully');
        return parsed;
      }
    } catch (e) {
      console.log('Could not parse JSON');
    }

    return null;
  } catch (error) {
    console.error('Error generating daily hadith:', error);
    return null;
  }
}

/**
 * Analyze Quran recitation for Tajweed feedback (placeholder for future implementation)
 * Would use GOOGLE_AI_API_KEY for Gemini AI audio analysis
 */
export async function analyzeRecitation(audioData: string): Promise<{ feedback: string; score: number } | null> {
  // This would require audio processing capabilities
  // For now, return a placeholder
  console.log('Recitation analysis not yet implemented - requires audio processing with Gemini AI');
  return null;
}

/**
 * Generate personalized spiritual advice
 * Uses GOOGLE_AI_API_KEY for Gemini AI
 */
export async function generateSpiritualAdvice(context: string): Promise<string | null> {
  try {
    if (!initializeGemini()) {
      return null;
    }

    const prompt = `As a compassionate Islamic spiritual advisor, provide brief, uplifting advice for someone who ${context}. Keep it concise (2-3 sentences) and include a relevant Quran verse or Hadith reference.`;

    console.log('🤖 Generating spiritual advice with Gemini AI...');
    const result = await model!.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Spiritual advice generated successfully');
    return text || null;
  } catch (error) {
    console.error('Error generating spiritual advice:', error);
    return null;
  }
}

/**
 * Generate prayer reflection based on time of day
 * Uses GOOGLE_AI_API_KEY for Gemini AI
 */
export async function generatePrayerReflection(prayerName: string): Promise<string | null> {
  try {
    if (!initializeGemini()) {
      return null;
    }

    const prompt = `Provide a brief, inspiring reflection for ${prayerName} prayer time. Include its spiritual significance and a relevant Quran verse or Hadith. Keep it concise (2-3 sentences).`;

    console.log(`🤖 Generating ${prayerName} prayer reflection with Gemini AI...`);
    const result = await model!.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Prayer reflection generated successfully');
    return text || null;
  } catch (error) {
    console.error('Error generating prayer reflection:', error);
    return null;
  }
}

/**
 * Generate personalized Dua based on user's need
 * Uses GOOGLE_AI_API_KEY for Gemini AI
 */
export async function generatePersonalizedDua(need: string): Promise<{ arabic: string; transliteration: string; translation: string; reference?: string } | null> {
  try {
    if (!initializeGemini()) {
      return null;
    }

    const prompt = `Provide an authentic Islamic Dua (supplication) for someone who needs ${need}. Include the Arabic text, transliteration, English translation, and reference if available. Format as JSON with keys: arabic, transliteration, translation, reference.`;

    console.log('🤖 Generating personalized Dua with Gemini AI...');
    const result = await model!.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      return null;
    }

    // Try to parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ Personalized Dua generated successfully');
        return parsed;
      }
    } catch (e) {
      console.log('Could not parse JSON');
    }

    return null;
  } catch (error) {
    console.error('Error generating personalized dua:', error);
    return null;
  }
}

/**
 * Generate Islamic quiz questions for learning
 * Uses GOOGLE_AI_API_KEY for Gemini AI
 */
export async function generateIslamicQuiz(topic: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<Array<{ question: string; options: string[]; correctAnswer: number; explanation: string }> | null> {
  try {
    if (!initializeGemini()) {
      return null;
    }

    const prompt = `Generate 5 ${difficulty} level multiple choice quiz questions about ${topic} in Islam. Each question should have 4 options with one correct answer. Include a brief explanation for each answer. Format as JSON array with objects containing: question, options (array of 4 strings), correctAnswer (index 0-3), explanation.`;

    console.log(`🤖 Generating ${difficulty} Islamic quiz on ${topic} with Gemini AI...`);
    const result = await model!.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      return null;
    }

    // Try to parse JSON response
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ Islamic quiz generated successfully');
        return parsed;
      }
    } catch (e) {
      console.log('Could not parse JSON');
    }

    return null;
  } catch (error) {
    console.error('Error generating Islamic quiz:', error);
    return null;
  }
}

/**
 * Generate Ramadan-specific content
 * Uses GOOGLE_AI_API_KEY for Gemini AI
 */
export async function generateRamadanContent(type: 'suhoor' | 'iftar' | 'taraweeh'): Promise<string | null> {
  try {
    if (!initializeGemini()) {
      return null;
    }

    const prompts = {
      suhoor: 'Provide a brief, inspiring message for Suhoor (pre-dawn meal) during Ramadan. Include a relevant Hadith or Quran verse.',
      iftar: 'Provide a brief, inspiring message for Iftar (breaking fast) during Ramadan. Include the traditional dua and a spiritual reflection.',
      taraweeh: 'Provide a brief, inspiring message about Taraweeh prayers during Ramadan. Include its significance and benefits.',
    };

    console.log(`🤖 Generating Ramadan ${type} content with Gemini AI...`);
    const result = await model!.generateContent(prompts[type]);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Ramadan content generated successfully');
    return text || null;
  } catch (error) {
    console.error('Error generating Ramadan content:', error);
    return null;
  }
}
