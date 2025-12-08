
# API Security Implementation - Complete Guide

## ✅ Current Security Status

All API keys are now **securely stored** and **NOT exposed** in the client-side code.

## 🔐 Security Architecture

### 1. **Google AI API Key (Gemini)**
- **Location**: Supabase Edge Function environment variables
- **Access**: Backend only (ai-service edge function)
- **Client Access**: Through authenticated API calls to `/functions/v1/ai-service`

### 2. **Supabase Keys**
- **Anon Key**: Public key (safe to expose) - used for client authentication
- **Service Role Key**: Private key (stored in Supabase backend only)

### 3. **RevenueCat API Key**
- **Type**: Public API key (safe to expose in client)
- **Purpose**: Identifies your app to RevenueCat
- **Security**: Actual subscription verification happens on RevenueCat servers

## 📁 File Structure

```
app/
├── integrations/supabase/
│   └── client.ts              # Supabase client with public anon key
utils/
├── geminiService.ts           # AI service client (calls backend)
├── revenueCatService.ts       # RevenueCat integration
.env.example                   # Template for environment variables
```

## 🛡️ Security Implementation Details

### AI Service (Gemini)

**Before (Insecure):**
```typescript
// ❌ API key exposed in client code
const API_KEY = 'AIzaSy...';
const genAI = new GoogleGenerativeAI(API_KEY);
```

**After (Secure):**
```typescript
// ✅ API key stored in Supabase Edge Function
const AI_SERVICE_URL = `${SUPABASE_URL}/functions/v1/ai-service`;

async function callAIService(type: string, payload?: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(AI_SERVICE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ type, payload }),
  });
  
  return response.json();
}
```

### Edge Function Setup

The `ai-service` edge function handles all AI requests:

```typescript
// supabase/functions/ai-service/index.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

Deno.serve(async (req) => {
  // Get API key from environment (secure)
  const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
  
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'API key not configured' }),
      { status: 500 }
    );
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  // ... handle AI requests
});
```

## 🔧 Configuration Steps

### 1. Set Up Supabase Edge Function Environment Variables

```bash
# In Supabase Dashboard:
# 1. Go to Edge Functions
# 2. Select 'ai-service' function
# 3. Add environment variable:
#    Key: GOOGLE_AI_API_KEY
#    Value: Your Google AI API key from https://aistudio.google.com/app/apikey
```

### 2. Verify Edge Function Deployment

```bash
# Check if ai-service is deployed and active
# Status should be: ACTIVE
```

### 3. Test AI Service

```typescript
// Test from client
import { testGeminiConnection } from '@/utils/geminiService';

const isWorking = await testGeminiConnection();
console.log('AI Service Status:', isWorking ? '✅ Working' : '❌ Not Working');
```

## 🎯 AI Features Using Secure Backend

All these features now use the secure backend API:

1. **Enhanced Quran Quotes** - `generateEnhancedQuranQuote()`
2. **Islamic Q&A Chatbot** - `askIslamicQuestion()`
3. **Daily Hadith** - `generateDailyHadith()`
4. **Spiritual Advice** - `generateSpiritualAdvice()`
5. **Prayer Reflections** - `generatePrayerReflection()`
6. **Personalized Duas** - `generatePersonalizedDua()`
7. **Islamic Quizzes** - `generateIslamicQuiz()`
8. **Ramadan Content** - `generateRamadanContent()`

## 🔒 Security Benefits

### ✅ What's Protected:
- Google AI API key never exposed in client code
- API key not in version control (git)
- API key not in app bundles (iOS/Android)
- API key not visible in network requests
- Centralized access control via Supabase auth

### ✅ Additional Security:
- User authentication required for AI features
- Subscription tier verification on backend
- Rate limiting possible on edge function
- Request logging for monitoring
- Easy key rotation without app updates

## 📊 Subscription Tier Access Control

The backend verifies subscription tiers before processing AI requests:

```typescript
// Backend checks user's subscription tier
if (type === 'hadith' && userTier !== 'iman') {
  return {
    error: 'premium_required',
    message: 'Daily Hadith requires Iman subscription',
    required_tier: 'iman',
    current_tier: userTier
  };
}
```

## 🚀 Production Checklist

- [x] Google AI API key stored in Supabase Edge Function
- [x] Client code uses backend API for all AI features
- [x] Authentication required for AI service calls
- [x] Subscription tier verification implemented
- [x] Error handling and fallbacks in place
- [x] No API keys in .env files
- [x] No API keys in client code
- [x] Documentation updated

## 🔄 Key Rotation Process

If you need to rotate the Google AI API key:

1. Generate new key at https://aistudio.google.com/app/apikey
2. Update in Supabase Dashboard:
   - Edge Functions → ai-service → Environment Variables
   - Update GOOGLE_AI_API_KEY value
3. Redeploy edge function (automatic on save)
4. Test with `testGeminiConnection()`
5. No client app updates needed! 🎉

## 📝 Environment Variables Reference

### Client (.env - NOT USED FOR SECRETS)
```bash
# Public keys only (safe to expose)
EXPO_PUBLIC_SUPABASE_URL=https://asuhklwnekgmfdfvjxms.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Supabase Edge Function (Secure)
```bash
# Private keys (stored in Supabase Dashboard)
GOOGLE_AI_API_KEY=AIzaSy...  # Your Google AI API key
```

### RevenueCat (Client - Public Key)
```typescript
// Public API key (safe in client code)
const REVENUECAT_API_KEY = 'test_amHZgULphTOfAXgpIlAcujAxXvZ';
```

## 🎓 Best Practices

1. **Never commit API keys to git**
2. **Use environment variables for all secrets**
3. **Store secrets in backend only**
4. **Use public keys for client when possible**
5. **Implement authentication for sensitive endpoints**
6. **Add rate limiting to prevent abuse**
7. **Monitor API usage and costs**
8. **Rotate keys regularly**
9. **Use different keys for dev/staging/production**
10. **Document all security measures**

## 🆘 Troubleshooting

### AI Service Not Working?

1. **Check Edge Function Status**
   ```bash
   # In Supabase Dashboard: Edge Functions → ai-service
   # Status should be: ACTIVE
   ```

2. **Verify Environment Variable**
   ```bash
   # Edge Functions → ai-service → Environment Variables
   # GOOGLE_AI_API_KEY should be set
   ```

3. **Check Logs**
   ```bash
   # Edge Functions → ai-service → Logs
   # Look for errors or missing API key messages
   ```

4. **Test Connection**
   ```typescript
   const isWorking = await testGeminiConnection();
   console.log('AI Service:', isWorking);
   ```

### Common Issues:

- **"API key not configured"** → Set GOOGLE_AI_API_KEY in edge function
- **"Premium required"** → User needs Iman subscription tier
- **"User not authenticated"** → User must be logged in
- **Network errors** → Check internet connection and Supabase status

## 📞 Support

For issues with:
- **Supabase**: https://supabase.com/docs
- **Google AI**: https://ai.google.dev/docs
- **RevenueCat**: https://www.revenuecat.com/docs

---

**Last Updated**: January 2025
**Security Status**: ✅ All API keys secured
**AI Service Status**: ✅ Functional via backend
