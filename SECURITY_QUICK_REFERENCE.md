
# Security Quick Reference

## 🔐 API Key Security Status

| API Key | Location | Status | Exposed? |
|---------|----------|--------|----------|
| Google AI (Gemini) | Supabase Edge Function | ✅ Secure | ❌ No |
| RevenueCat iOS | `.env` file | ✅ Safe | ✅ Yes (Public Key) |
| RevenueCat Android | `.env` file | ✅ Safe | ✅ Yes (Public Key) |
| Supabase URL | Hardcoded | ✅ Safe | ✅ Yes (Public) |
| Supabase Anon Key | Hardcoded | ✅ Safe | ✅ Yes (Public Key) |

## 🎯 Quick Setup

### 1. Configure Google AI API Key (Backend)

```bash
# Go to Supabase Dashboard
# Navigate to: Edge Functions → ai-service → Settings
# Add environment variable:
GOOGLE_AI_API_KEY=your_actual_api_key_here
```

Get your key: https://aistudio.google.com/app/apikey

### 2. Configure RevenueCat Keys (Client)

```bash
# Edit .env file
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=your_ios_key
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=your_android_key
```

Get your keys: https://app.revenuecat.com/

## 🔍 How to Verify Security

### Check 1: Google AI Key Not in Client

```bash
# Search your codebase - should return NO results
grep -r "EXPO_PUBLIC_GOOGLE_AI_API_KEY" .

# This is correct - key should NOT be in client code
```

### Check 2: Edge Function Has Key

```bash
# Go to Supabase Dashboard
# Edge Functions → ai-service → Settings
# Verify GOOGLE_AI_API_KEY is listed
```

### Check 3: AI Features Work

```typescript
// In your app, test AI features
import { generateEnhancedQuranQuote } from '@/utils/geminiService';

const quote = await generateEnhancedQuranQuote('faith');
console.log(quote); // Should return enhanced quote
```

## 🚨 Security Checklist

- [x] Google AI API key removed from `.env`
- [x] Google AI API key set in Supabase Edge Function
- [x] RevenueCat keys in `.env` (these are safe to expose)
- [x] `.env` file in `.gitignore`
- [x] AI service calls backend API (not direct API calls)
- [x] Backend verifies user authentication
- [x] Backend checks subscription tier

## 📱 What's Safe to Expose

### ✅ These are PUBLIC keys (safe in client code):

1. **RevenueCat API Keys**
   - Purpose: Identify your app to RevenueCat SDK
   - Security: Purchases verified on RevenueCat servers
   - Similar to: App Store/Play Store app identifiers

2. **Supabase Anon Key**
   - Purpose: Identify your app to Supabase
   - Security: Row Level Security (RLS) protects data
   - Similar to: Firebase public config

3. **Supabase URL**
   - Purpose: API endpoint for your project
   - Security: Public endpoint, protected by RLS

### ❌ These are PRIVATE keys (must be in backend):

1. **Google AI API Key**
   - Purpose: Access Google's AI services
   - Security: Direct API access, usage charges
   - Location: Supabase Edge Function environment variable

2. **Supabase Service Role Key**
   - Purpose: Bypass RLS for admin operations
   - Security: Full database access
   - Location: Supabase Edge Function environment variable

## 🔄 Request Flow

### AI Feature Request

```
User Action
    ↓
geminiService.ts (Client)
    ↓
Supabase Edge Function (Backend)
    ├─ Verify Authentication ✓
    ├─ Check Subscription ✓
    └─ Call Google AI API (with secure key) ✓
    ↓
Return Result to Client
```

### Subscription Purchase

```
User Action
    ↓
RevenueCat SDK (Client with public key)
    ↓
App Store / Play Store
    ↓
RevenueCat Servers (Verification)
    ↓
Webhook to Supabase Edge Function
    ↓
Update Database
```

## 🐛 Common Issues

### Issue: AI features not working

**Solution:**
1. Check Edge Function has `GOOGLE_AI_API_KEY` set
2. Verify user is authenticated
3. Check user has required subscription tier
4. Review Edge Function logs

### Issue: RevenueCat not initializing

**Solution:**
1. Verify keys in `.env` are correct
2. Check platform is iOS or Android (not web)
3. Ensure RevenueCat products are configured
4. Check app bundle ID matches RevenueCat config

### Issue: "API key not configured" error

**Solution:**
1. Go to Supabase Dashboard
2. Edge Functions → ai-service → Settings
3. Add `GOOGLE_AI_API_KEY` environment variable
4. Redeploy Edge Function if needed

## 📚 Key Files

| File | Purpose | Contains Secrets? |
|------|---------|-------------------|
| `.env` | Local config | ✅ RevenueCat keys (safe) |
| `.env.example` | Template | ❌ No |
| `utils/geminiService.ts` | AI client | ❌ No |
| `utils/revenueCatService.ts` | Subscription client | ❌ No |
| `supabase/functions/ai-service/` | AI backend | ✅ Google AI key (secure) |

## 🎓 Remember

1. **Public keys** (RevenueCat, Supabase anon) are designed to be exposed
2. **Private keys** (Google AI) must stay in backend
3. **Authentication** protects your backend APIs
4. **Subscription checks** happen on backend, not client
5. **RLS policies** protect your database

---

**Need Help?** Check `API_SECURITY_GUIDE.md` for detailed information.
