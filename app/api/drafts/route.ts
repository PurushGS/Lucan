import { z } from "zod";
import { handleRouteError, jsonOk } from "@/src/lib/api";
import { requireUser } from "@/src/lib/auth/session";
import { createDraft, listDrafts } from "@/src/lib/db/drafts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const draftSchema = z.object({
  sourceType: z.enum(["topic", "article", "pdf", "youtube"]),
  sourceValue: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
});

export async function GET() {
  try {
    const user = await requireUser();
    const drafts = await listDrafts(user.id);
    return jsonOk({ drafts });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = draftSchema.parse(await request.json());
    const id = await createDraft({ userId: user.id, ...input });
    return jsonOk({ id });
  } catch (error) {
    return handleRouteError(error);
  }
}
