export function isRecoverableAuthError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const code = String((error as { code?: unknown }).code ?? "");
  const name = String((error as { name?: unknown }).name ?? "");
  const message = String((error as { message?: unknown }).message ?? "");

  return (
    code === "ERR_JWT_EXPIRED" ||
    code === "id_token.invalid_iat" ||
    name === "JWTExpired" ||
    message.includes("JWTExpired") ||
    message.includes("Invalid issued at time in the ID token") ||
    message.includes("id_token.invalid_iat")
  );
}
