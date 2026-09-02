import { randomUUID } from "crypto";
import { db } from "./client";
import { ensureSchema } from "./schema";
import { getModel } from "@/src/lib/ai/openai";
import type { GenerationResult, SourceType } from "@/src/types/lucan";

export async function recordGeneration(input: {
  userId: string;
  sourceType: SourceType;
  sourceValue: string;
  extractedContent: string;
  result: GenerationResult;
}) {
  await ensureSchema();
  const id = randomUUID();

  await db.execute({
    sql: `insert into generations (id, user_id, source_type, source_value, extracted_content, output, title, model)
      values (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.userId,
      input.sourceType,
      input.sourceValue,
      input.extractedContent,
      input.result.post,
      input.result.title,
      getModel(),
    ],
  });

  return id;
}
