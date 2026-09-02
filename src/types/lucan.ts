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

export type LinkedInStatus = {
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
