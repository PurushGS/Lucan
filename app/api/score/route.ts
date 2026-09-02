import { z } from "zod";
import { handleRouteError, jsonOk } from "@/src/lib/api";
import { scorePost } from "@/src/lib/ai/generate";
import { requireUser } from "@/src/lib/auth/session";
import { getContentDna } from "@/src/lib/db/dna";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const scoreSchema = z.object({
  post: z.string().min(40, "Add a draft with enough content to score."),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { post } = scoreSchema.parse(await request.json());
    const dna = await getContentDna(user.id);
    const score = await scorePost({ post, dna });
    return jsonOk({ score });
  } catch (error) {
    return handleRouteError(error);
  }
}
