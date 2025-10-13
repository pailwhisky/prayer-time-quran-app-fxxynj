
# Gemini AI Integration Guide

This app uses **Google's Gemini AI** to provide enhanced Islamic content and personalized spiritual guidance. This guide will help you set up and use the AI features.

## 🌟 Features Powered by Gemini AI

### 1. **Enhanced Quran Quotes**
- AI-generated historical context for verses
- Modern-day reflections and applications
- Deeper understanding of Quranic wisdom

### 2. **Islamic Q&A Chatbot**
- Ask any question about Islam
- Get knowledgeable answers with references
- Authentic sources (Quran and Hadith)

### 3. **Daily Hadith**
- Authentic Hadith with AI-generated explanations
- Practical applications for modern life
- Daily spiritual inspiration

### 4. **Spiritual Guidance**
- Personalized duas based on your needs
- Prayer reflections for each Salah
- Compassionate Islamic advice

### 5. **Additional Features**
- Islamic quiz generation
- Ramadan-specific content
- Recitation analysis (coming soon)

## 🔧 Setup Instructions

### Step 1: Get Your Free API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated API key

**Note:** The API is free to use with generous quotas. No credit card required!

### Step 2: Add API Key to Your Project

1. Open the `.env` file in the root directory of the project
2. Find the line: `EXPO_PUBLIC_GOOGLE_AI_API_KEY=`
3. Paste your API key after the equals sign:
   ```
   EXPO_PUBLIC_GOOGLE_AI_API_KEY=AIzaSyC...your_key_here
   ```
4. Save the file

**Important:** Never commit your `.env` file to version control!

### Step 3: Restart the App

Close and restart the app for the changes to take effect.

### Step 4: Test the Connection

1. Open the app
2. Go to **Profile & Settings** tab
3. Tap on **"Gemini AI Setup"**
4. Tap **"Test API Connection"**
5. You should see a success message ✅

## 📱 Using AI Features

### Enhanced Quran Quotes

1. Go to the **Prayer Times** screen
2. You'll see a Quran quote displayed
3. Tap **"Get AI Insights"** to see enhanced context and reflections

### Islamic Chatbot

1. Go to **Profile & Settings**
2. Tap **"Islamic AI Assistant"**
3. Ask any question about Islam
4. Get detailed answers with references

### Daily Hadith

1. Go to **Profile & Settings**
2. Tap **"Daily Hadith"**
3. Read today's Hadith with AI-generated explanation
4. Share with friends and family

## 🔒 Privacy & Security

- Your API key is stored locally on your device
- API calls are made directly from your device to Google's servers
- No data is stored or logged by this app
- All AI responses are generated in real-time

## 💡 Tips for Best Results

1. **Be Specific**: Ask clear, specific questions for better answers
2. **Verify Important Matters**: Always consult qualified scholars for important religious rulings
3. **Use Regularly**: The more you use the features, the more you'll benefit
4. **Share Knowledge**: Share helpful responses with your community

## ⚠️ Troubleshooting

### "AI service is currently unavailable"

**Solution:**
- Check that your API key is correctly added to `.env`
- Ensure you've restarted the app after adding the key
- Verify your internet connection

### "Connection Failed"

**Possible causes:**
- Invalid or expired API key
- No internet connection
- API quota exceeded (rare with free tier)

**Solution:**
- Generate a new API key from Google AI Studio
- Check your internet connection
- Wait a few minutes and try again

### Features Not Working

**Solution:**
1. Go to **Profile & Settings** → **Gemini AI Setup**
2. Tap **"Test API Connection"**
3. Follow the on-screen instructions

## 📊 API Usage & Limits

The free tier of Google's Gemini API includes:
- **60 requests per minute**
- **1,500 requests per day**
- **1 million tokens per month**

This is more than enough for typical daily use of the app!

## 🔄 Updating Your API Key

If you need to change your API key:

1. Open the `.env` file
2. Replace the old key with the new one
3. Save the file
4. Restart the app

## 📚 Additional Resources

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/tutorials/setup)
- [API Pricing](https://ai.google.dev/pricing)

## 🤝 Support

If you encounter any issues:

1. Check this guide first
2. Use the **"Test API Connection"** feature
3. Verify your `.env` file configuration
4. Ensure you're using the latest version of the app

## ⚖️ Disclaimer

While Gemini AI provides helpful Islamic content, it should not replace:
- Consultation with qualified Islamic scholars
- Personal study of authentic Islamic sources
- Guidance from local religious authorities

Always verify important religious matters with knowledgeable scholars.

---

**May Allah accept your efforts in seeking knowledge and growing spiritually. Ameen.** 🤲
