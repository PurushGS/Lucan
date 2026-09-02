import { completeJson } from "@/src/lib/ai/openai";

async function main() {
  const raw = await completeJson("Return only JSON with ok true and a message field saying model reachable.");
  const parsed = JSON.parse(raw) as { ok?: boolean; message?: string };

  if (parsed.ok !== true) {
    throw new Error(`AI smoke test failed: ${raw}`);
  }

  console.log(parsed.message ?? "Model reachable.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
