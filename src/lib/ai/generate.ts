import { getModel, getOpenAIClient } from "./openai";
import { parseJsonObject } from "./json";
import { dnaPrompt, generationPrompt } from "./prompts";
import type { ContentDnaProfile, GenerationResult, SourceType } from "@/src/types/lucan";

export async function generatePost(input: {
  sourceType: SourceType;
  sourceValue: string;
  sourceText: string;
  dna: ContentDnaProfile | null;
}) {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: getModel(),
    input: generationPrompt(input),
  });

  return parseJsonObject<GenerationResult>(response.output_text);
}

export async function generateContentDna(posts: string) {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: getModel(),
    input: dnaPrompt(posts),
  });

  return parseJsonObject<ContentDnaProfile>(response.output_text);
}
