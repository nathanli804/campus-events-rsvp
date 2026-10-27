// SERVER-ONLY: the single place where our app connects to Supabase.
//
// Data flow:  browser fetch() -> app/api/... route handler -> getSupabase() -> database
//
// The secret key used here can read and write every table, so three things
// keep it out of the browser:
//   1. `import "server-only"` makes the build fail if browser code imports this file.
//   2. The env variable names do NOT start with NEXT_PUBLIC_, so Next.js never
//      copies them into browser JavaScript.
//   3. Real values live in Vercel server environment variables, or git-ignored
//      .env.local for optional local development.
import "server-only";
import { createClient } from "@supabase/supabase-js";

// Thrown when server environment settings are missing or still have placeholders.
// Route handlers turn it into a helpful JSON error instead of crashing the app.
export class MissingConfigError extends Error {}

let client = null;

export function getSupabase() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey || url.includes("YOUR-PROJECT") || secretKey.includes("YOUR-")) {
    throw new MissingConfigError(
      "SUPABASE_URL and SUPABASE_SECRET_KEY are not set. Add them to the Vercel environment for this deployment and redeploy. For local development, fill in .env.local and restart `npm run dev`."
    );
  }

  // Created on first use, not at startup, so the app still starts without settings.
  client = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
