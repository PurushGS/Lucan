import { randomUUID } from "crypto";
import { db } from "./client";
import { ensureSchema } from "./schema";
import type { Draft, SourceType } from "@/src/types/lucan";

export async function listDrafts(userId: string): Promise<Draft[]> {
  await ensureSchema();
  const result = await db.execute({
    sql: `select
        id,
        user_id,
        source_type,
        source_value,
        title,
        content,
        status,
        scheduled_at,
        published_at,
        linkedin_post_urn,
        created_at,
        updated_at
      from drafts
      where user_id = ?
      order by coalesce(scheduled_at, published_at, created_at) desc
      limit 50`,
    args: [userId],
  });

  return result.rows.map(toDraft);
}

export async function getDraft(userId: string, id: string): Promise<Draft | null> {
  await ensureSchema();
  const result = await db.execute({
    sql: `select
        id,
        user_id,
        source_type,
        source_value,
        title,
        content,
        status,
        scheduled_at,
        published_at,
        linkedin_post_urn,
        created_at,
        updated_at
      from drafts
      where user_id = ? and id = ?`,
    args: [userId, id],
  });

  const row = result.rows[0];
  return row ? toDraft(row) : null;
}

function toDraft(row: Record<string, unknown>): Draft {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    sourceType: row.source_type as SourceType,
    sourceValue: String(row.source_value),
    title: String(row.title),
    content: String(row.content),
    status: row.status as Draft["status"],
    scheduledAt: row.scheduled_at ? String(row.scheduled_at) : null,
    publishedAt: row.published_at ? String(row.published_at) : null,
    linkedinPostUrn: row.linkedin_post_urn ? String(row.linkedin_post_urn) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
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

export async function updateDraft(input: {
  id: string;
  userId: string;
  title: string;
  content: string;
}) {
  await ensureSchema();
  const result = await db.execute({
    sql: `update drafts
      set title = ?, content = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      where id = ? and user_id = ?`,
    args: [input.title, input.content, input.id, input.userId],
  });

  if (result.rowsAffected === 0) {
    throw new Error("Draft not found.");
  }
}

export async function scheduleDraft(input: {
  id: string;
  userId: string;
  scheduledAt: string;
}) {
  await ensureSchema();
  const result = await db.execute({
    sql: `update drafts
      set status = 'scheduled',
        scheduled_at = ?,
        published_at = null,
        linkedin_post_urn = null,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      where id = ? and user_id = ?`,
    args: [input.scheduledAt, input.id, input.userId],
  });

  if (result.rowsAffected === 0) {
    throw new Error("Draft not found.");
  }
}

export async function markDraftPublished(input: {
  id: string;
  userId: string;
  linkedinPostUrn: string;
}) {
  await ensureSchema();
  const result = await db.execute({
    sql: `update drafts
      set status = 'published',
        published_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
        linkedin_post_urn = ?,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      where id = ? and user_id = ?`,
    args: [input.linkedinPostUrn, input.id, input.userId],
  });

  if (result.rowsAffected === 0) {
    throw new Error("Draft not found.");
  }
}
