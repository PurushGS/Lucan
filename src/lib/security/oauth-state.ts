import { createHmac, timingSafeEqual } from "crypto";

const MAX_STATE_AGE_MS = 10 * 60 * 1000;

type LinkedInState = {
  userId: string;
  issuedAt: number;
};

function getStateSecret() {
  const secret = process.env.LOGTO_COOKIE_SECRET || process.env.TOKEN_ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("Missing LOGTO_COOKIE_SECRET for OAuth state signing.");
  }

  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getStateSecret()).update(payload).digest("base64url");
}

export function createLinkedInState(userId: string) {
  const payload = Buffer.from(JSON.stringify({ userId, issuedAt: Date.now() } satisfies LinkedInState)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyLinkedInState(state: string) {
  const [payload, signature] = state.split(".");
  if (!payload || !signature) {
    throw new Error("Invalid LinkedIn OAuth state.");
  }

  const expected = sign(payload);
  const expectedBytes = Buffer.from(expected);
  const signatureBytes = Buffer.from(signature);
  if (expectedBytes.length !== signatureBytes.length || !timingSafeEqual(expectedBytes, signatureBytes)) {
    throw new Error("Invalid LinkedIn OAuth state signature.");
  }

  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as LinkedInState;
  if (!parsed.userId || Date.now() - parsed.issuedAt > MAX_STATE_AGE_MS) {
    throw new Error("LinkedIn OAuth state expired.");
  }

  return parsed;
}
