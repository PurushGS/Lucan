import { randomUUID } from "crypto";
import { db } from "./client";
import { ensureSchema } from "./schema";
import type { Draft, SourceType } from "@/src/types/lucan";

export async function listDrafts(userId: string): Promise<Draft[]> {
  await ensureSchema();
  const result = await db.execute({
    sql: `select id, user_id, source_type, source_value, title, content, status, created_at, updated_at
      from drafts
      where user_id = ?
      order by created_at desc
      limit 50`,
    args: [userId],
  });

  return result.rows.map((row) => ({
    id: String(row.id),
    userId: String(row.user_id),
    sourceType: row.source_type as SourceType,
    sourceValue: String(row.source_value),
    title: String(row.title),
    content: String(row.content),
    status: row.status as Draft["status"],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }));
}

export async function createDraft(input: {
  userId: string;
  sourceType: SourceType;
  sourceValue: string;
  title: string;
  content: string;
}) {
  await ensureSchema();
  const id = randomUUID();

  await db.execute({
    sql: `insert into drafts (id, user_id, source_type, source_value, title, content)
      values (?, ?, ?, ?, ?, ?)`,
    args: [id, input.userId, input.sourceType, input.sourceValue, input.title, input.content],
  });

  return id;
}
