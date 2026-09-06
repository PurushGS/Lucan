import { ZodError } from "zod";

export function jsonOk<T>(body: T, init?: ResponseInit) {
  return Response.json(body, init);
}

export function jsonError(message: string, status = 400, code = "BAD_REQUEST") {
  return Response.json({ error: { code, message } }, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof Response) {
    if (error.status === 401) {
      return jsonError("Please sign in again to continue.", 401, "UNAUTHORIZED");
    }

    return jsonError("Something went wrong. Please try again.", error.status || 500, "REQUEST_FAILED");
  }

  if (error instanceof ZodError) {
    const friendlyIssue = error.issues.find((issue) => issue.message && !looksTechnical(issue.message));
    return jsonError(friendlyIssue?.message ?? "Please check the details and try again.", 400, "VALIDATION_ERROR");
  }

  if (
    error instanceof Error &&
    (error.message.includes("OPENAI_API_KEY") ||
      error.message.includes("OPENROUTER_API_KEY"))
  ) {
    return jsonError("AI generation is not configured yet. Ask the workspace admin to check setup.", 503, "SETUP_REQUIRED");
  }

  if (error instanceof Error && error.message.includes("LinkedIn OAuth is not configured")) {
    return jsonError("LinkedIn is not configured yet. Ask the workspace admin to finish setup.", 503, "SETUP_REQUIRED");
  }

  if (error instanceof Error && isFriendlyMessage(error.message)) {
    return jsonError(error.message, 500, "SERVER_ERROR");
  }

  return jsonError("Something went wrong. Please try again.", 500, "SERVER_ERROR");
}

function isFriendlyMessage(message: string) {
  const trimmed = message.trim();
  return !!trimmed && trimmed.length <= 160 && !looksTechnical(trimmed);
}

function looksTechnical(message: string) {
  return (
    /OPENROUTER_API_KEY|OPENAI_API_KEY|LINKEDIN_CLIENT|TURSO_|DATABASE_URL/i.test(message) ||
    /SyntaxError|TypeError|ReferenceError|ZodError|SQLITE|libsql/i.test(message) ||
    /\bat\s+\w+/i.test(message) ||
    /^\s*[\[{]/.test(message)
  );
}
