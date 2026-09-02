import { completeJson } from "./openai";
import { parseJsonObject } from "./json";
import { dnaPrompt, generationPrompt, scorePrompt } from "./prompts";
import type { ContentDnaProfile, GenerationResult, PostScore, SourceType } from "@/src/types/lucan";

export async function generatePost(input: {
  sourceType: SourceType;
  sourceValue: string;
  sourceText: string;
  dna: ContentDnaProfile | null;
  tone: string | null;
  instructions: string | null;
}) {
  const response = await completeJson(generationPrompt(input));
  return parseJsonObject<GenerationResult>(response);
}

export async function generateContentDna(posts: string) {
  const response = await completeJson(dnaPrompt(posts));
  return parseJsonObject<ContentDnaProfile>(response);
}

export async function scorePost(input: { post: string; dna: ContentDnaProfile | null }) {
  const response = await completeJson(scorePrompt(input));
  return parseJsonObject<PostScore>(response);
}
