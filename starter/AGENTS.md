<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Rules for this teaching project

This is a classroom app for tracing browser → API route → database. Keep every change small and visible.

- Make only the change you were asked for, in the files you were asked to change. No refactoring, new packages, TypeScript, or unrelated features.
- Browser code (`components/`, `"use client"`) calls our API with `fetch()` and an explicit `method`. It never imports Supabase or anything from `lib/`.
- Only server code (`app/api/**/route.js`, `lib/`) talks to Supabase, through `getSupabase()` in `lib/supabase-server.js`.
- Do not use Server Actions. Do not add `NEXT_PUBLIC_` variables or hard-code keys.
- Follow the response shapes in `lib/api-response.js` and the contract in `../docs/api-reference.md`.
- Never return or log RSVP names or emails. Never send raw database errors to the browser.
- Deployment workflow: browser -> Next.js API route on Vercel -> Supabase. Keep secrets in server-side Vercel environment variables. Local setup is optional.
- Group changes at the checkpoints in ../docs/deployment-guide.md; inspect, commit/push to GitHub, wait for Vercel Ready for the intended commit, then test the deployed URL.
- After a change, explain which code runs in the browser and which runs on the server.
