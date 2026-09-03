export type SourceType = "topic" | "article" | "pdf" | "youtube";

export type AppUser = {
  id: string;
  email: string | null;
  name: string | null;
  picture: string | null;
};

export type Draft = {
  id: string;
  userId: string;
  sourceType: SourceType;
  sourceValue: string;
  title: string;
  content: string;
  status: "draft" | "scheduled" | "published";
  scheduledAt: string | null;
  publishedAt: string | null;
  linkedinPostUrn: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContentDnaProfile = {
  identityCore: string;
  voiceSignature: string;
  contentPillars: string[];
  positioningLayer: string;
  audienceField: string;
  hookStrategies: string[];
  avoid: string[];
};

export type ContentDnaRecord = {
  profile: ContentDnaProfile;
  postsAnalyzed: number;
  medianWords: number;
  updatedAt: string;
};

export type LinkedInAccount = {
  id: string;
  displayName: string | null;
  picture: string | null;
  connectedAt: string;
  lastSyncedAt: string | null;
  postsImported: number;
};

export type LinkedInPostAnalytics = {
  impressions: number;
  membersReached: number;
  reactions: number;
  comments: number;
  reshares: number;
  saves: number;
  sends: number;
  linkClicks: number;
  followersGained: number;
  profileViews: number;
};

export type LinkedInImportedPost = {
  urn: string;
  commentary: string;
  publishedAt: string | null;
  analytics: LinkedInPostAnalytics;
};

export type LinkedInDashboardAnalytics = {
  connected: boolean;
  account: LinkedInAccount | null;
  followerCount: number | null;
  connectionCount: number | null;
  totals: LinkedInPostAnalytics;
  posts: LinkedInImportedPost[];
  analyticsAvailable: boolean;
  analyticsError: string | null;
};

export type LinkedInStatus = {
  provider: "live" | "mock";
  configured: boolean;
  connected: boolean;
  account: LinkedInAccount | null;
  dna: ContentDnaRecord | null;
};

export type GenerationResult = {
  title: string;
  post: string;
  notes: string[];
};

export type PostScoreFinding = {
  severity: "low" | "medium" | "high";
  line: string;
  reason: string;
  suggestion: string;
};

export type PostScore = {
  performanceScore: number;
  authenticityScore: number;
  slopRisk: "low" | "medium" | "high";
  summary: string;
  voiceCheck: string[];
  criteria: Array<{
    name: string;
    feedback: string;
  }>;
  findings: PostScoreFinding[];
};
