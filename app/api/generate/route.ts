import { z } from "zod";
import { handleRouteError, jsonError, jsonOk } from "@/src/lib/api";
import { generatePost } from "@/src/lib/ai/generate";
import { extractArticle } from "@/src/lib/content/article";
import { extractPdf } from "@/src/lib/content/pdf";
import { extractYoutubeTranscript } from "@/src/lib/content/youtube";
import { requireUser } from "@/src/lib/auth/session";
import { getContentDna } from "@/src/lib/db/dna";
import { recordGeneration } from "@/src/lib/db/generations";
import type { SourceType } from "@/src/types/lucan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const sourceSchema = z.enum(["topic", "article", "pdf", "youtube"]);

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const formData = await request.formData();
    const sourceType = sourceSchema.parse(formData.get("sourceType")) as SourceType;
    const input = String(formData.get("input") ?? "").trim();
    const tone = optionalFormString(formData.get("tone"));
    const instructions = optionalFormString(formData.get("instructions"));

    if (sourceType !== "pdf" && input.length < 3) {
      return jsonError("Add a topic or URL first.");
    }

    const sourceText = await resolveSourceText(sourceType, input, formData);
    const dna = await getContentDna(user.id);
    const result = await generatePost({
      sourceType,
      sourceValue: sourceType === "pdf" ? getPdfName(formData) : input,
      sourceText,
      dna,
      tone,
      instructions,
    });
    const generationId = await recordGeneration({
      userId: user.id,
      sourceType,
      sourceValue: sourceType === "pdf" ? getPdfName(formData) : input,
      extractedContent: sourceText,
      result,
    });

    return jsonOk({
      generationId,
      ...result,
      sourceExcerpt: sourceText.slice(0, 420),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

async function resolveSourceText(sourceType: SourceType, input: string, formData: FormData) {
  if (sourceType === "topic") return input;
  if (sourceType === "article") return extractArticle(input);
  if (sourceType === "youtube") return extractYoutubeTranscript(input);

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Upload a PDF file first.");
  }
  return extractPdf(file);
}

function getPdfName(formData: FormData) {
  const file = formData.get("file");
  return file instanceof File ? file.name : "Uploaded PDF";
}

function optionalFormString(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}
