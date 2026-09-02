import { z } from "zod";
import { generateContentDna } from "@/src/lib/ai/generate";
import { handleRouteError, jsonOk } from "@/src/lib/api";
import { requireUser } from "@/src/lib/auth/session";
import { getContentDna, upsertContentDna } from "@/src/lib/db/dna";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const dnaSchema = z.object({
  posts: z.string().min(200, "Paste at least a few LinkedIn posts to build Content DNA."),
});

export async function GET() {
  try {
    const user = await requireUser();
    const profile = await getContentDna(user.id);
    return jsonOk({ profile });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { posts } = dnaSchema.parse(await request.json());
    const profile = await generateContentDna(posts);
    await upsertContentDna(user.id, posts, profile);
    return jsonOk({ profile });
  } catch (error) {
    return handleRouteError(error);
  }
}
