import { scorePost } from "@/src/lib/ai/generate";

async function main() {
  const result = await scorePost({
    post: "Building reliable LinkedIn content tools starts with real account context, then uses AI to adapt to the writer instead of inventing a fake voice.",
    dna: null,
  });

  if (
    !Number.isFinite(result.score.performanceScore) ||
    !Number.isFinite(result.score.authenticityScore) ||
    result.score.criteria.length === 0
  ) {
    throw new Error(`Score smoke test failed: ${JSON.stringify(result)}`);
  }

  console.log(`Score model reachable: ${result.model}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
