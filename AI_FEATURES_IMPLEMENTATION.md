
# AI Features Implementation - Premium Service

## Overview

All AI features in the Prayer Times app are now premium features that require a subscription. Users cannot configure AI settings directly - all AI functionality is managed through our secure backend API.

## Key Changes

### 1. Backend API Service

**Edge Function: `ai-service`**
- Location: Supabase Edge Functions
- Handles all AI requests server-side
- Enforces subscription tier requirements
- Protects API keys from client exposure

**Supported AI Operations:**
- `quote` - Enhanced Quran quotes (Free tier)
- `hadith` - Daily Hadith generation (Premium tier)
- `question` - Islamic Q&A chatbot (Ultra tier)
- `advice` - Spiritual guidance (Ultra tier)
- `prayer_reflection` - Prayer reflections (Premium tier)
- `dua` - Personalized duas (Premium tier)
- `quiz` - Islamic quizzes (Ultra tier)
- `ramadan` - Ramadan content (Premium tier)

### 2. Client-Side Changes

**Updated Files:**
- `utils/geminiService.ts` - Now calls backend API instead of direct Gemini API
- `components/IslamicChatbot.tsx` - Wrapped with PremiumGate (Ultra tier)
- `components/DailyHadith.tsx` - Wrapped with PremiumGate (Premium tier)
- `components/QuoteDisplay.tsx` - Shows premium prompt for AI insights
- `app/(tabs)/profile.tsx` - Removed AI configuration, added premium badges

**Removed Files:**
- `components/GeminiSetup.tsx` - User configuration no longer allowed
- `GEMINI_INTEGRATION_GUIDE.md` - No longer needed

### 3. Feature Gating

All AI features are now protected by:
1. **Server-side validation** - Edge function checks subscription tier
2. **Client-side UI** - PremiumGate component shows upgrade prompts
3. **Database enforcement** - subscription_features table defines access

### 4. Subscription Tiers

**Free Tier:**
- Basic Quran quotes (no AI enhancement)
- Standard prayer times
- Basic features

**Premium Tier ($4.99/month):**
- AI-generated Daily Hadith
- Enhanced Quran quotes with context
- Prayer reflections
- Personalized duas
- Ramadan content

**Ultra Tier ($9.99/month):**
- All Premium features
- AI Islamic Q&A Chatbot
- Spiritual guidance
- Islamic quizzes
- AI recitation feedback (coming soon)

## Security Features

1. **API Key Protection**
   - Google AI API key stored as Supabase secret
   - Never exposed to client
   - Only accessible by Edge Functions

2. **Authentication**
   - All AI requests require valid JWT token
   - User identity verified server-side

3. **Authorization**
   - Subscription tier checked for each request
   - Feature access enforced at API level

## User Experience

### For Free Users:
- See premium badges on AI features
- Get upgrade prompts when accessing premium features
- Can still use basic app functionality

### For Premium Users:
- Full access to AI-generated content
- Enhanced spiritual guidance
- Personalized Islamic content

### For Ultra Users:
- All premium features
- Interactive AI chatbot
- Advanced learning tools

## API Usage

### Example Request:
```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-service`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  },
  body: JSON.stringify({
    type: 'question',
    payload: { question: 'What are the pillars of Islam?' }
  }),
});
```

### Example Response (Success):
```json
{
  "answer": "The five pillars of Islam are...",
  "references": ["Quran 2:177", "Sahih Bukhari 8"]
}
```

### Example Response (Premium Required):
```json
{
  "error": "Premium feature",
  "message": "This feature requires ultra subscription",
  "required_tier": "ultra",
  "current_tier": "free"
}
```

## Database Schema

### subscription_features Table:
```sql
- feature_key: 'ai_chatbot', 'daily_hadith', etc.
- is_premium: true/false
- required_tier: 'free', 'premium', 'ultra'
```

### user_subscriptions Table:
```sql
- user_id: UUID
- tier_id: UUID (references subscription_tiers)
- status: 'active', 'cancelled', 'expired'
- billing_cycle: 'monthly', 'yearly'
```

## Benefits of This Approach

1. **Security**: API keys never exposed to clients
2. **Control**: Server-side enforcement of access rules
3. **Scalability**: Easy to add new AI features
4. **Monetization**: Clear premium feature differentiation
5. **Flexibility**: Can change AI providers without client updates
6. **Analytics**: Track AI usage server-side
7. **Cost Management**: Control AI API usage centrally

## Future Enhancements

1. **Usage Limits**: Track and limit AI requests per user
2. **Caching**: Cache common AI responses to reduce costs
3. **Multiple Providers**: Support different AI models
4. **Custom Training**: Fine-tune models for Islamic content
5. **Offline Mode**: Cached responses for offline access
6. **Analytics Dashboard**: Track AI feature usage and engagement

## Testing

To test AI features:
1. Ensure `GOOGLE_AI_API_KEY` is set in Supabase secrets
2. Create test users with different subscription tiers
3. Verify feature access based on tier
4. Check error handling for premium features
5. Test upgrade flow from free to premium

## Support

For issues with AI features:
- Check Supabase Edge Function logs
- Verify user subscription status
- Ensure API key is configured
- Review feature access in subscription_features table
