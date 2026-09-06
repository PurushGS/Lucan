import { z } from "zod";
import { generateCarouselContent } from "@/src/lib/ai/generate";
import { handleRouteError, jsonError, jsonOk } from "@/src/lib/api";
import { requireUser } from "@/src/lib/auth/session";
import { createCreativeDocument, getCreativeTemplate } from "@/src/lib/creative/templates";
import { getContentDna } from "@/src/lib/db/dna";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  source: z.string().min(8, "Add a topic or draft text first.").max(12000),
  templateId: z.string().min(1),
  slideCount: z.number().int().min(1).max(8).default(5),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = requestSchema.parse(await request.json());
    const template = getCreativeTemplate(input.templateId);
    const result = await generateCarouselContent({
      source: input.source,
      dna: await getContentDna(user.id),
      slideCount: input.slideCount,
      templateName: template.name,
    });

    if (!result.slides?.length) {
      return jsonError("The AI did not return carousel slides. Try a more specific topic.");
    }

    const document = createCreativeDocument({
      templateId: template.id,
      title: result.title,
      slides: result.slides,
      format: template.format,
    });

    return jsonOk({
      title: result.title,
      kind: template.kind,
      format: document.format,
      width: document.width,
      height: document.height,
      document,
      slides: result.slides,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
