# 🚀 Quick Setup: Real AI Integration

## Step 1: Get OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

## Step 2: Configure the App
1. Open `backend/.env` file
2. Replace `your_openai_api_key_here` with your actual API key:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```
3. Save the file

## Step 3: Restart Backend
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

## Step 4: Test AI Features
- Visit http://localhost:3000
- Submit a campaign for analysis
- You'll now get real AI-powered suggestions from GPT!

## Fallback Mode
- If no API key is configured, the app automatically falls back to enhanced hardcoded suggestions
- The app works either way - perfect for demos without API costs!

## Vercel Deployment
Add your OpenAI API key as an environment variable in Vercel dashboard:
- Key: `OPENAI_API_KEY`
- Value: `sk-your-actual-key-here`