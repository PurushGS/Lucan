import { completeJson } from "./openai";
import { parseJsonObject } from "./json";
import { dnaPrompt, generationPrompt } from "./prompts";
import type { ContentDnaProfile, GenerationResult, SourceType } from "@/src/types/lucan";

export async function generatePost(input: {
  sourceType: SourceType;
  sourceValue: string;
  sourceText: string;
  dna: ContentDnaProfile | null;
}) {
  const response = await completeJson(generationPrompt(input));
  return parseJsonObject<GenerationResult>(response);
}

export async function generateContentDna(posts: string) {
  const response = await completeJson(dnaPrompt(posts));
  return parseJsonObject<ContentDnaProfile>(response);
}
