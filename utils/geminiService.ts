
import { supabase } from '@/app/integrations/supabase/client';

/**
 * AI Service - Premium Feature
 * 
 * SECURITY: All AI features are powered by our secure backend API.
 * The Google AI API key is stored securely in Supabase Edge Function environment variables.
 * Users cannot configure AI settings directly - this is managed server-side.
 * 
 * This approach ensures:
 * - API keys are never exposed in client code
 * - API keys are not included in app bundles
 * - API keys cannot be extracted from network requests
 * - Centralized control over AI feature access
 * - Subscription-based access control
 */

const AI_SERVICE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL 
  ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-service`
  : '';

/**
 * Call our backend AI service
 * The backend handles authentication, subscription verification, and API key management
 */
async function callAIService(type: string, payload?: any): Promise<any> {
  try {
    if (!AI_SERVICE_URL) {
      console.error('❌ AI service URL not configured');
      return null;
    }

    // Get the current session token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.warn('⚠️ User not authenticated. AI features require login.');
      return null;
    }

    const response = await fetch(AI_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ type, payload }),
    });

    if (!response.ok) {
      const error = await response.json();
      
      // Handle premium feature error
      if (response.status === 403) {
        console.warn(`⚠️ Premium feature: ${error.message}`);
        return {
          error: 'premium_required',
          message: error.message,
          required_tier: error.required_tier,
          current_tier: error.current_tier,
        };
      }
      
      throw new Error(error.error || 'AI service error');
    }

    const data = await response.json();
    console.log(`✅ AI service response received for type: ${type}`);
    return data;
  } catch (error) {
    console.error(`❌ Error calling AI service (${type}):`, error);
    return null;
  }
}

export const generateEnhancedQuranQuote = async (topic: string = 'faith and spirituality'): Promise<any> => {
  try {
    console.log(`🤖 Generating enhanced Quran quote about: ${topic}`);
    const result = await callAIService('quote', { topic });
    
    if (result?.error === 'premium_required') {
      console.warn('⚠️ Premium subscription required for enhanced quotes');
      return null;
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error generating enhanced quote:', error);
    return null;
  }
};

export const askIslamicQuestion = async (question: string): Promise<{ answer: string; references?: string[] }> => {
  try {
    console.log(`🤖 Processing Islamic question: ${question}`);
    const result = await callAIService('question', { question });
    
    if (result?.error === 'premium_required') {
      return {
        answer: `This AI assistant feature requires a ${result.required_tier} subscription. Please upgrade to access personalized Islamic guidance.`,
        references: []
      };
    }
    
    if (!result) {
      return {
        answer: 'AI service is currently unavailable. Please try again later.',
        references: []
      };
    }
    
    return result;
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
    const result = await callAIService('hadith');
    
    if (result?.error === 'premium_required') {
      console.warn('⚠️ Premium subscription required for AI-generated Hadith');
      return null;
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error generating daily hadith:', error);
    return null;
  }
};

export const analyzeRecitation = async (audioData: string): Promise<any> => {
  try {
    console.log('🤖 Analyzing recitation');
    // Note: This feature requires ultra subscription and audio processing
    // For now, return a placeholder indicating premium feature
    return {
      error: 'premium_required',
      message: 'AI recitation analysis requires an Ultra subscription',
      required_tier: 'ultra'
    };
  } catch (error) {
    console.error('❌ Error analyzing recitation:', error);
    return null;
  }
};

export const generateSpiritualAdvice = async (context: string): Promise<string> => {
  try {
    console.log(`🤖 Generating spiritual advice for: ${context}`);
    const result = await callAIService('advice', { context });
    
    if (result?.error === 'premium_required') {
      return `This spiritual guidance feature requires a ${result.required_tier} subscription. Please upgrade to access personalized Islamic advice.`;
    }
    
    if (!result?.advice) {
      return 'AI service is currently unavailable. Please try again later.';
    }
    
    return result.advice;
  } catch (error) {
    console.error('❌ Error generating spiritual advice:', error);
    return 'Unable to generate advice at this time. Please try again later.';
  }
};

export const generatePrayerReflection = async (prayerName: string): Promise<string> => {
  try {
    console.log(`🤖 Generating prayer reflection for: ${prayerName}`);
    const result = await callAIService('prayer_reflection', { prayerName });
    
    if (result?.error === 'premium_required') {
      return `${prayerName} is a blessed time to connect with Allah. May your prayer be accepted.`;
    }
    
    if (!result?.reflection) {
      return `${prayerName} is a blessed time to connect with Allah. May your prayer be accepted.`;
    }
    
    return result.reflection;
  } catch (error) {
    console.error('❌ Error generating prayer reflection:', error);
    return `${prayerName} is a blessed time to connect with Allah. May your prayer be accepted.`;
  }
};

export const generatePersonalizedDua = async (need: string): Promise<string> => {
  try {
    console.log(`🤖 Generating personalized dua for: ${need}`);
    const result = await callAIService('dua', { need });
    
    if (result?.error === 'premium_required') {
      return 'May Allah grant you what is best for you in this life and the hereafter. Ameen.';
    }
    
    if (!result?.dua) {
      return 'May Allah grant you what is best for you in this life and the hereafter. Ameen.';
    }
    
    return result.dua;
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
    const result = await callAIService('quiz', { topic, difficulty });
    
    if (result?.error === 'premium_required') {
      console.warn('⚠️ Premium subscription required for AI-generated quizzes');
      return null;
    }
    
    return result;
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
    const result = await callAIService('ramadan', { type });
    
    if (result?.error === 'premium_required') {
      return 'May Allah accept your fasting and prayers during this blessed month. Ramadan Mubarak!';
    }
    
    if (!result?.content) {
      return 'May Allah accept your fasting and prayers during this blessed month. Ramadan Mubarak!';
    }
    
    return result.content;
  } catch (error) {
    console.error('❌ Error generating Ramadan content:', error);
    return 'May Allah accept your fasting and prayers during this blessed month. Ramadan Mubarak!';
  }
};

/**
 * Test AI service connection
 * Note: This is for internal testing only. Users cannot configure AI settings.
 */
export const testGeminiConnection = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testing AI service connection...');
    
    // Simple test to check if service is available
    const result = await callAIService('quote', { topic: 'test' });
    
    if (result?.error === 'premium_required') {
      console.log('⚠️ AI service requires premium subscription');
      return false;
    }
    
    if (result) {
      console.log('✅ AI service connection test successful');
      return true;
    }
    
    console.error('❌ AI service not available');
    return false;
  } catch (error) {
    console.error('❌ AI service connection test failed:', error);
    return false;
  }
};
