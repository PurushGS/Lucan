import type { ContentDnaProfile, GenerationResult, SourceType } from "@/src/types/lucan";

export function generationPrompt(input: {
  sourceType: SourceType;
  sourceValue: string;
  sourceText: string;
  dna: ContentDnaProfile | null;
}) {
  const dnaText = input.dna ? JSON.stringify(input.dna, null, 2) : "No Content DNA saved yet.";

  return `
You are Lucan, a LinkedIn writing assistant for thoughtful builders, operators, and educators.
Create one original LinkedIn post from the supplied ${input.sourceType}.

Writing constraints:
- No fake metrics, quotes, or unverifiable claims.
- Keep the post useful, specific, and human.
- Prefer short paragraphs and clean line breaks.
- Include a strong opening line and a grounded takeaway.
- Do not mention that you are an AI.

Content DNA:
${dnaText}

Source label:
${input.sourceValue}

Source content:
${input.sourceText.slice(0, 20000)}

Return only JSON matching this TypeScript type:
type Result = ${JSON.stringify({ title: "Short draft title", post: "LinkedIn post text", notes: ["Why this angle works"] } satisfies GenerationResult)}
`;
}

export function dnaPrompt(posts: string) {
  return `
Analyze these LinkedIn posts and create a reusable Content DNA profile.
Use only evidence visible in the posts. Do not invent biography, employer, audience, or metrics.

Posts:
${posts.slice(0, 26000)}

Return only JSON matching this TypeScript type:
type ContentDnaProfile = ${JSON.stringify({
    identityCore: "Observed author identity and credibility signals",
    voiceSignature: "Tone, rhythm, vocabulary, and paragraph style",
    contentPillars: ["Recurring topic"],
    positioningLayer: "The author's differentiated angle",
    audienceField: "Likely audience based on the writing",
    hookStrategies: ["Opening pattern"],
    avoid: ["Style or topic to avoid"],
  } satisfies ContentDnaProfile)}
`;
}
