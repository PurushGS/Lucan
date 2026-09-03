import type {
  LinkedInPost,
  LinkedInPostAnalyticsResult,
  LinkedInProfile,
  LinkedInProfileMetrics,
} from "./client";

export const mockLinkedInProfile: LinkedInProfile = {
  sub: "mock-lucan-founder",
  name: "Lucan Test Creator",
  picture: "https://media.licdn.com/dms/image/mock/profile-displayphoto-shrink_100_100/mock",
};

export const mockLinkedInScope =
  "openid profile email w_member_social r_member_social r_member_postAnalytics r_member_profileAnalytics r_1st_connections_size";

const mockPosts: LinkedInPost[] = [
  {
    urn: "urn:li:share:mock-001",
    commentary:
      "Most founders do not need more content ideas. They need a sharper point of view.\n\nThe posts that travel are usually simple: a specific observation, a personal reason it matters, and one practical takeaway.\n\nWhen I write, I ask: what did I notice this week that my audience has also felt but not named yet?",
    publishedAt: "2026-08-30T09:30:00.000Z",
    raw: { id: "urn:li:share:mock-001", visibility: "PUBLIC" },
  },
  {
    urn: "urn:li:share:mock-002",
    commentary:
      "A useful content system has three layers:\n\n1. Capture the raw thought while it is still fresh.\n2. Turn it into a clear argument.\n3. Edit until it sounds like something you would actually say.\n\nSkipping layer three is why so much AI-assisted writing feels technically correct and emotionally empty.",
    publishedAt: "2026-08-26T11:15:00.000Z",
    raw: { id: "urn:li:share:mock-002", visibility: "PUBLIC" },
  },
  {
    urn: "urn:li:ugcPost:mock-003",
    commentary:
      "One mistake I made early: trying to sound like the polished version of myself.\n\nIt made the writing smooth, but forgettable.\n\nThe better version was messier: specific examples, stronger verbs, shorter claims, and a bit more honesty about what was hard.",
    publishedAt: "2026-08-21T08:45:00.000Z",
    raw: { id: "urn:li:ugcPost:mock-003", visibility: "PUBLIC" },
  },
  {
    urn: "urn:li:share:mock-004",
    commentary:
      "If a LinkedIn post needs a long setup before the reader understands why they should care, the hook is doing too little work.\n\nA strong hook does not have to be loud. It has to create useful tension fast.",
    publishedAt: "2026-08-18T10:00:00.000Z",
    raw: { id: "urn:li:share:mock-004", visibility: "PUBLIC" },
  },
  {
    urn: "urn:li:share:mock-005",
    commentary:
      "The highest leverage writing habit I know is keeping a private list of sentences you almost posted but did not.\n\nThat list shows you what you actually care about, what you are afraid to say clearly, and where the next strong post probably lives.",
    publishedAt: "2026-08-14T13:20:00.000Z",
    raw: { id: "urn:li:share:mock-005", visibility: "PUBLIC" },
  },
];

const mockAnalytics: Record<string, LinkedInPostAnalyticsResult["metrics"]> = {
  "urn:li:share:mock-001": {
    impressions: 8420,
    membersReached: 6110,
    reactions: 218,
    comments: 37,
    reshares: 18,
    saves: 91,
    sends: 22,
    linkClicks: 44,
    followersGained: 29,
    profileViews: 136,
  },
  "urn:li:share:mock-002": {
    impressions: 12650,
    membersReached: 9040,
    reactions: 391,
    comments: 64,
    reshares: 41,
    saves: 144,
    sends: 38,
    linkClicks: 69,
    followersGained: 52,
    profileViews: 221,
  },
  "urn:li:ugcPost:mock-003": {
    impressions: 5920,
    membersReached: 4300,
    reactions: 146,
    comments: 21,
    reshares: 9,
    saves: 57,
    sends: 13,
    linkClicks: 18,
    followersGained: 17,
    profileViews: 84,
  },
  "urn:li:share:mock-004": {
    impressions: 7210,
    membersReached: 5080,
    reactions: 177,
    comments: 28,
    reshares: 15,
    saves: 73,
    sends: 19,
    linkClicks: 27,
    followersGained: 21,
    profileViews: 109,
  },
  "urn:li:share:mock-005": {
    impressions: 10180,
    membersReached: 7720,
    reactions: 305,
    comments: 46,
    reshares: 27,
    saves: 118,
    sends: 31,
    linkClicks: 52,
    followersGained: 44,
    profileViews: 178,
  },
};

export function getMockLinkedInAuthUrl(baseUrl: string, state: string) {
  const url = new URL("/linkedin/mock-consent", baseUrl);
  url.searchParams.set("state", state);
  return url.toString();
}

export function exchangeMockLinkedInCode(code: string) {
  if (code !== "mock-linkedin-consent") {
    throw new Error("Mock LinkedIn authorization code is invalid.");
  }

  return {
    access_token: "mock-linkedin-access-token",
    refresh_token: "mock-linkedin-refresh-token",
    expires_in: 3600,
    scope: mockLinkedInScope,
  };
}

export function getMockLinkedInPosts(count = 15) {
  return mockPosts.slice(0, count);
}

export function getMockLinkedInPostAnalytics(posts: Pick<LinkedInPost, "urn">[]): LinkedInPostAnalyticsResult[] {
  return posts.map((post) => ({
    urn: post.urn,
    metrics: mockAnalytics[post.urn] ?? {
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
    },
    raw: { provider: "mock", urn: post.urn },
  }));
}

export function getMockLinkedInProfileMetrics(): LinkedInProfileMetrics {
  return {
    followerCount: 18420,
    connectionCount: 500,
    raw: {
      followers: { provider: "mock", memberFollowersCount: 18420 },
      connections: { provider: "mock", firstDegreeSize: 500 },
    },
  };
}
