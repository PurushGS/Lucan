import { z } from "zod";
import { handleRouteError, jsonOk } from "@/src/lib/api";
import { requireUser } from "@/src/lib/auth/session";
import { getDraft, scheduleDraft } from "@/src/lib/db/drafts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const scheduleSchema = z.object({
  scheduledAt: z.string().datetime(),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const input = scheduleSchema.parse(await request.json());

    await scheduleDraft({ id, userId: user.id, scheduledAt: input.scheduledAt });
    const draft = await getDraft(user.id, id);
    return jsonOk({ draft });
  } catch (error) {
    return handleRouteError(error);
  }
}
