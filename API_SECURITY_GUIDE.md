
# API Security Guide

## Overview

This guide explains how API keys are secured in this application to prevent exposure and unauthorized access.

## Security Architecture

### ✅ Secure: Backend API Keys

The following API keys are stored **securely in Supabase Edge Function environment variables** and are **never exposed** to the client:

#### Google AI API Key (Gemini)
- **Location**: Supabase Edge Function `ai-service` environment variable `GOOGLE_AI_API_KEY`
- **Access**: Only accessible by the backend Edge Function
- **Usage**: All AI features (quotes, chatbot, hadith, etc.) call the backend API
- **Client Code**: Uses `utils/geminiService.ts` which calls `/functions/v1/ai-service`

**How to configure:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Edge Functions** → **ai-service**
4. Add environment variable: `GOOGLE_AI_API_KEY`
5. Get your key from: https://aistudio.google.com/app/apikey

### ✅ Safe to Expose: Public API Keys

The following API keys are **public keys** and are safe to include in your `.env` file:

#### RevenueCat API Keys
- **Location**: `.env` file as `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` and `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`
- **Why it's safe**: These are public SDK keys that only identify your app
- **Security**: Actual subscription verification happens on RevenueCat's servers
- **Similar to**: Supabase anon key - identifies your app but doesn't grant privileged access

#### Supabase Anon Key
- **Location**: Hardcoded in `app/integrations/supabase/client.ts`
- **Why it's safe**: This is a public key designed to be exposed
- **Security**: Row Level Security (RLS) policies protect your data
- **Access Control**: Backend enforces permissions based on user authentication

## File Structure

### Environment Files

```
.env                          # Local environment variables (not committed to git)
.env.example                  # Template showing what variables are needed
```

### Backend Security

```
supabase/functions/ai-service/  # Edge Function handling AI requests
  ├── index.ts                  # Main function code
  └── Environment Variables:
      └── GOOGLE_AI_API_KEY     # Secure API key (set in Supabase Dashboard)
```

### Client Code

```
utils/geminiService.ts        # Client-side service that calls backend API
utils/revenueCatService.ts    # Client-side RevenueCat integration
```

## How It Works

### AI Features Flow

1. **User Action**: User requests an AI feature (e.g., enhanced quote)
2. **Client Call**: `geminiService.ts` calls backend API with user's auth token
3. **Backend Verification**: 
   - Edge Function verifies user authentication
   - Checks user's subscription tier
   - Validates feature access
4. **API Call**: Backend uses secure `GOOGLE_AI_API_KEY` to call Google AI
5. **Response**: Backend returns result to client

```
User → geminiService.ts → Supabase Edge Function → Google AI API
                              ↓
                    (Secure API Key stored here)
```

### Subscription Flow

1. **User Action**: User initiates purchase
2. **RevenueCat SDK**: Handles purchase with public API key
3. **Verification**: RevenueCat servers verify the purchase
4. **Webhook**: RevenueCat notifies your backend
5. **Database Update**: Backend updates user's subscription status

```
User → RevenueCat SDK → App Store/Play Store → RevenueCat Servers
                                                      ↓
                                            Supabase Edge Function
                                                      ↓
                                              Database Update
```

## Security Benefits

### ✅ What This Prevents

1. **API Key Extraction**: Keys cannot be extracted from app bundles
2. **Network Sniffing**: Keys are not transmitted in client requests
3. **Reverse Engineering**: Keys are not in client-side code
4. **Version Control Leaks**: Keys are not committed to git
5. **Unauthorized Usage**: Backend enforces subscription checks

### ✅ Additional Security Layers

1. **Authentication**: All AI requests require valid user session
2. **Authorization**: Backend checks subscription tier before processing
3. **Rate Limiting**: Supabase Edge Functions have built-in rate limiting
4. **Audit Trail**: All requests are logged for monitoring

## Configuration Checklist

### For Development

- [ ] Copy `.env.example` to `.env`
- [ ] Add RevenueCat API keys to `.env` (if testing subscriptions)
- [ ] Configure `GOOGLE_AI_API_KEY` in Supabase Edge Function
- [ ] Test AI features with authenticated user

### For Production

- [ ] Verify `GOOGLE_AI_API_KEY` is set in production Edge Function
- [ ] Confirm RevenueCat API keys are correct for production
- [ ] Test subscription flow end-to-end
- [ ] Monitor Edge Function logs for errors
- [ ] Set up alerts for API quota limits

## Troubleshooting

### AI Features Not Working

1. **Check Edge Function Environment Variable**
   ```
   Supabase Dashboard → Edge Functions → ai-service → Settings
   Verify GOOGLE_AI_API_KEY is set
   ```

2. **Check User Authentication**
   ```typescript
   const { data: { session } } = await supabase.auth.getSession();
   console.log('Session:', session); // Should not be null
   ```

3. **Check Subscription Status**
   ```typescript
   const { currentTier } = useSubscription();
   console.log('Current tier:', currentTier); // Should be 'premium' or higher
   ```

4. **Check Edge Function Logs**
   ```
   Supabase Dashboard → Edge Functions → ai-service → Logs
   Look for errors or authentication issues
   ```

### RevenueCat Not Working

1. **Check API Keys**
   - Verify keys in `.env` match your RevenueCat dashboard
   - Ensure you're using the correct keys for iOS/Android

2. **Check Platform**
   - RevenueCat only works on iOS and Android (not web)
   - Verify `Platform.OS === 'ios' || Platform.OS === 'android'`

3. **Check Product Configuration**
   - Verify products are set up in App Store Connect / Google Play Console
   - Ensure products are linked in RevenueCat dashboard

## Best Practices

### ✅ Do

- Store sensitive API keys in Supabase Edge Function environment variables
- Use public API keys (RevenueCat, Supabase anon) in client code
- Implement proper authentication and authorization
- Monitor API usage and set up alerts
- Use environment-specific configurations (dev/staging/prod)

### ❌ Don't

- Never commit `.env` file to version control
- Never hardcode sensitive API keys in client code
- Never expose backend API keys in client bundles
- Never skip authentication checks in backend
- Never trust client-side subscription status without verification

## Additional Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [RevenueCat Security Best Practices](https://www.revenuecat.com/docs/security)
- [Google AI API Documentation](https://ai.google.dev/docs)
- [React Native Security Guide](https://reactnative.dev/docs/security)

## Support

If you encounter issues with API security:

1. Check this guide first
2. Review Edge Function logs in Supabase Dashboard
3. Verify environment variables are set correctly
4. Test with a fresh user account
5. Check network requests in browser/app debugger

---

**Last Updated**: January 2025
**Version**: 1.0.0
