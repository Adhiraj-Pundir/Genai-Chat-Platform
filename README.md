# Genai-Chat-Platform

A full-stack Generative AI powered real-time chat platform. Real-time messaging via GetStream.io, AI responses via Claude (Anthropic), web search via Tavily, persistent memory via Firebase Firestore, and sentiment analysis via TextBlob.

## Services

| Service | Port | Description |
|---|---|---|
| React frontend | 8080 | Chat UI |
| Node.js backend | 3000 | API + GetStream orchestration |
| Python AI service | 5000 | Claude, LangChain, Tavily, Firestore |

## Quick Start (Docker)

```bash
# 1. Copy and fill in all .env files
cp react_frontend/.env.example react_frontend/.env
cp nodejs_backend/.env.example nodejs_backend/.env
cp python_ai_service/.env.example python_ai_service/.env

# 2. Add your Firebase service account JSON
cp /path/to/your/firebase-service-account.json ./firebase-service-account.json

# 3. Start everything
docker-compose up --build
```

Open http://localhost:8080

## Required API Keys

- **GetStream.io** — getstream.io (free tier, 25 users)
- **Anthropic** — console.anthropic.com (pay per use)
- **Tavily** — tavily.com (free: 1000 searches/month)
- **Firebase** — console.firebase.google.com (free tier)

## Local Development

### Python AI Service
```bash
cd python_ai_service
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python -m textblob.download_corpora
cp .env.example .env  # fill in your keys
python app.py
```

### Node.js Backend
```bash
cd nodejs_backend
npm install
cp .env.example .env  # fill in your keys
npm run dev
```

### React Frontend
```bash
cd react_frontend
npm install
cp .env.example .env  # fill in your keys
npm run dev
```

## Architecture

```
User → React (8080) → Node.js (3000) → Python Flask (5000)
                    ↕                         ↕
               GetStream.io              Anthropic Claude
                                         Tavily Search
                                         Firebase Firestore
```

## AI Features

- **Real-time AI responses** — Claude haiku answers in every channel
- **Web search** — LangChain agent decides when to search Tavily automatically
- **Persistent memory** — Last 20 messages per user/channel stored in Firestore
- **Sentiment analysis** — Every message gets a sentiment emoji (😊 😐 😟)
- **Chat summarization** — facebook/bart-large-cnn condenses full conversations
