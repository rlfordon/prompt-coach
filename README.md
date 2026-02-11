# Prompt Coach

An interactive prompt engineering coach for law students at The Ohio State University Moritz College of Law. Students practice crafting effective prompts across multiple AI platforms and receive expert coaching feedback on their technique.

## Features

- **Multi-Provider Workspace** - Chat with Gemini, ChatGPT, or Claude directly in the app
- **Model Selection** - Choose between fast and reasoning-tier models for each provider
- **Coaching Feedback** - Get detailed analysis of your prompting technique across multiple focus areas
- **Paste Mode** - Paste conversations from external tools (Westlaw, Lexis, NotebookLM, etc.) for review
- **Session Export** - Download your conversation and coaching feedback as a text file

## Focus Areas

The coach can evaluate prompts across several dimensions:
- Overall prompt quality
- Prompt structure and clarity
- Context and specificity
- Iterative refinement technique
- Platform-specific best practices
- Custom questions

## Setup

**Prerequisites:** Node.js 20+

1. Install dependencies:
   ```
   npm install
   ```

2. Set API keys as environment variables (at least one required):
   - `GEMINI_API_KEY` - Google Gemini
   - `OPENAI_API_KEY` - OpenAI / ChatGPT
   - `ANTHROPIC_API_KEY` - Anthropic / Claude

3. Run the app:
   ```
   npm run dev
   ```

The app will be available at `http://localhost:5000`.

## Tech Stack

- React 19 + TypeScript + Vite
- Express backend for secure API calls
- Tailwind CSS

## License

MIT License. See [LICENSE](LICENSE) for details.

## Author

Created by **Rebecca Fordon** for the 21st Century Lawyering course at OSU Moritz College of Law.
