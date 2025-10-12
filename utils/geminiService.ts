
const GOOGLE_AI_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
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
 */
export async function generateEnhancedQuranQuote(topic?: string): Promise<QuranVerseEnhanced | null> {
  try {
    if (!GOOGLE_AI_API_KEY) {
      console.warn('Google AI API key not configured');
      return null;
    }

    const prompt = topic 
      ? `Provide a relevant Quran verse about ${topic} with its Arabic text, English translation, reference (Surah:Ayah), brief context, and a short spiritual reflection. Format as JSON with keys: arabic, translation, reference, context, reflection.`
      : `Provide an inspiring Quran verse with its Arabic text, English translation, reference (Surah:Ayah), brief context, and a short spiritual reflection. Format as JSON with keys: arabic, translation, reference, context, reflection.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      })
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return null;
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!text) {
      return null;
    }

    // Try to parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
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
 */
export async function askIslamicQuestion(question: string): Promise<IslamicQuestion | null> {
  try {
    if (!GOOGLE_AI_API_KEY) {
      console.warn('Google AI API key not configured');
      return null;
    }

    const prompt = `As an Islamic knowledge assistant, answer this question: "${question}". 
    Provide a clear, respectful answer based on Quran and authentic Hadith. 
    Include relevant references. Format as JSON with keys: question, answer, references (array of strings).`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 800,
        }
      })
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return null;
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!text) {
      return null;
    }

    // Try to parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
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
 */
export async function generateDailyHadith(): Promise<{ hadith: string; explanation: string; reference: string } | null> {
  try {
    if (!GOOGLE_AI_API_KEY) {
      console.warn('Google AI API key not configured');
      return null;
    }

    const prompt = `Provide an authentic Hadith with its English translation, a brief explanation of its meaning and relevance to daily life, and the reference (collection and number). Format as JSON with keys: hadith, explanation, reference.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
        }
      })
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return null;
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!text) {
      return null;
    }

    // Try to parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
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
 */
export async function analyzeRecitation(audioData: string): Promise<{ feedback: string; score: number } | null> {
  // This would require audio processing capabilities
  // For now, return a placeholder
  console.log('Recitation analysis not yet implemented');
  return null;
}

/**
 * Generate personalized spiritual advice
 */
export async function generateSpiritualAdvice(context: string): Promise<string | null> {
  try {
    if (!GOOGLE_AI_API_KEY) {
      console.warn('Google AI API key not configured');
      return null;
    }

    const prompt = `As a compassionate Islamic spiritual advisor, provide brief, uplifting advice for someone who ${context}. Keep it concise (2-3 sentences) and include a relevant Quran verse or Hadith reference.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 300,
        }
      })
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return null;
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text;
    
    return text || null;
  } catch (error) {
    console.error('Error generating spiritual advice:', error);
    return null;
  }
}
