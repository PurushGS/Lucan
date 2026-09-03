import { completeJson, getRewriteModels, getScoreModels, isRetryableAIError } from "./openai";
import { parseJsonObject } from "./json";
import { dnaPrompt, generationPrompt, rewritePrompt, scorePrompt } from "./prompts";
import type { ContentDnaProfile, GenerationResult, PostScore, RewriteResult, SourceType } from "@/src/types/lucan";

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

  for (let attempt = 0; attempt < 2; attempt += 1) {
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
  }

  throw lastError instanceof Error ? lastError : new Error("All score models failed.");
}

export async function rewritePost(input: { post: string; dna: ContentDnaProfile | null; score: PostScore | null }) {
  const models = getRewriteModels();
  let lastError: unknown;

  for (const model of models) {
    try {
      const response = await completeJson(rewritePrompt(input), { model, temperature: 0.45 });
      return parseJsonObject<RewriteResult>(response);
    } catch (error) {
      lastError = error;
      if (!isRetryableAIError(error)) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("All rewrite models failed.");
}
