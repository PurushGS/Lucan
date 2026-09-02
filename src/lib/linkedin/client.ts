import { getLinkedInConfig } from "./config";
import type { LinkedInPostAnalytics } from "@/src/types/lucan";

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

export type LinkedInPostAnalyticsResult = {
  urn: string;
  metrics: LinkedInPostAnalytics;
  raw: unknown;
};

export type LinkedInProfileMetrics = {
  followerCount: number | null;
  connectionCount: number | null;
  raw: {
    followers: unknown;
    connections: unknown;
  };
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

const postAnalyticsMetrics = [
  ["IMPRESSION", "impressions"],
  ["MEMBERS_REACHED", "membersReached"],
  ["REACTION", "reactions"],
  ["COMMENT", "comments"],
  ["RESHARE", "reshares"],
  ["POST_SAVE", "saves"],
  ["POST_SEND", "sends"],
  ["LINK_CLICKS", "linkClicks"],
  ["FOLLOWER_GAINED_FROM_CONTENT", "followersGained"],
  ["PROFILE_VIEW_FROM_CONTENT", "profileViews"],
] as const;

export async function fetchLinkedInPostAnalytics(
  accessToken: string,
  posts: Pick<LinkedInPost, "urn">[],
): Promise<LinkedInPostAnalyticsResult[]> {
  const results: LinkedInPostAnalyticsResult[] = [];

  for (const post of posts) {
    const metrics: LinkedInPostAnalytics = {
      impressions: 0,
      membersReached: 0,
      reactions: 0,
      comments: 0,
      reshares: 0,
      saves: 0,
      sends: 0,
      linkClicks: 0,
      followersGained: 0,
      profileViews: 0,
    };
    const raw: Record<string, unknown> = {};

    for (const [queryType, key] of postAnalyticsMetrics) {
      const response = await fetchMemberPostMetric(accessToken, post.urn, queryType);
      metrics[key] = sumCounts(response);
      raw[queryType] = response;
    }

    results.push({ urn: post.urn, metrics, raw });
  }

  return results;
}

export async function fetchLinkedInProfileMetrics(accessToken: string, memberId: string): Promise<LinkedInProfileMetrics> {
  const [followers, connections] = await Promise.all([
    readOptionalLinkedInResponse(fetchFollowerCount(accessToken)),
    readOptionalLinkedInResponse(fetchConnectionCount(accessToken, memberId)),
  ]);

  return {
    followerCount: readFirstNumber(followers.payload, ["memberFollowersCount"]),
    connectionCount: readFirstNumber(connections.payload, ["firstDegreeSize"]),
    raw: {
      followers: followers.payload ?? { error: followers.error?.message, status: followers.error?.status },
      connections: connections.payload ?? { error: connections.error?.message, status: connections.error?.status },
    },
  };
}

async function fetchMemberPostMetric(accessToken: string, postUrn: string, queryType: string) {
  const config = getLinkedInConfig();
  const entity = `(${readAnalyticsEntityType(postUrn)}:${encodeURIComponent(postUrn)})`;
  const response = await fetch(
    `https://api.linkedin.com/rest/memberCreatorPostAnalytics?q=entity&entity=${entity}&queryType=${queryType}&aggregation=TOTAL`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "LinkedIn-Version": config.apiVersion,
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json",
      },
    },
  );

  return readLinkedInResponse<{ elements?: Array<{ count?: unknown }> }>(
    response,
    `Could not import LinkedIn post analytics for ${queryType}.`,
  );
}

async function fetchFollowerCount(accessToken: string) {
  const config = getLinkedInConfig();
  const response = await fetch("https://api.linkedin.com/rest/memberFollowersCount?q=me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "LinkedIn-Version": config.apiVersion,
      "X-Restli-Protocol-Version": "2.0.0",
      "Content-Type": "application/json",
    },
  });

  return readLinkedInResponse<{ elements?: Array<{ memberFollowersCount?: unknown }> }>(
    response,
    "Could not import LinkedIn follower count.",
  );
}

async function fetchConnectionCount(accessToken: string, memberId: string) {
  const response = await fetch(`https://api.linkedin.com/v2/connections/urn:li:person:${encodeURIComponent(memberId)}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Restli-Protocol-Version": "2.0.0",
      "Content-Type": "application/json",
    },
  });

  return readLinkedInResponse<{ firstDegreeSize?: unknown }>(response, "Could not import LinkedIn connection count.");
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

async function readOptionalLinkedInResponse<T>(promise: Promise<T>) {
  try {
    return { payload: await promise, error: null };
  } catch (error) {
    if (error instanceof LinkedInApiError && (error.status === 403 || error.status === 404)) {
      return { payload: null, error };
    }
    throw error;
  }
}

function sumCounts(payload: { elements?: Array<{ count?: unknown }> }) {
  return (payload.elements ?? []).reduce((total, element) => total + Number(element.count ?? 0), 0);
}

function readAnalyticsEntityType(urn: string) {
  return urn.includes(":ugcPost:") ? "ugc" : "share";
}

function readFirstNumber(payload: unknown, keys: string[]) {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;

  for (const key of keys) {
    const direct = readNumber(record[key]);
    if (direct !== null) return direct;
  }

  const elements = Array.isArray(record.elements) ? record.elements : [];
  for (const element of elements) {
    if (!element || typeof element !== "object") continue;
    const elementRecord = element as Record<string, unknown>;
    for (const key of keys) {
      const value = readNumber(elementRecord[key]);
      if (value !== null) return value;
    }
  }

  return null;
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
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
