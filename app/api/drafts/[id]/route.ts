import { z } from "zod";
import { handleRouteError, jsonOk } from "@/src/lib/api";
import { requireUser } from "@/src/lib/auth/session";
import { updateDraft } from "@/src/lib/db/drafts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateDraftSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const input = updateDraftSchema.parse(await request.json());
    await updateDraft({ id, userId: user.id, ...input });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
