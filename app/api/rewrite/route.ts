import { z } from "zod";
import { handleRouteError, jsonOk } from "@/src/lib/api";
import { rewritePost } from "@/src/lib/ai/generate";
import { requireUser } from "@/src/lib/auth/session";
import { getContentDna } from "@/src/lib/db/dna";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const scoreSchema = z
  .object({
    performanceScore: z.number(),
    authenticityScore: z.number(),
    slopRisk: z.enum(["low", "medium", "high"]),
    summary: z.string(),
    voiceCheck: z.array(z.string()).default([]),
    criteria: z.array(z.object({ name: z.string(), feedback: z.string() })).default([]),
    findings: z
      .array(
        z.object({
          severity: z.enum(["low", "medium", "high"]),
          line: z.string(),
          reason: z.string(),
          suggestion: z.string(),
        }),
      )
      .default([]),
  })
  .nullable()
  .optional();

const rewriteSchema = z.object({
  post: z.string().min(40, "Add a draft with enough content to rewrite."),
  score: scoreSchema,
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = rewriteSchema.parse(await request.json());
    const dna = await getContentDna(user.id);
    const result = await rewritePost({ post: input.post, dna, score: input.score ?? null });
    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
