# AutoScore Hub

A growing collection of free, no-login decision tools for operators and senior leaders. Each tool takes minimal input (one sentence, a pasted doc, or a voice memo), uses AI to extract the rest, and returns a leadership-ready report.

## Current tools

| Tool | Path | Description |
|------|------|-------------|
| AutoScore (Automation Evaluator) | `/` | Should you automate that process? Verdict, ROI, payback, risks, roadmap in 60 seconds. |

## Architecture

- **Framework**: Next.js 16 with App Router (TypeScript)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **AI**: z-ai-web-dev-sdk (LLM extraction + ASR transcription, server-side only)
- **Charts**: Recharts
- **Animations**: Framer Motion

## Local development

```bash
bun install
cp .env.example .env  # fill in your values
bun run dev
```

Open http://localhost:3000.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Go to https://vercel.com/new and import the repo.
3. Add environment variables (see `.env.example`).
4. Deploy. Vercel auto-deploys on every push to `main`.

## Tweeting new tools

The `scripts/` folder contains two scripts for the "build → deploy → tweet" workflow:

### 1. Generate a tweet draft

```bash
node scripts/tweet-draft.mjs autoscore
```

This reads the tool's metadata from `tweets/tools/autoscore.json`, generates tweet copy using a few templates, and saves a draft markdown file to `tweets/drafts/`.

### 2. Approve and post

Edit the draft file to taste, then:

```bash
node scripts/tweet-post.mjs tweets/drafts/<filename>.md
```

This posts the tweet to X via OAuth 1.0a User Context, then moves the draft to `tweets/posted/` with the tweet ID appended.

## Adding a new tool

1. Create a new component in `src/components/<tool-name>/`.
2. Wire it into the routing in `src/app/page.tsx` (or add a new route).
3. Add tool metadata at `tweets/tools/<tool-name>.json` so tweet-draft can generate posts for it.
4. Build, push, Vercel auto-deploys, then run tweet-draft + tweet-post.

## Project structure

```
src/
  app/
    api/
      extract/route.ts        # LLM extraction endpoint (z-ai-web-dev-sdk)
      transcribe/route.ts     # ASR endpoint for voice memos
    page.tsx                  # Main orchestrator (state machine)
    layout.tsx                # Root layout + metadata
    globals.css               # Tailwind + print styles
  components/
    automation/               # AutoScore tool components
      landing.tsx
      quick-input.tsx         # AI-assisted input (Describe / Paste / Talk)
      confirm-extracted.tsx   # Editable AI extraction with confidence badges
      wizard.tsx              # Manual form fallback
      results.tsx             # Decision-ready report
    ui/                       # shadcn/ui components
  lib/
    automation.ts             # AutoScore scoring engine + content
    extraction-types.ts       # Shared types for AI extraction
    db.ts                     # Prisma client (if needed)
    utils.ts                  # shadcn utility helpers
scripts/
  tweet-draft.mjs             # Generate tweet draft from tool metadata
  tweet-post.mjs              # Post approved draft to X
  twitter-client.mjs          # Shared Twitter API helper
tweets/
  tools/                      # Per-tool metadata for tweet generation
  drafts/                     # Generated drafts awaiting approval (gitignored)
  posted/                     # Archive of posted tweets (gitignored)
```

## License

MIT — see LICENSE.
