# Troubleshooting

Start by finding **where** the problem shows up. See [Where errors show up](#where-errors-show-up-three-different-places).

## Quick table

| You see | Likely cause | Go to |
|---|---|---|
| `npm: command not found`, or install errors mentioning `engine` | Node missing or too old | [Node and npm](#node-and-npm) |
| `CONFIG_MISSING` (status 500) | Vercel variables missing, wrong scope, or redeploy needed | [Missing environment variables](#missing-environment-variables) |
| `NOT_IMPLEMENTED` (status 501) | Starter route not finished yet | [501](#501-not_implemented-starter-only) |
| `SERVER_ERROR` (status 500) | Database unreachable, wrong key, or a code bug | [500](#500-server_error) |
| "No events yet" | Seed not run, or wrong project | [Empty event list](#empty-event-list) |
| 400 / 404 / 409 | The API working as designed | [Status codes](#400-404-409-expected-errors) |

---

## Node and npm

- Run `node -v`. You need **v22 or newer**. Install the LTS version from https://nodejs.org, then **open a new terminal**.
- Run commands **inside** `starter/`, where `package.json` lives. Running `npm install` in the top folder does nothing useful.
- `npm install` fails partway: delete the `node_modules` folder, then run `npm install` again. Don't delete `package-lock.json`, because it pins the tested versions.
- `Port 3000 is in use`: another dev server is running. Stop it with Ctrl+C in its terminal, or run `npm run dev -- --port 3001`.
- Windows PowerShell says "running scripts is disabled": run `npm.cmd run dev`, or use Command Prompt or Git Bash.
- Corporate or campus proxy blocking npm: try a different network, or ask your instructor for the fallback demo.

## Missing environment variables

Symptom: the API returns:

```json
{ "error": { "code": "CONFIG_MISSING", "message": "The server is missing its database settings..." } }
```

Vercel runtime logs also record that `SUPABASE_URL` and `SUPABASE_SECRET_KEY` are not set.

Check the deployed setup first:

1. In Vercel → project → **Settings → Environment Variables**, verify the exact names `SUPABASE_URL` and `SUPABASE_SECRET_KEY`. Both must have real values from the same teaching project. Do not use a `NEXT_PUBLIC_` prefix or the publishable/anon key.
2. Verify they apply to **Production**, or **Preview** for the branch deployment you are testing. Development scope alone is insufficient.
3. If you connected the Supabase integration, verify it supplied these names; add them explicitly if needed. The integration does not implement routes or frontend calls.
4. Save and **redeploy**. Wait for Ready, confirm the intended commit, and test the current project URL. Existing deployments retain their original settings.
5. Use `/api/events/1` as the connection check: this route is provided. `/api/events` and `/api/rsvps` return `501` until implemented.

### Optional local environment checks

For local work only, copy `.env.example` to `.env.local` next to the app's `package.json` (`starter/`), replace placeholders, and restart `npm run dev`. Check that the filename is not `.env.local.txt`. Local values are not uploaded to Vercel.

## Vercel deployment missing or showing old code

- Build cannot find `package.json`: set **Root Directory = `starter`**.
- Build fails: inspect Vercel **build logs** for the failing file and check the Node.js version meets `>=22` in `package.json`.
- Changes are missing: confirm the AI tool committed and pushed to the connected repository and Vercel's production branch. Wait for Ready for that commit. A branch push may create a Preview deployment instead of updating Production.
- Old sample data or `501` persists: open the current project URL; a previous deployment's unique URL retains old code. Confirm the corresponding student change was actually deployed.
- Deployment is still building: use the checkpoint waits for code inspection and request predictions. A push triggers a build; browser refresh does not accelerate it.
- A REST client gets a login page instead of JSON: check Vercel deployment protection and sign in to the app in a browser you can access. Use that browser's DevTools console for the relative `fetch()` tests, or ask the instructor for the hosted fallback.


## Supabase connection or project problems

Symptom: `SERVER_ERROR` (500), and Vercel runtime logs (or the local terminal) show something like `TypeError: fetch failed`, `Invalid API key`, or `permission denied for table events`.

| Server log message | Fix |
|---|---|
| `fetch failed`, `ENOTFOUND` | Check that `SUPABASE_URL` is your project URL (`https://<ref>.supabase.co`). Check your internet connection. |
| `Invalid API key`, `JWT`, or `401` | You pasted the wrong key. Use a **secret** key (`sb_secret_...`) or the legacy **service_role** key, not the publishable/anon key. Redeploy afterwards (restart only for local work). |
| `permission denied for table ...` (`42501`) | You're using the publishable/anon key (blocked on purpose), or `schema.sql` didn't finish. Re-run `schema.sql` and check the key. |
| `relation "events" does not exist` / `PGRST205` | `schema.sql` hasn't been run in **this** project. |
| The dashboard says the project is **paused** | Free projects pause after inactivity. Choose **Restore** in the dashboard and wait a few minutes. |
| The dashboard shows a Supabase incident | Check https://status.supabase.com and use the instructor's fallback demo. |

## Empty event list

The list says "No events yet" and `/api/events` returns `{"data": []}` with status **200**. That isn't an error: the API correctly reports an empty table.

- Run `database/seed.sql` in the Supabase SQL Editor.
- Make sure Vercel server variables point at the **same project** where you ran the seed.
- Check **Table Editor → events** for four rows.

If you see sample events labelled `[Sample]`, you're still in starter sample mode. STUDENT CHANGE 1 in `components/EventsApp.js` hasn't been done yet.

If the events show dates that have already passed, run `seed.sql` again. It recalculates the dates from today.

---

## Status codes

### 400, 404, 409 (expected errors)

These mean the API is **working correctly** and rejecting a bad request. Read `error.code` and `error.message` in the response.

| Status | Code | Meaning | Fix |
|---|---|---|---|
| 400 | `INVALID_JSON` | Body isn't valid JSON | Check the braces, quotes, and commas. Send the header `Content-Type: application/json`. |
| 400 | `VALIDATION_ERROR` | A field is missing or wrong | The message names the field. `eventId` must be a number (`1`, not `"1"`). |
| 400 | `INVALID_EVENT_ID` | URL id isn't a positive whole number | Use `/api/events/1`, not `/api/events/abc`. |
| 404 | `EVENT_NOT_FOUND` | No event with that id | Run `seed.sql`; event IDs are 1–4. |
| 409 | `DUPLICATE_RSVP` | Email already RSVPed for that event | Expected on a repeat. Use a different fictional email or event. Case and spaces don't make an email "different". |

### 500 `SERVER_ERROR`

Something unexpected happened on the server. The browser intentionally gets **only a generic message**. The details are in the **Vercel runtime logs** (or the terminal running `npm run dev` for optional local work), on a line like:

```
[GET /api/events] Unexpected error: 42501 permission denied for table events
```

Use that line together with the [Supabase table](#supabase-connection-or-project-problems) above. If the server logs show a JavaScript error in **your** route file instead (for example, `ReferenceError`), the generated code has a bug. Compare it with the provided `app/api/events/[id]/route.js` example and the API contract, or ask your instructor for help.

### 500 `CONFIG_MISSING`

See [Missing environment variables](#missing-environment-variables).

### 501 `NOT_IMPLEMENTED` (starter only)

The route still has its starter placeholder. Finish the TODOs in the file named in the message (`app/api/events/route.js` or `app/api/rsvps/route.js`), or ask your instructor for a hint or stage-specific recovery file (see the [recovery path](ai-prompts.md#recovery-path-when-ai-output-differs-or-you-get-stuck)).

---

## Where errors show up: three different places

| Place | What it shows | How to open it |
|---|---|---|
| **Browser Console** | Errors in **browser** code (`components/`), plus browser notices like `Failed to load resource: 409` | F12 → **Console** |
| **HTTP response** | What the **API** decided: status code plus JSON `{ "error": ... }` | F12 → **Network** → click the request → **Response** |
| **Server logs** | Errors in **server** code (`app/api/`, `lib/`) and the details behind a 500 | Vercel project runtime logs; for local work, the terminal running `npm run dev` |

Things to know:

- `Failed to load resource: the server responded with a status of 409` in the Console is **not** a crash. The browser is noting that an HTTP request got an error status. Check the response JSON.
- A `console.log` in a route handler prints in **Vercel runtime logs** (or the local terminal), not the browser Console. A `console.log` in `components/` prints in the **browser** Console.
- If the page itself is blank or shows a red Next.js error overlay, the problem is in browser code or a build error. Read the browser error and Vercel build/runtime logs (or the local terminal).

## Finding a request in DevTools

1. Open the app and press **F12** (Mac: **Cmd+Option+I**).
2. Choose the **Network** tab. Click the **Fetch/XHR** filter to hide images and scripts.
3. **Reload** the page, or perform the action (select an event, submit the form). DevTools only records while it's open.
4. Click a request name (`events`, `1`, or `rsvps`):
   - **Headers:** Request URL, Request Method, Status Code
   - **Payload:** the JSON body you sent (POST only)
   - **Response** or **Preview:** the JSON the API returned
5. Tick **Preserve log** if requests disappear when the page reloads.

You won't see any Supabase requests in the browser. That's the point: the **server** talks to Supabase, and the browser only talks to `/api/...`.

The **Request Inspector** panel in the app is a teaching aid built from the same information. It deliberately leaves out headers and request bodies. DevTools shows the actual request.
