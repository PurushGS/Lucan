import { z } from "zod";
import { handleRouteError, jsonError, jsonOk } from "@/src/lib/api";
import { requireUser } from "@/src/lib/auth/session";
import { deleteCreativeDesign, getCreativeDesign, updateCreativeDesign } from "@/src/lib/db/creative";
import type { CreativeDocument } from "@/src/types/lucan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const documentSchema = z.object({
  version: z.literal(1),
  templateId: z.string().min(1),
  format: z.enum(["square", "carousel", "story", "banner"]),
  width: z.number().int().min(320).max(2400),
  height: z.number().int().min(320).max(2400),
  pages: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      background: z.string().min(1),
      elements: z.array(
        z.object({
          id: z.string().min(1),
          kind: z.enum(["text", "shape"]),
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
          text: z.string().optional(),
          fill: z.string().optional(),
          stroke: z.string().optional(),
          color: z.string().optional(),
          fontSize: z.number().optional(),
          fontWeight: z.number().optional(),
          radius: z.number().optional(),
        }),
      ),
    }),
  ).min(1).max(12),
});

const updateSchema = z.object({
  title: z.string().min(1).max(120),
  kind: z.enum(["carousel", "infographic", "image"]),
  format: z.enum(["square", "carousel", "story", "banner"]),
  width: z.number().int().min(320).max(2400),
  height: z.number().int().min(320).max(2400),
  document: documentSchema,
});

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const design = await getCreativeDesign(user.id, id);
    if (!design) return jsonError("Creative design not found.", 404, "NOT_FOUND");
    return jsonOk({ design });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const input = updateSchema.parse(await request.json());
    await updateCreativeDesign({
      ...input,
      id,
      userId: user.id,
      document: input.document as CreativeDocument,
    });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    await deleteCreativeDesign(user.id, id);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
