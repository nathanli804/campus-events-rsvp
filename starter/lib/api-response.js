// SERVER-ONLY: helpers that give every API response the same JSON shape.
//
//   Successful read:      { "data": ... }
//   Successful creation:  { "data": { ... }, "message": "..." }
//   Error:                { "error": { "code": "...", "message": "..." } }
import "server-only";
import { MissingConfigError } from "./supabase-server";

export function dataResponse(data, status = 200) {
  return Response.json({ data }, { status });
}

export function createdResponse(data, message) {
  return Response.json({ data, message }, { status: 201 });
}

export function errorResponse(status, code, message) {
  return Response.json({ error: { code, message } }, { status });
}

// Used by the starter's unfinished routes (501 = "Not Implemented").
export function notImplementedResponse(routeName, fileName) {
  return errorResponse(
    501,
    "NOT_IMPLEMENTED",
    `${routeName} is not implemented yet (starter project). Follow the numbered TODOs in ${fileName}.`
  );
}

// For anything unexpected. Details go to Vercel runtime logs (or the local terminal);
// the browser only gets a generic message (no SQL, keys, or internal errors).
export function serverErrorResponse(routeName, error) {
  if (error instanceof MissingConfigError) {
    console.error(`[${routeName}] ${error.message}`);
    return errorResponse(
      500,
      "CONFIG_MISSING",
      "The server is missing its database settings. Set SUPABASE_URL and SUPABASE_SECRET_KEY in Vercel for this environment, then redeploy. For local development, fill in .env.local and restart the dev server."
    );
  }

  // Log only the error code and message, never the request body (names/emails).
  console.error(`[${routeName}] Unexpected error:`, error?.code ?? "", error?.message ?? error);
  return errorResponse(500, "SERVER_ERROR", "Something went wrong on the server. Please try again later.");
}
