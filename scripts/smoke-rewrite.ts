import { rewritePost } from "@/src/lib/ai/generate";

async function main() {
  const result = await rewritePost({
    post: "AI tools are changing everything. Everyone should use AI to save time and grow faster. The future belongs to people who move quickly. What do you think?",
    dna: null,
    score: {
      performanceScore: 5,
      authenticityScore: 4,
      slopRisk: "high",
      summary: "The draft is clear but generic and over-polished.",
      voiceCheck: ["No personal context or concrete observation."],
      criteria: [{ name: "Originality", feedback: "Too broad." }],
      findings: [
        {
          severity: "high",
          line: "AI tools are changing everything.",
          reason: "Generic opening with no specific tension.",
          suggestion: "Open with a concrete observation from using AI tools.",
        },
      ],
    },
  });

  if (result.post.length < 80 || result.changes.length === 0) {
    throw new Error(`Rewrite smoke test failed: ${JSON.stringify(result)}`);
  }

  console.log(`Rewrite reachable. ${result.post.length} chars, ${result.changes.length} changes.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
