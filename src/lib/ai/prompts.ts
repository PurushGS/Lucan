import type { ContentDnaProfile, GenerationResult, PostScore, SourceType } from "@/src/types/lucan";

export function generationPrompt(input: {
  sourceType: SourceType;
  sourceValue: string;
  sourceText: string;
  dna: ContentDnaProfile | null;
  tone: string | null;
  instructions: string | null;
}) {
  const dnaText = input.dna
    ? JSON.stringify(input.dna, null, 2)
    : "No Content DNA saved yet. Write plainly and avoid pretending to know the user's personal style.";

  return `
You are Lucan, a LinkedIn writing assistant for thoughtful builders, operators, and educators.
Create one original LinkedIn post from the supplied ${input.sourceType}.

Writing constraints:
- No fake metrics, quotes, or unverifiable claims.
- Keep the post useful, specific, and human.
- Prefer short paragraphs and clean line breaks.
- Include a strong opening line and a grounded takeaway.
- Do not mention that you are an AI.
- When Content DNA is available, it is global writing context and should shape voice, topics, examples, rhythm, hooks, and avoid-list.
- When Content DNA is not available, do not imitate a specific user identity.

Tone:
${input.tone || "Use the most suitable tone for the source."}

Additional user instructions:
${input.instructions || "None."}

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

export function scorePrompt(input: { post: string; dna: ContentDnaProfile | null }) {
  const dnaText = input.dna
    ? JSON.stringify(input.dna, null, 2)
    : "No Content DNA saved yet. Judge authenticity by generic human writing quality only.";

  return `
Score this LinkedIn post for performance and authenticity.

Evaluate like Supergrow's post score:
- Performance: hook quality, originality, clarity, readability, and CTA strength.
- Authenticity: how human it reads, AI-slop risk, and how well it matches Content DNA when available.
- Flag exact lines that feel generic, formulaic, over-polished, inflated, or unlike the user's DNA.
- Provide rewrite suggestions that preserve meaning.

Content DNA:
${dnaText}

Post:
${input.post.slice(0, 16000)}

Return only JSON matching this TypeScript type:
type PostScore = ${JSON.stringify({
    performanceScore: 8,
    authenticityScore: 6,
    slopRisk: "medium",
    summary: "Short verdict",
    voiceCheck: ["Specific observation tied to DNA or human writing quality"],
    criteria: [
      { name: "Hook Quality", feedback: "Specific feedback" },
      { name: "Originality", feedback: "Specific feedback" },
      { name: "Clarity and Coherency", feedback: "Specific feedback" },
      { name: "Easy to read", feedback: "Specific feedback" },
      { name: "Call-To-Action", feedback: "Specific feedback" },
    ],
    findings: [
      {
        severity: "medium",
        line: "Exact line from the post",
        reason: "Why it feels weak, generic, or AI-written",
        suggestion: "Concrete rewrite or removal suggestion",
      },
    ],
  } satisfies PostScore)}
`;
}
