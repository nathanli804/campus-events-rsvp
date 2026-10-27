# AI prompts for each coding stage

Each prompt below asks for **one bounded change**, names the files, states the contract, and asks the AI to keep the architecture. Copy a prompt into your AI coding tool (Claude Code, Copilot Chat, Cursor, and so on) while the **`starter/`** folder is open.

Use your existing AI coding tool with your own GitHub repository. Keep **Browser → Next.js API route on Vercel → Supabase database**. Connecting Vercel to Supabase supplies configuration only; these prompts finish the routes and frontend. Keep secrets in Vercel server-side variables, never in prompts.

Deploy at checkpoints: **Stage 2a**, then **Stage 2b**, then **Stages 3a–3c together**. Inspect each bounded change before grouping it into a push. See [deployment-guide.md](../README.md).

## The rhythm for every stage

**Predict → generate → inspect → test → explain**

1. **Predict.** Before you send the prompt, answer the "pause and ask" questions below in one line each.
2. **Generate.** Send the prompt. Accept changes **only** in the files the prompt names.
3. **Inspect.** Read the diff. Compare it with your prediction and with the finished example (`app/api/events/[id]/route.js`).
4. **Deploy and test.** At the checkpoints below, commit and push to GitHub, wait for Vercel Ready for that commit, and test the deployed endpoint (browser, `.http` file, or console). Inspect the status code and JSON.
5. **Explain.** Say out loud which part ran in the browser, which ran on the server, and what the database did.

### Pause and ask, before you run generated code

- Which endpoint will receive this?
- What method does it use?
- What data will cross the network?
- What code checks the input?
- What happens if the database operation fails?

### Red flags in AI output (reject or ask for a fix)

- It imports `@supabase/supabase-js` or `lib/supabase-server.js` in a file under `components/`.
- It adds a `NEXT_PUBLIC_` variable, hard-codes a key, or prints a key.
- It uses a Server Action (`"use server"`) instead of `fetch()` to our API route.
- It changes files the prompt did not name, installs packages, adds TypeScript, or "refactors" things.
- It returns or `console.log`s RSVP names or emails.
- It returns raw database error messages to the browser.

If the output is wrong, either ask the AI to fix only that issue, or use the recovery path at the bottom of this page.

---

## Stage 1: Understand the schema (no code changes)

```text
Do not change any files. Read ../database/schema.sql (the shared database folder beside starter/).
Explain in plain language, in under 200 words:
1. The primary key of each table.
2. The foreign key and what it prevents.
3. The unique constraint on rsvps and what it prevents.
4. Why RLS is enabled with no policies, given that our app only connects
   from the Next.js server with a secret key.
Point to the exact lines you are describing.
```

---

## Stage 2a: Implement `GET /api/events`

```text
Make ONE change in this Next.js App Router project (plain JavaScript):
implement GET /api/events in app/api/events/route.js by following the
numbered TODO comments in that file.

Contract:
- 200 with { "data": [ ...events ] }, ordered by starts_at ascending.
- Each event has only: id, title, description, location, startsAt.
- An empty table returns 200 { "data": [] }.
- Any database error returns serverErrorResponse("GET /api/events", error).

Rules:
- Use the existing helpers: getSupabase() from lib/supabase-server.js,
  PUBLIC_EVENT_COLUMNS and toPublicEvent() from lib/events.js,
  dataResponse() and serverErrorResponse() from lib/api-response.js.
- Follow the same style as the finished example app/api/events/[id]/route.js.
- Change only app/api/events/route.js. Do not install packages, add
  TypeScript, use Server Actions, or refactor other files.

After the change, explain in 3–5 sentences which code runs on the server,
what the browser will receive, and what happens if the database fails.
```

**Checkpoint 2:** commit/push Stage 2a, wait for Ready, then open `<your-vercel-url>/api/events`. Expect `{"data":[...]}` with four events. The page itself still shows sample data until Stage 2b.

---

## Stage 2b: Connect the event list to the API

```text
Make ONE change: in components/EventsApp.js, replace the code inside the
block marked "STUDENT CHANGE 1" so the event list comes from our API
instead of sample data.

Requirements:
- Use fetch("/api/events", { method: "GET" }) with the method written out.
- Read the JSON body and call logRequest("GET", "/api/events", response.status, body).
- If response.ok: setEvents(body.data) and setListState({ status: "ready", message: "" }).
- If not ok: setListState({ status: "error", message: body.error?.message }).
- If fetch throws: set an error state saying the API could not be reached.
- Remove the SAMPLE_EVENTS import, which is no longer used.

Rules:
- This file runs in the BROWSER. Do not import Supabase or anything from lib/.
- Change only the STUDENT CHANGE 1 block and that one import line.
- Do not touch STUDENT CHANGE 2, the EXTENSION block, or any other file.

After the change, explain which lines run in the browser, which endpoint
they call, and what I should see in DevTools → Network.
```

**Checkpoint 3:** commit/push Stage 2b, wait for Ready, then reload your deployed page. Events no longer start with `[Sample]`. In DevTools → Network → Fetch/XHR, click `events` and look at the method, URL, status, and response.

---

## Extension (if time allows): Load details with `GET /api/events/[id]`

