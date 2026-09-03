import { completeJson, getScoreModels, isRetryableAIError } from "./openai";
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
  const models = getScoreModels();
  let lastError: unknown;

  for (const model of models) {
    try {
      const response = await completeJson(scorePrompt(input), { model, temperature: 0.25 });
      return {
        score: parseJsonObject<PostScore>(response),
        model,
      };
    } catch (error) {
      lastError = error;
      if (!isRetryableAIError(error)) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("All score models failed.");
}
