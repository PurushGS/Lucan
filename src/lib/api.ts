export function jsonOk<T>(body: T, init?: ResponseInit) {
  return Response.json(body, init);
}

export function jsonError(message: string, status = 400, code = "BAD_REQUEST") {
  return Response.json({ error: { code, message } }, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof Response) {
    return error;
  }

  if (
    error instanceof Error &&
    (error.message.includes("OPENAI_API_KEY") ||
      error.message.includes("OPENROUTER_API_KEY") ||
      error.message.includes("LinkedIn OAuth is not configured"))
  ) {
    return jsonError(error.message, 503, "SETUP_REQUIRED");
  }

  const message = error instanceof Error ? error.message : "Unexpected server error.";
  return jsonError(message, 500, "SERVER_ERROR");
}
