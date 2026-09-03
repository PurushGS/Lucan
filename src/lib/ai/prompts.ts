import type { ContentDnaProfile, GenerationResult, SourceType } from "@/src/types/lucan";

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
Score this LinkedIn post for performance and authenticity in real time.

Evaluate like Supergrow's post score:
- Performance: hook quality, originality, clarity, readability, and CTA strength.
- Authenticity: how human it reads, AI-slop risk, and how well it matches Content DNA when available.
- Flag exact lines that feel generic, formulaic, over-polished, inflated, or unlike the user's DNA.
- Provide rewrite suggestions that preserve meaning and sound like the author.

Scoring calibration:
- Do not use default-safe values like 7 or 8 unless the evidence truly supports them.
- Use the full 1-10 range. A bland but readable post can be 4-6. A sharp, specific, DNA-aligned post can be 8-10.
- Penalize generic startup/social-media phrases, vague authority claims, artificial contrast, and inflated certainty.
- Reward concrete observations, specific examples, natural rhythm, useful tension, and a CTA that fits the post.
- Every score must be justified by specific evidence from the post or Content DNA.
- If Content DNA is missing, say that authenticity is judged only against generic human writing quality.

Content DNA:
${dnaText}

Post:
${input.post.slice(0, 16000)}

Return only valid JSON in this exact shape:
{
  "performanceScore": number,
  "authenticityScore": number,
  "slopRisk": "low" | "medium" | "high",
  "summary": string,
  "voiceCheck": string[],
  "criteria": [
    { "name": "Hook Quality", "feedback": string },
    { "name": "Originality", "feedback": string },
    { "name": "Clarity and Coherency", "feedback": string },
    { "name": "Easy to read", "feedback": string },
    { "name": "Call-To-Action", "feedback": string }
  ],
  "findings": [
    {
      "severity": "low" | "medium" | "high",
      "line": string,
      "reason": string,
      "suggestion": string
    }
  ]
}
`;
}
