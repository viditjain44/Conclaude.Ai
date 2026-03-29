# Conclaude.Ai

A conversation analysis system that connects to MongoDB, reads chat data from multiple brands, and surfaces actionable insights using AI.

## What it does

The assistant handles thousands of conversations across different brands. Most of these conversations go unread. This system automatically reads them, finds patterns, and tells you what's going wrong and what's working.

It can tell you things like:
- Which brand's assistant is struggling the most
- Where users are getting frustrated and dropping off
- Whether the assistant is giving wrong or repetitive responses
- Which types of questions the assistant handles poorly

## Tech Stack

- **MongoDB** — stores conversations and messages
- **Express.js** — backend API
- **React + Vite** — frontend dashboard
- **Groq AI (LLaMA 3.3)** — generates insights from conversation data
- **Recharts** — charts and visualizations

## Project Structure
```
CONCLAUDE.AI/
├── server/                  # Express backend
│   ├── src/
│   │   ├── index.js         # Entry point
│   │   ├── db.js            # MongoDB connection
│   │   ├── routes/          # API routes
│   │   └── services/        # Business logic + AI
│   └── .env
│
└── client/                  # React frontend
    └── src/
        ├── pages/           # Home, BrandView, ConversationView
        ├── components/      # Reusable UI components
        └── services/        # API calls
```

## Setup

### Prerequisites
- Node.js
- MongoDB running locally
- Groq API key (free at console.groq.com)

### 1. Import the data
```bash
mongoimport --db helio_intern --collection conversations --file conversations.json --jsonArray
mongoimport --db helio_intern --collection messages --file messages.json --jsonArray
```

### 2. Setup the server
```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/helio_intern
GROQ_API_KEY=your_groq_api_key_here
```

Start the server:
```bash
npm run start
```

### 3. Setup the client
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## How it works

**Home page** shows all brands auto-discovered from the database. No configuration needed — if a new brand is added to the database, it shows up automatically.

**Brand page** shows stats and charts for that brand — how many conversations were resolved, how many users got frustrated, product engagement, and a full list of conversations with status tags.

**Conversation page** shows the full chat transcript alongside an AI-generated analysis. The AI looks at the conversation and tells you what went wrong, how the assistant performed, and what it should have done differently.

## API Endpoints
```
GET /api/brands                        → all brands with stats
GET /api/brands/:widgetId/stats        → stats for one brand
GET /api/brands/:widgetId/insights     → AI insights for one brand
GET /api/conversations/:widgetId       → all conversations for a brand
GET /api/conversations/detail/:id      → single conversation with messages
GET /api/insights/:conversationId      → AI analysis for one conversation
```

## A few things I noticed in the data

**Agent response loops** — In several conversations, the assistant gives the exact same response twice when it doesn't know how to handle a follow-up. Users drop off immediately after this.

**Raw data leaking** — Some agent responses contain raw JSON from the backend (Shopify product metadata, internal IDs, CDN URLs). This is a bug in the assistant's response formatting that this system detects and cleans up before displaying.

**Order tracking gap** — "Where is my order?" is one of the most common questions and the assistant consistently fails to resolve it. It asks for an order number and phone number but never actually tracks anything.

**Language handling** — Some users write in regional languages (Marathi, Hindi). The assistant responds in English regardless, which may explain some drop-offs.

**Short conversations** — A significant number of conversations are only 2 messages long (one user message, one agent reply). This suggests users aren't satisfied with the first response and just leave.