# API reference

Our app has three endpoints. Next.js route handlers implement them on the **server**, and the browser calls them with `fetch()`.

| Method | Path | Purpose | File |
|---|---|---|---|
| `GET` | `/api/events` | List events in date order | `app/api/events/route.js` |
| `GET` | `/api/events/[id]` | Get one event | `app/api/events/[id]/route.js` |
| `POST` | `/api/rsvps` | Save an RSVP | `app/api/rsvps/route.js` |

No endpoint returns RSVP names or emails. There is deliberately no "list RSVPs" endpoint.

## Response shapes

Every response is JSON in one of three shapes:

```jsonc
// Successful read
{ "data": ... }

// Successful creation
{ "data": { "id": 7, "eventId": 1 }, "message": "RSVP saved. See you there!" }

// Any error
{ "error": { "code": "VALIDATION_ERROR", "message": "email is required." } }
```

The `code` is for programs: it's stable and easy to check with `if`. The `message` is for people: it can be shown in the UI.

## The event object

```json
{
  "id": 1,
  "title": "Welcome Back Board Game Night",
  "description": "Meet other students over cooperative board games...",
  "location": "Maple Hall Lounge (fictional)",
  "startsAt": "2026-11-01T18:00:00.000Z"
}
```

The database column is `starts_at` (snake_case), but the API returns `startsAt` (camelCase). The API layer decides what the outside world sees. See `toPublicEvent()` in `lib/events.js`. `created_at` is internal and isn't returned. Times are ISO 8601 in UTC, and the browser shows them in the viewer's time zone.

---

## GET /api/events

Returns every event, earliest first.

| Status | When | Body |
|---|---|---|
| 200 | Always, if the database answers | `{ "data": [ event, ... ] }` |
| 200 | No events in the table | `{ "data": [] }`: empty is not an error |
| 500 | Database unreachable or misconfigured | `SERVER_ERROR` or `CONFIG_MISSING` |
| 501 | **Starter only**, before you implement it | `NOT_IMPLEMENTED` |

## GET /api/events/[id]

`[id]` is a folder name in Next.js. `/api/events/2` arrives in the handler as `params.id === "2"`, which is always a string.

| Status | When | Code |
|---|---|---|
| 200 | Event found | `{ "data": event }` |
| 400 | `id` isn't a positive whole number (`abc`, `0`, `-1`, `1.5`, too large) | `INVALID_EVENT_ID` |
| 404 | Valid number, but no such event | `EVENT_NOT_FOUND` |
| 500 | Unexpected server or database problem | `SERVER_ERROR` / `CONFIG_MISSING` |

This route is **already complete in the starter** as a worked example.

## POST /api/rsvps

Request body (JSON), sent with the header `Content-Type: application/json`:

```json
{
  "eventId": 1,
  "name": "Alex Example",
  "email": "alex@example.com"
}
```

Server-side rules, checked in `app/api/rsvps/route.js`:

| Field | Rule |
|---|---|
| body | Must be valid JSON, and a JSON object (not an array or a string) |
| `eventId` | A JSON **number** that is a positive integer (`1` is OK; `"1"`, `0`, and `1.5` are not) |
| `name` | Required string. Trimmed. 1–100 characters after trimming |
| `email` | Required string. Trimmed and lowercased. At most 254 characters. Basic shape `something@something.something` |

The server first checks that the event exists, and then saves the RSVP.

| Status | When | Code |
|---|---|---|
| 201 | Saved | `{ "data": { "id", "eventId" }, "message" }` |
| 400 | Body isn't valid JSON | `INVALID_JSON` |
| 400 | A field breaks a rule above | `VALIDATION_ERROR` |
| 404 | `eventId` doesn't match an event | `EVENT_NOT_FOUND` |
| 409 | This email already RSVPed for this event (case and spaces ignored) | `DUPLICATE_RSVP` |
| 500 | Unexpected server or database problem | `SERVER_ERROR` / `CONFIG_MISSING` |
| 501 | **Starter only**, before you implement it | `NOT_IMPLEMENTED` |

The 201 response contains **no name or email**. The client already knows what it sent, and returning personal data is unnecessary.

A 500 response never includes SQL, keys, or database error text. Server error details are recorded in Vercel runtime logs (or the terminal running `npm run dev` for optional local work).

---

## Trying the endpoints

### 1. Browser address bar (GET only)

Visit `https://YOUR-PROJECT.vercel.app/api/events` or `https://YOUR-PROJECT.vercel.app/api/events/1`, replacing the example origin with your current Vercel production URL. The browser sends a GET request and shows the JSON.

### 2. The `.http` file

Open `requests/campus-events.http` and set `@baseUrl` to your current Vercel production URL. It has examples of every success and failure case. In VS Code, use the **REST Client** extension.

### 3. Browser DevTools console (works everywhere)

Open your deployed app (so relative URLs target your own Vercel server), press F12, choose **Console**, and paste:

```js
// Missing email: expect 400
fetch("/api/rsvps", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ eventId: 1, name: "Sam Sample" }),
}).then(async (r) => console.log(r.status, await r.json()));
```

Change the body to test other cases:

| Test | Body | Expect |
|---|---|---|
| Valid | `{ eventId: 2, name: "Sam Sample", email: "sam@example.com" }` | 201 |
| Duplicate | send the valid body again | 409 |
| Unknown event | `{ eventId: 9999, name: "Sam Sample", email: "sam@example.com" }` | 404 |
| Bad email | `{ eventId: 1, name: "Sam Sample", email: "nope" }` | 400 |

The request shows up in the Network tab too.

### 4. curl (macOS, Linux, Git Bash)

Replace `https://YOUR-PROJECT.vercel.app` with your deployment URL. Optional local work can use `http://localhost:3000` instead.

```bash
curl -i https://YOUR-PROJECT.vercel.app/api/events

curl -i -X POST https://YOUR-PROJECT.vercel.app/api/rsvps \
  -H "Content-Type: application/json" \
  -d '{"eventId":1,"name":"Alex Example","email":"alex@example.com"}'
```

In Windows PowerShell, use `curl.exe` (not `curl`). Quoting JSON is awkward there, so the browser console method is easier.


### 5. Postman (optional)

Follow the [Postman steps in the root README](../README.md#test-success-and-failure) to send GET and POST requests directly to your deployed API. Use **Body → raw → JSON** for POST, and inspect the response status and JSON. No Supabase key belongs in these requests. Continue using browser DevTools to trace requests made by the frontend.
