# Prompt Coach

## Overview
A React + Vite + TypeScript frontend application that serves as a Prompt Engineering Coach for law students at Ohio State Moritz College of Law. Students practice advanced prompting across multiple AI platforms, and the coach evaluates their prompting technique.

## Project Architecture
- **Framework**: React 19 with Vite 6, TypeScript
- **Styling**: Tailwind CSS (via CDN)
- **AI Integration**: Google Gemini API (`@google/genai`) - runs client-side
- **Entry Point**: `index.tsx` → `App.tsx`
- **Components**: `components/` (WorkspacePanel, CoachPanel, PastePanel)
- **Services**: `services/geminiService.ts` (Gemini API calls)
- **Types**: `types.ts`, `constants.ts`

## Configuration
- **Dev Server**: Vite on port 5000, host 0.0.0.0, allowedHosts: true
- **API Key**: Requires `GEMINI_API_KEY` secret (injected via Vite's `define` as `process.env.API_KEY`)
- **Deployment**: Static site (built with `npm run build`, served from `dist/`)

## Recent Changes
- 2026-02-11: Initial Replit setup - configured port 5000, allowed hosts, added Vite entry script to index.html, removed importmap (using Vite bundling instead)