```text
Make ONE change: in components/EventsApp.js, replace the code inside the
block marked "EXTENSION" so selecting an event calls our existing endpoint
GET /api/events/[id].

Requirements:
- Make selectEvent async. Set details to { status: "loading", event: null, message: "" } first.
- Call fetch(`/api/events/${id}`, { method: "GET" }) and logRequest(...).
- On success: setDetails({ status: "ready", event: body.data, message: "" }).
- On a non-ok status or a thrown error: setDetails({ status: "error", event: null, message }).

Rules:
- Do not change app/api/events/[id]/route.js (it is already complete).
- Change only the EXTENSION block. Browser code only; no Supabase imports.

Explain what status codes this endpoint can return and why.
```

---

## Stage 3a: Implement `POST /api/rsvps`

```text
Make ONE change: implement POST /api/rsvps in app/api/rsvps/route.js by
following the numbered TODO comments (TODO 1 to TODO 7) in that file.

Contract (also in docs/api-reference.md):
- Request JSON: { "eventId": 1, "name": "Alex Example", "email": "alex@example.com" }
- 400 INVALID_JSON if the body is not valid JSON.
- 400 VALIDATION_ERROR if the body is not an object, eventId is not a positive
  integer number (use isValidEventId), name or email is missing or blank,
  name > 100 chars, email > 254 chars, or email fails a basic pattern.
- Trim name. Trim and lowercase email before saving.
- 404 EVENT_NOT_FOUND if no event has that id.
- Insert into rsvps (event_id, name, email); select back only "id, event_id".
- 409 DUPLICATE_RSVP for Postgres error code 23505; 404 for 23503.
- 201 via createdResponse({ id, eventId }, "RSVP saved. See you there!").
- Anything unexpected: serverErrorResponse("POST /api/rsvps", error).
- Never return or console.log the name or email.

Rules:
- Use the existing helpers in lib/. Keep validation inside this route file.
- Change only app/api/rsvps/route.js. No new packages, no validation library,
  no TypeScript, no Server Actions, no changes to other files.

After the change, list each check the server performs in order, and explain
why these checks must run on the server even though the form has
"required" and type="email".
```

**Inspect before connecting the form:** check the handler against the contract, then complete Stages 3b and 3c for one grouped deployment. After checkpoint 4, test requests 5, 7, and 10 in `requests/campus-events.http` with your deployed base URL, or use the console snippet in `docs/api-reference.md` on your deployed app. Expect 201, 400, and 404. You may test Stage 3a locally first if your optional local setup is ready.

---

## Stage 3b: Connect the RSVP form to the API

```text
Make ONE change: in components/EventsApp.js, replace the code inside the
block marked "STUDENT CHANGE 2" so submitRsvp sends the RSVP to our API.

Requirements:
- Use fetch("/api/rsvps", { method: "POST",
  headers: { "Content-Type": "application/json" }, body: JSON.stringify(rsvp) }).
- Read the JSON body and call logRequest("POST", "/api/rsvps", response.status, body).
- If response.ok: return { kind: "success", message: body.message }.
- If not ok: return { kind: "error", message: body.error?.message }.
- If fetch throws: return { kind: "error", message: "Could not reach the API..." }.
- Do not console.log the rsvp object (it contains a name and email).

Rules:
- Browser code only: no Supabase imports, no Server Actions.
- Change only the STUDENT CHANGE 2 block.

Explain what data crosses the network, which file receives it, and where
the success or error message I see comes from.
```

## Stage 3c (cleanup)

```text
In components/EventsApp.js, remove only the three items marked
"STUDENT CHANGE 3": the sample-mode banner paragraph, the starterNotice prop
on <RsvpForm>, and the emptyMessage prop on <RequestInspector>. Change
nothing else.
```

**Checkpoint 4:** commit/push Stages 3a–3c together and wait for Ready, then submit fictional data on your deployed app. You should see `POST /api/rsvps → 201` in the Inspector and in DevTools, and the new row in Supabase **Table Editor → rsvps**. Submit the same email again and you should get 409.

---

## Stage 4: Explain a request journey (no code changes)

```text
Do not change any files. Trace what happens when a user submits the RSVP
form in this app, from the click to the message on screen. For each step,
name the file and function, and say whether it runs in the browser, on the
Next.js server, or in the database. Include what happens on a duplicate
RSVP. Keep it under 12 short steps.
```

Use the AI's answer as a **draft to check**. Verify each step against the code and the requests in DevTools, then explain the flow in your own words. No submission is required.

---

## Recovery path: when AI output differs or you get stuck

The completed reference is held by your instructor. You do not need access to it to finish this activity.

1. Read the failing response and identify the stage and file responsible.
2. Compare your route with the provided worked example `app/api/events/[id]/route.js` and the contract in [api-reference.md](api-reference.md).
3. Ask your AI coding tool for a bounded repair using the prompt below. If still stuck, ask your instructor for a hint or stage-specific recovery file, or pair with a classmate.
4. Inspect any recovery change, commit/push it, wait for Vercel Ready, then test again. Read the changed file and answer the five pause-and-ask questions.

```text
Review my app/api/events/route.js against the contract in ../docs/api-reference.md
and the worked example app/api/events/[id]/route.js.
Identify the smallest fix for the failing status code or response shape.
Change only app/api/events/route.js. Preserve getSupabase(), the existing
response helpers, and the browser -> Next.js API route -> Supabase architecture.
Do not add packages, Server Actions, browser database calls, or secrets.
Explain the fix and what I should see at the deployed endpoint after I push.
```

For the POST stage, substitute `app/api/rsvps/route.js` and its contract. Never include credentials in prompts or screenshots.
