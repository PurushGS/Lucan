import { randomUUID } from "crypto";
import { db } from "./client";
import { ensureSchema } from "./schema";
import type { CreativeDesign, CreativeDocument, CreativeFormat, CreativeTemplateKind } from "@/src/types/lucan";

export async function listCreativeDesigns(userId: string): Promise<CreativeDesign[]> {
  await ensureSchema();
  const result = await db.execute({
    sql: `select
        id,
        user_id,
        title,
        kind,
        format,
        width,
        height,
        document_json,
        created_at,
        updated_at
      from creative_designs
      where user_id = ?
      order by updated_at desc
      limit 50`,
    args: [userId],
  });

  return result.rows.map(toCreativeDesign);
}

export async function getCreativeDesign(userId: string, id: string): Promise<CreativeDesign | null> {
  await ensureSchema();
  const result = await db.execute({
    sql: `select
        id,
        user_id,
        title,
        kind,
        format,
        width,
        height,
        document_json,
        created_at,
        updated_at
      from creative_designs
      where user_id = ? and id = ?`,
    args: [userId, id],
  });

  const row = result.rows[0];
  return row ? toCreativeDesign(row) : null;
}

export async function createCreativeDesign(input: {
  userId: string;
  title: string;
  kind: CreativeTemplateKind;
  format: CreativeFormat;
  width: number;
  height: number;
  document: CreativeDocument;
}) {
  await ensureSchema();
  const id = randomUUID();
  await db.execute({
    sql: `insert into creative_designs (id, user_id, title, kind, format, width, height, document_json)
      values (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.userId,
      input.title,
      input.kind,
      input.format,
      input.width,
      input.height,
      JSON.stringify(input.document),
    ],
  });

  return id;
}

export async function updateCreativeDesign(input: {
  id: string;
  userId: string;
  title: string;
  kind: CreativeTemplateKind;
  format: CreativeFormat;
  width: number;
  height: number;
  document: CreativeDocument;
}) {
  await ensureSchema();
  const result = await db.execute({
    sql: `update creative_designs
      set title = ?,
        kind = ?,
        format = ?,
        width = ?,
        height = ?,
        document_json = ?,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      where id = ? and user_id = ?`,
    args: [
      input.title,
      input.kind,
      input.format,
      input.width,
      input.height,
      JSON.stringify(input.document),
      input.id,
      input.userId,
    ],
  });

  if (result.rowsAffected === 0) {
    throw new Error("Creative design not found.");
  }
}

export async function deleteCreativeDesign(userId: string, id: string) {
  await ensureSchema();
  const result = await db.execute({
    sql: "delete from creative_designs where user_id = ? and id = ?",
    args: [userId, id],
  });

  if (result.rowsAffected === 0) {
    throw new Error("Creative design not found.");
  }
}

function toCreativeDesign(row: Record<string, unknown>): CreativeDesign {
  const document = JSON.parse(String(row.document_json)) as CreativeDocument;
  return {
    id: String(row.id),
    userId: String(row.user_id),
    title: String(row.title),
    kind: row.kind as CreativeTemplateKind,
    format: row.format as CreativeFormat,
    width: Number(row.width),
    height: Number(row.height),
    document,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
