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

export type GenerationResult = {
  title: string;
  post: string;
  notes: string[];
};
