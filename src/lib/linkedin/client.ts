import { getLinkedInConfig } from "./config";

type LinkedInTokenResponse = {
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
};

export type LinkedInProfile = {
  sub: string;
  name?: string;
  picture?: string;
};

export type LinkedInPost = {
  urn: string;
  commentary: string;
  publishedAt: string | null;
  raw: unknown;
};

export class LinkedInApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code = "LINKEDIN_API_ERROR") {
    super(message);
    this.name = "LinkedInApiError";
    this.status = status;
    this.code = code;
  }
}

export function getLinkedInAuthUrl(state: string) {
  const config = getLinkedInConfig();
  const url = new URL("https://www.linkedin.com/oauth/v2/authorization");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("scope", config.scopes);
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeCodeForToken(code: string): Promise<LinkedInTokenResponse> {
  const config = getLinkedInConfig();
  const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: config.redirectUri,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
  });

  return readLinkedInResponse<LinkedInTokenResponse>(response, "LinkedIn token exchange failed.");
}

export async function getLinkedInProfile(accessToken: string): Promise<LinkedInProfile> {
  const response = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return readLinkedInResponse<LinkedInProfile>(response, "LinkedIn profile lookup failed.");
}

export async function fetchLinkedInMemberPosts(accessToken: string, memberId: string, count = 15): Promise<LinkedInPost[]> {
  const config = getLinkedInConfig();
  const url = new URL("https://api.linkedin.com/rest/posts");
  url.searchParams.set("q", "author");
  url.searchParams.set("author", `urn:li:person:${memberId}`);
  url.searchParams.set("count", String(count));
  url.searchParams.set("sortBy", "LAST_MODIFIED");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "LinkedIn-Version": config.apiVersion,
      "X-Restli-Protocol-Version": "2.0.0",
      "X-RestLi-Method": "FINDER",
    },
  });

  const data = await readLinkedInResponse<{ elements?: unknown[] }>(
    response,
    "Could not import LinkedIn posts. The LinkedIn app may need r_member_social approval.",
  );

  return (data.elements ?? []).map(toLinkedInPost).filter((post): post is LinkedInPost => Boolean(post));
}

async function readLinkedInResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const text = await response.text();
  const payload = text ? safeJson(text) : null;
  if (response.ok) {
    return payload as T;
  }

  const linkedinMessage =
    typeof payload === "object" && payload && "message" in payload ? String(payload.message) : fallbackMessage;
  throw new LinkedInApiError(linkedinMessage, response.status);
}

function toLinkedInPost(raw: unknown): LinkedInPost | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const urn = typeof record.id === "string" ? record.id : "";
  const commentary = readCommentary(record.commentary);
  if (!urn || !commentary) return null;

  return {
    urn,
    commentary,
    publishedAt: readLinkedInDate(record.publishedAt ?? record.createdAt),
    raw,
  };
}

function readCommentary(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && "text" in value && typeof value.text === "string") {
    return value.text.trim();
  }
  return "";
}

function readLinkedInDate(value: unknown) {
  if (typeof value === "number") return new Date(value).toISOString();
  if (typeof value === "string" && value) return value;
  return null;
}

function safeJson(text: string) {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}
