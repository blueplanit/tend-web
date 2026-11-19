<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Tend web

This repo holds the Tend landing page. Marketing rules, terms and the brand kit live in `../tend-marketing`. Read its `AGENTS.md`, `GOAL.md` and `GLOSSARY.md` before you change copy.

## Copy rules

These rules apply to all user-facing copy: page text, alt text, metadata and images.

- Write each term from `GLOSSARY.md` or a `CONTEXT.md` in lowercase: garden, weed, mood, check-in, extra payment. Capitalize a term only at the start of a sentence or a heading. Names keep their capital: Tend, Pippy.
- Ground each metaphor in its financial concept. Follow the metaphor with a short, plain sentence about the mechanics. Example: "Each weed regrows a little every night" comes with what interest is and how it adds up.
- Brand copy says "we". No promised outcomes. No financial advice. No shame or fear.
- Each product fact comes from the prototype. Check it against the current app before you push.
- All page copy lives in `lib/content.ts`.
