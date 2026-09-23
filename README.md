# Prompt Coach

An interactive prompt engineering coach for law students at The Ohio State University Moritz College of Law. Students practice crafting effective prompts across multiple AI platforms and receive expert coaching feedback on their technique.

**Live:** https://rlfordon.github.io/prompt-coach/

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

## Architecture

The app is a static site hosted on GitHub Pages. A static page can't keep an API key secret, so all model calls go through a small shared Cloudflare Worker ([source](https://github.com/rlfordon/TokenExplorer/tree/main/worker)). The Worker holds one OpenRouter key and forwards requests to Gemini, OpenAI, and Claude models. It also:

- accepts requests only from `rlfordon.github.io` (and localhost for development)
- requires a class passkey when the Worker's `CLASS_PASSKEY` secret is set; the app asks for it once and remembers it in the browser
- allows only the models listed in its `CHAT_MODELS`, and caps prompt size and output length

Model IDs live in [`services/config.ts`](services/config.ts), along with `PROXY_URL`, the Worker's address. Keep `MODELS` in step with the Worker's `CHAT_MODELS`.

## Branches

- `main` - the GitHub Pages version (this one). Pushing to `main` builds and deploys the site through `.github/workflows/pages.yml`.
- `ai-studio` - the original Google AI Studio version, which calls Gemini directly from the browser.

## Development

**Prerequisites:** Node.js 20+

```
npm install
npm run dev
```

The dev server runs at `http://localhost:5173/prompt-coach/`. The Worker accepts requests from localhost, so development uses the same Worker as the live site.

## Tech Stack

- React 19 + TypeScript + Vite
- Cloudflare Worker + OpenRouter for model calls
- Tailwind CSS

## License

MIT License. See [LICENSE](LICENSE) for details.

## Author

Created by **Rebecca Fordon** for the 21st Century Lawyering course at OSU Moritz College of Law.
