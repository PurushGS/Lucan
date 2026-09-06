export type ErrorPayload = {
  error?: {
    message?: unknown;
  };
};

const technicalPatterns = [
  /OPENROUTER_API_KEY/i,
  /OPENAI_API_KEY/i,
  /LINKEDIN_CLIENT/i,
  /TURSO_/i,
  /DATABASE_URL/i,
  /redirect_uri|client_id|client_secret|invalid_request/i,
  /SyntaxError/i,
  /TypeError/i,
  /ReferenceError/i,
  /ZodError/i,
  /Prisma|Drizzle|SQLite|SQLITE|libsql/i,
  /All .+ models failed/i,
  /model returned an empty response/i,
  /\bat\s+\w+/i,
  /^\s*[\[{]/,
  /<\/?[a-z][\s\S]*>/i,
];

export function getUserFacingError(payload: unknown, fallback = "Something went wrong. Please try again.") {
  let message = "";

  if (typeof payload === "object" && payload !== null && "error" in payload) {
    const rawMessage = (payload as ErrorPayload).error?.message;
    if (typeof rawMessage === "string") {
      message = rawMessage.trim();
    }
  }

  if (!message || isTechnicalErrorMessage(message)) {
    return fallback;
  }

  return message;
}

export function getUserFacingException(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (!(error instanceof Error)) return fallback;
  const message = error.message.trim();
  return message && !isTechnicalErrorMessage(message) ? message : fallback;
}

function isTechnicalErrorMessage(message: string) {
  return message.length > 240 || technicalPatterns.some((pattern) => pattern.test(message));
}
