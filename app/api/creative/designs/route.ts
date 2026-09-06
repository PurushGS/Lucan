import { z } from "zod";
import { handleRouteError, jsonOk } from "@/src/lib/api";
import { requireUser } from "@/src/lib/auth/session";
import { createCreativeDesign, listCreativeDesigns } from "@/src/lib/db/creative";
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

const createSchema = z.object({
  title: z.string().min(1).max(120),
  kind: z.enum(["carousel", "infographic", "image"]),
  format: z.enum(["square", "carousel", "story", "banner"]),
  width: z.number().int().min(320).max(2400),
  height: z.number().int().min(320).max(2400),
  document: documentSchema,
});

export async function GET() {
  try {
    const user = await requireUser();
    const designs = await listCreativeDesigns(user.id);
    return jsonOk({ designs });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = createSchema.parse(await request.json());
    const id = await createCreativeDesign({
      ...input,
      userId: user.id,
      document: input.document as CreativeDocument,
    });
    return jsonOk({ id }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
