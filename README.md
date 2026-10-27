# Tracing Data Flow in a Web Application — Ungraded Activity

In this guided activity, we will use a small campus event application to explore how the frontend, API, backend, and database work together.

## In class

Start by cloning the repository and opening it in VS Code:

[Campus Events RSVP Repository](https://github.com/Yanhuazong/campus-events-rsvp)

```bash
git clone https://github.com/Yanhuazong/campus-events-rsvp.git
cd campus-events-rsvp
code .
```

If the `code` command is unavailable, use **File → Open Folder** in VS Code and select `campus-events-rsvp`.

We will work through the setup together, then:

- Identify the data needed and set up the database.
- Implement API endpoints and connect them to the frontend.
- Inspect GET and POST requests using browser DevTools.
- Test successful and unsuccessful requests.
- Trace a user action from the interface to the database and back.

AI assistance is welcome. Be prepared to explain what the generated code does and verify its behavior. Use fictional names and email addresses for testing.

```text
Browser → Next.js API route on Vercel → Supabase database
```

This README contains the complete setup, activity, and database explanation. Supporting files hold coding prompts, the API contract, and troubleshooting.

- [Guided activity](#during-class)
- [Deployment checkpoints](#push-and-verify-at-clear-checkpoints)
- [Database design](#database-design)
- [Permissions and responsibilities](#permissions-and-row-level-security)
- [Submission](#submission)
- [Optional local development](#optional-local-development)

## Map of the files you'll touch

```
starter/
├── components/EventsApp.js       BROWSER: fetch() calls (STUDENT CHANGE 1, 2, 3)
├── app/api/events/route.js       SERVER: GET /api/events       (TODOs, returns 501)
├── app/api/events/[id]/route.js  SERVER: GET /api/events/[id]  (finished example)
├── app/api/rsvps/route.js        SERVER: POST /api/rsvps       (TODOs, returns 501)
├── lib/supabase-server.js        SERVER ONLY: database connection
└── .env.example                  variable names; set real values in Vercel
```

Rule of thumb: **`components/` runs in the browser. `app/api/` and `lib/` run on the server.** Only the server talks to Supabase.

---

## During class

Complete setup and the feature work in class. **Browser → Next.js API route on Vercel → Supabase database** remains our architecture. Connecting Vercel to Supabase supplies configuration; you still complete the routes and frontend.

Use your existing AI coding tool for changes, inspect the diff, then push to GitHub at the checkpoints below. Deployment delay is the main tradeoff: predict responses or trace the code while builds run. Check the latest commit is Ready and test the current production URL, not an older deployment URL. See the [checkpoint table](#push-and-verify-at-clear-checkpoints).

### Set up your working repository and deploy (checkpoint 0)

1. With the cloned repository open in VS Code, create an empty GitHub repository under your own account for your working copy. Change the local `origin` remote to your repository URL (`git remote set-url origin YOUR-REPOSITORY-URL`) and push `main` there. Replace the placeholder with your own URL; keep the shared class starter unchanged. Keep `starter/`, `database/`, `docs/`, and `requests/`, including the lockfile. Exclude dependencies, build output, and real environment files.
2. Sign in to [Vercel](https://vercel.com), add a new project, and import **your** repository. Choose **Next.js**, set **Root Directory = `starter`**, and keep the standard install/build settings. Use a supported Node.js version meeting `>=22` in `starter/package.json`.
3. **You can connect Supabase while creating your Vercel project. Create a new Supabase project for this activity, or select the one you already created for it.** The integration can supply `SUPABASE_URL` and `SUPABASE_SECRET_KEY` automatically. You can skip the manual connection instructions later if those variables are already available to the deployed server. You will still design/create the tables and complete the API and frontend.
4. Deploy and wait for **Ready**. Database settings are optional for this initial sample screen. Open the deployed URL and confirm the yellow **Sample data mode** banner, four `[Sample]` events, and a form that does not save yet.
5. Save your GitHub repository link and Vercel production URL. Check your existing AI coding tool can edit the repository and push to Vercel's production branch (usually `main`). Local Node.js installation is optional.

Use the same Supabase project throughout the activity. If you did not create/connect one in Vercel, create one during the database step below. If setup stalls, ask your instructor or pair with a classmate.

### Predict

Imagine selecting an event, entering a fictional name and email, and clicking **Send RSVP**. Before implementing the request, predict which part of the application handles each responsibility.

✏️ For each item, write **B** (browser), **S** (Next.js server), or **D** (database):

| | B / S / D |
|---|---|
| The form fields and the "Send RSVP" button | |
| `fetch("/api/rsvps", { method: "POST", ... })` | |
| Checking that the email looks valid (the trustworthy check) | |
| The secret Supabase key | |
| Refusing a second RSVP from the same email | |
| Showing "RSVP saved. See you there!" | |

### Design the data

The app must let people browse events, view one, and RSVP with a name and email, with no duplicate RSVPs.

✏️ Before you look at `database/schema.sql`, sketch two tables. What columns does each need? How does an RSVP know which event it's for? What should stop duplicate RSVPs?

Then compare your sketch with the [Database design section later in this README](#database-design).

### Create the tables and check the connection (checkpoint 1)

#### Open your Supabase project

If you already created/connected Supabase through Vercel, open **that same project** from Vercel's integration or database resource using **Open in Supabase**. Do not create a second database.

Otherwise, sign in to [Supabase](https://supabase.com/dashboard), create a separate project such as `campus-events`, choose a nearby region, and wait until it is ready. Save its database password safely; this app uses an API secret key rather than that password. Restore a paused project before proceeding.

Use a database with **no real data**: `schema.sql` drops and recreates the exercise tables, and `seed.sql` deletes their existing rows.

#### Create and inspect the tables

1. Open **SQL Editor → New query**, paste all of [database/schema.sql](database/schema.sql), and select **Run**.
2. Run all of [database/seed.sql](database/seed.sql) in a new query. Confirm any destructive-operation warning only in the project you created for this activity, which should contain no real data.
3. Open **Table Editor**: `events` should contain four rows and `rsvps` should be empty. Find the primary keys, the `rsvps.event_id` foreign key, and the unique `(event_id, email)` constraint.

The seed dates are 7, 14, 21, and 28 days after the day you run it. Re-running the seed refreshes dates **and clears test RSVPs**.

#### Check the existing connection

**Already connected Supabase during Vercel setup? Skip the manual connection below.** In Vercel → project → **Settings → Environment Variables**, simply verify that `SUPABASE_URL` and `SUPABASE_SECRET_KEY` exist for **Production** (and Preview if you test branch deployments), and correspond to the project where you just created tables. Do not copy or add them again if already present.

Open `<your-vercel-url>/api/events/1`. The provided route should return `200` with `{ "data": { ... } }`. If it works, continue directly to the GET activity. Creating tables alone does not require a Vercel redeployment.

#### Manual connection — only if needed

If you did not connect Supabase during setup, connect the integration now, or add the following in Vercel → **Settings → Environment Variables**:

| Server variable | Where to find its value in Supabase |
|---|---|
| `SUPABASE_URL` | **Connect** or **Project Settings → Data API**: Project URL (`https://<project-ref>.supabase.co`) |
| `SUPABASE_SECRET_KEY` | **Project Settings → API Keys**: Secret key (`sb_secret_...`), or legacy `service_role` key |

These exact names are read by `starter/lib/supabase-server.js`. If an integration used other names or omitted a value, add the missing name explicitly. A connection string or publishable/anon key does not replace the secret key in this exercise.

Apply the variables to **Production**, plus **Preview** if needed. After adding/changing variables, **redeploy**, wait for Ready, and retry `/api/events/1`. Existing deployments retain their original settings; refreshing an old deployment is not enough.

Keep privileged credentials server-side, without `NEXT_PUBLIC_`. Never put them in browser code, GitHub, AI prompts, or screenshots. If a key leaks, revoke/rotate it, update Vercel, and redeploy.

At this checkpoint the list and RSVP routes still return `501` until you implement them; the screen still shows sample data. Connecting Supabase supplies configuration, not the missing application code.

### The read flow (GET)

1. **Predict.** Open `app/api/events/route.js` and read the TODOs. Answer the five "pause and ask" questions below.
2. **Generate.** Use the **Stage 2a** prompt from [ai-prompts.md](docs/ai-prompts.md).
3. **Inspect.** Compare the AI's code with `app/api/events/[id]/route.js`. Does it use `getSupabase()`? Does it hide database errors?
4. **Deploy and test (checkpoint 2).** Commit and push Stage 2a to GitHub. Wait for Vercel to show Ready for that commit, then open `<your-vercel-url>/api/events`. Inspect the JSON: you should get 200 with four events. Do this before connecting the frontend.
5. **Connect the frontend (checkpoint 3).** Use the **Stage 2b** prompt (STUDENT CHANGE 1 in `components/EventsApp.js`). Inspect, commit, and push; wait for the new deployment to be Ready before reloading your deployed app.
6. **Inspect in DevTools.** Reload the page, press F12, open **Network**, and filter **Fetch/XHR**. Click the `events` request. Look at the **Headers** tab (Request URL, Request Method, Status Code) and the **Response** tab.
7. **Trace the finished endpoint.** Read `app/api/events/[id]/route.js`. Why does `/api/events/abc` give 400 but `/api/events/9999` give 404?

⭐ *Extension:* use the **Extension** prompt to load details with `GET /api/events/[id]`.

#### Why `force-dynamic`?

The GET route TODO asks you to add this at the top level of `route.js`, outside the handler:

```js
export const dynamic = "force-dynamic";
```

This is a Next.js server configuration export. It controls request-time execution and caching; it does not make the browser interface interactive or define the `[id]` URL parameter.

| Value | Meaning |
|---|---|
| `"auto"` (default) | Use Next.js's default behavior. In this project's Next.js version, GET Route Handlers are **not cached by default**. |
| `"force-dynamic"` | Run the route for each request and skip Next.js response/data caching, so the handler reads the database again. We use this to make the request flow explicit. |
| `"force-static"` | Opt into a cached/static GET response. Useful when data can be reused until revalidation or a new deployment; database changes may not appear immediately. Request-specific APIs such as cookies/headers return empty values. |
| `"error"` | Require static behavior and raise an error if request-time APIs or uncached data are needed. This is a configuration check, not an instruction to return an HTTP error to the user. |

Keep `"force-dynamic"` for this activity so caching does not complicate tracing a database read. Removing the export would not automatically cache this GET route. POST handlers are not cached and do not need this setting.

These options apply to this project's configuration, which does not enable Cache Components. See the official [Next.js route caching guide](https://nextjs.org/docs/app/guides/caching-without-cache-components#dynamic) and [Route Handlers documentation](https://nextjs.org/docs/app/getting-started/route-handlers#caching).

### The write flow (POST)

1. **Predict.** Read the TODOs in `app/api/rsvps/route.js` and answer the five questions.
2. **Generate.** Use the **Stage 3a** prompt.
3. **Inspect.** Find each server-side check: JSON, eventId, name, email, length, format, event exists, duplicate.
4. **Connect the form.** Use the **Stage 3b** prompt (STUDENT CHANGE 2), then **3c** to remove the sample-mode notices.
5. **Deploy the POST flow (checkpoint 4).** Group Stages 3a, 3b, and 3c into one commit/push. Wait for Ready for that commit. **Submit fictional data** in your deployed form. In DevTools, click the `rsvps` request:
   - **Payload** tab: the JSON you sent
   - **Headers** tab: method `POST`, status `201`
   - **Response** tab: `{ "data": { "id": ..., "eventId": ... }, "message": ... }`
6. In Supabase **Table Editor → rsvps**, find your new row.

### Test success and failure

You can use Postman to send requests directly to your API, including invalid input the form would normally reject. Postman is optional.

1. Select **GET**, enter `<your-vercel-url>/api/events`, and select **Send**. Inspect the status and JSON response.
2. Select **POST** and enter `<your-vercel-url>/api/rsvps`. Choose **Body → raw → JSON**, which sets `Content-Type: application/json`, and enter:

   ```json
   { "eventId": 2, "name": "Sam Sample", "email": "sam@example.com" }
   ```

3. Send the request, then change or resend the body to try each case below. Start with a fictional email you have not used for that event. Compare the responses; notes are optional.

| Test | What you sent | Expected | Actual status | Error code (if any) |
|---|---|---|---|---|
| Valid RSVP | event 2, new fictional email | 201 | | |
| Missing email (sent directly to the API) | no `email` field | 400 | | |
| Duplicate RSVP | same event + same email again | 409 | | |
| Unknown event | `eventId: 9999` | 404 | | |

Think about this: the form already has `required` and `type="email"`. Why did the server still need to check? (Hint: how did you just send a request without an email?)

Send requests to **your Vercel API**, without a Supabase key. Postman shows its own requests; use the app in your browser to trace frontend requests in DevTools.

**Alternatives:** use `requests/campus-events.http` with your deployed base URL, or the [browser console snippet](docs/api-reference.md#3-browser-devtools-console-works-everywhere). If Vercel deployment protection returns a sign-in page in Postman, use the authenticated browser's console. See [Postman's request-body documentation](https://learning.postman.com/docs/sending-requests/create-requests/parameters/) for raw JSON details.

### Explain and transfer

1. Explain one complete request journey to a partner: **frontend → API route → database → response → screen**. Name the file at each step.
2. Look at your own prototype. Where does it do each job: UI, input validation, database access, and keeping keys secret?

   Your prototype might call Supabase directly from components, or use Server Actions, so its files may look different. The **responsibilities** are the same even when the file structure isn't.

---

## Pause and ask (before running any generated code)

- **Which endpoint** will receive this?
- **What method** does it use?
- **What data** will cross the network?
- **What code checks** the input?
- **What happens if the database operation fails?**

---

## Submission

No submission is required. This activity is ungraded and is intended to support your understanding of application architecture and the API workshop.

## Push and verify at clear checkpoints

Use your existing AI coding tool to make and inspect the bounded changes in [ai-prompts.md](docs/ai-prompts.md), then commit and push to the GitHub branch Vercel deploys. Each push triggers a deployment. Wait for **Ready** and check that the deployment shows your latest commit before testing. Use the current production URL consistently; a previous deployment's unique URL continues to show its older code/configuration.

| Checkpoint | Group these changes | Verify on Vercel |
|---|---|---|
| 0: classroom setup | Unmodified starter | Sample data mode loads |
| 1: database connection | Tables/seed in Supabase; verify existing connection, or configure/redeploy if needed | `/api/events/1` returns one event |
| 2: GET endpoint | Stage 2a only | Open `/api/events` directly; inspect `200` and JSON **before connecting the frontend** |
| 3: frontend read | Stage 2b | Reload the app; DevTools shows `GET /api/events`; events lose `[Sample]` |
| 4: POST flow | Stages 3a, 3b, and 3c together | Form returns `201`, row appears in Supabase, duplicate returns `409`; test invalid input directly too |

Deployment delay is the tradeoff. Inspect code, predict responses, or sketch the request journey while a deployment builds. Group related edits within each checkpoint rather than pushing every small edit. The optional details extension can wait until the core GET and POST flows work.

For POST testing, open DevTools on **your deployed app** and use the relative `fetch()` examples in [api-reference.md](docs/api-reference.md). Set `@baseUrl` in `requests/campus-events.http` to your deployment URL if using a REST client.


## Database design

```
events                               rsvps
──────────────────────────           ──────────────────────────────
id          integer  PK  ◄─────┐     id          integer  PK
title       text                └──── event_id    integer  FK → events.id
description text                      name        text
location    text                      email       text
starts_at   timestamptz                created_at  timestamptz
created_at  timestamptz                UNIQUE (event_id, email)
```

One event has many RSVPs, and each RSVP belongs to exactly one event.

### Primary keys (`id`)

Each row gets a number that the database generates (`generated always as identity`). Titles and names can repeat or change, but the `id` never does, so other tables and URLs (like `/api/events/2`) can point at a row reliably.

Note that IDs can have gaps. A failed insert, such as a duplicate RSVP, still uses up a number. That's normal.

### Foreign key (`rsvps.event_id → events.id`)

An RSVP is meaningless without knowing which event it's for, so every RSVP stores the event's `id`. The foreign key makes the database **refuse** an RSVP whose `event_id` doesn't exist (Postgres error `23503`). `on delete cascade` means that deleting an event deletes its RSVPs too, so none are left orphaned.

Our API already checks that the event exists and returns a friendly 404. The foreign key is the backstop. It holds even if someone writes buggy code, or the event is deleted between the check and the insert.

### Unique constraint (`unique (event_id, email)`)

The same email may RSVP to **many events**, but only **once per event**. The database rejects a second row with the same pair (Postgres error `23505`), and the API translates that into `409 Conflict`.

This only works if `Alex@Example.com ` and `alex@example.com` are stored the same way, which is why the API trims and lowercases emails before saving. A `check` constraint in the database also rejects any email that isn't already lowercase and trimmed.

Why not just check for duplicates in JavaScript? Two requests can arrive at almost the same moment, both check "no RSVP yet", and both insert. A database constraint can't be raced like that.

### Check constraints

Length limits on text columns (for example, `name` is 1–100 characters) and the email-shape check repeat the API's rules as a backstop.

## Permissions and Row Level Security

**Access approach:** the app reaches the database **only from the Next.js server**, using the secret key. Supabase maps that key to the `service_role` database role. Browsers have no key at all.

What `schema.sql` does:

| Statement | Effect |
|---|---|
| `enable row level security` on both tables, with **no policies** | The `anon` and `authenticated` roles (used by the publishable/anon key and by logged-in Supabase users) see **zero rows** and can insert nothing through Supabase's Data API. |
| `revoke all ... from anon, authenticated, service_role` | Removes the broad default privileges Supabase gives new tables. Public roles are now blocked twice: by missing privileges **and** by RLS. |
| `grant select on events to service_role` | The two GET endpoints can read events. |
| `grant select, insert on rsvps to service_role` | `POST /api/rsvps` can insert, and read back the new row's `id`. It cannot update or delete RSVPs. |

`service_role` **bypasses RLS**, but it still needs these table privileges. Granting only what our three endpoints use is the principle of **least privilege**. If code had a bug that tried to delete RSVPs, the database would refuse.

If a later class adds features, such as cancelling an RSVP, add the matching grant then (for example, `grant delete on rsvps to service_role;`).

## Who enforces what

| Protection | Next.js backend (`app/api/...`) | Database (`schema.sql`) |
|---|---|---|
| Body must be valid JSON | ✅ 400 `INVALID_JSON` | n/a |
| `eventId` is a positive integer; required fields present | ✅ 400 `VALIDATION_ERROR` | ✅ `not null`, integer column type |
| Trim name/email; lowercase email | ✅ does the normalizing | ✅ `check` rejects un-normalized emails |
| Length limits and email shape | ✅ friendly 400 messages | ✅ `check` constraints as backstop |
| Event must exist | ✅ looks it up and returns 404 | ✅ **foreign key** (23503) |
| One RSVP per email per event | Translates the error into 409 | ✅ **unique constraint** (23505): the real guarantee |
| Which fields leave the server (no names/emails) | ✅ only selects/returns public columns | n/a |
| Generic 500s; no SQL or keys in responses | ✅ `serverErrorResponse()` | n/a |
| Keep the secret key secret | ✅ `server-only`, no `NEXT_PUBLIC_`, Vercel server variables; local `.env.local` git-ignored | n/a |
| Block direct public access to tables | n/a | ✅ RLS with no policies + revoked privileges |
| Limit what the server's own role can do | n/a | ✅ grants: select events; select + insert RSVPs |

In this project, the backend is where **rules and friendly errors** live, and the database is where **guarantees** live. Some things only the backend can do, such as choosing which fields to return or writing good error messages. Some things only the database can promise, such as no duplicates even under simultaneous requests. Neither layer trusts the browser.

Not included in this exercise: user accounts, rate limiting, CAPTCHA, or email verification. Any visitor can RSVP with any fictional email. Raise these as discussion points about what a production system would add.


## Optional local development

If your coding tool uses a local checkout, you may run `cd starter`, `npm install`, and `npm run dev` with Node.js 22+. Open `http://localhost:3000`. For local database tests only, copy `.env.example` to `.env.local`, fill in the two server variables, and restart the dev server. This file is ignored by Git and is **not** how Vercel receives configuration. Local setup is optional throughout this activity.

## Official references

- [Import and deploy a Git repository](https://vercel.com/docs/git)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Supabase Vercel integration](https://supabase.com/docs/guides/integrations/vercel-marketplace)


## Supporting files

| Path | Purpose |
|---|---|
| [starter/](starter/) | Student app; open this folder for the coding prompts |
| [database/schema.sql](database/schema.sql) | Tables, constraints, and permissions |
| [database/seed.sql](database/seed.sql) | Four fictional events; clears test RSVPs |
| [docs/ai-prompts.md](docs/ai-prompts.md) | Bounded coding prompts and recovery guidance |
| [docs/api-reference.md](docs/api-reference.md) | Endpoint contract and request examples |
| [docs/troubleshooting.md](docs/troubleshooting.md) | Deployment, configuration, and API fixes |
| [requests/campus-events.http](requests/campus-events.http) | REST client requests; set your deployed base URL |

The completed reference is held by your instructor. Ask for a hint or stage-specific recovery file if needed.
