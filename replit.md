# Prompt Coach

## Overview
A React + Vite + TypeScript application with an Express backend that serves as a Prompt Engineering Coach for law students at Ohio State Moritz College of Law. Students practice advanced prompting across multiple AI platforms, and the coach evaluates their prompting technique.

## Project Architecture
- **Framework**: React 19 with Vite 6, TypeScript
- **Backend**: Express server (`server/index.ts`) handling AI API calls
- **Styling**: Tailwind CSS (via CDN)
- **AI Providers**: Supports Gemini, OpenAI (ChatGPT), and Anthropic (Claude)
- **Entry Point**: `index.tsx` → `App.tsx`
- **Components**: `components/` (WorkspacePanel, CoachPanel, PastePanel)
- **Services**: `services/aiService.ts` (calls backend API)
- **Types**: `types.ts`, `constants.ts`

## Configuration
- **Frontend Dev Server**: Vite on port 5000, host 0.0.0.0, allowedHosts: true, proxies /api to backend
- **Backend Dev Server**: Express on port 3001 (localhost)
- **Production**: Express serves built static files + API on port 5000
- **API Keys** (secrets):
  - `GEMINI_API_KEY` - Google Gemini API
  - `OPENAI_API_KEY` - OpenAI/ChatGPT API
  - `ANTHROPIC_API_KEY` - Anthropic/Claude API
- **Deployment**: Autoscale (build: `npm run build`, run: `NODE_ENV=production npx tsx server/index.ts`)

## API Routes
- `GET /api/providers` - Returns which AI providers have API keys configured
- `POST /api/chat` - Workspace chat (provider, modelTier, history, message)
- `POST /api/coach` - Coaching feedback (focusArea, platform, conversationText, etc.)

## Recent Changes
- 2026-02-11: Added multi-provider support (Gemini, OpenAI, Anthropic) with Express backend
- 2026-02-11: Initial Replit setup - configured port 5000, allowed hosts, Vite bundling
