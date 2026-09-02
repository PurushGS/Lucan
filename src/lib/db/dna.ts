import { db } from "./client";
import { ensureSchema } from "./schema";
import type { ContentDnaProfile } from "@/src/types/lucan";

export async function getContentDna(userId: string): Promise<ContentDnaProfile | null> {
  await ensureSchema();
  const result = await db.execute({
    sql: "select profile_json from content_dna where user_id = ?",
    args: [userId],
  });

  const row = result.rows[0];
  return row?.profile_json ? (JSON.parse(String(row.profile_json)) as ContentDnaProfile) : null;
}

export async function upsertContentDna(userId: string, posts: string, profile: ContentDnaProfile) {
  await ensureSchema();
  await db.execute({
    sql: `insert into content_dna (user_id, input_posts, profile_json)
      values (?, ?, ?)
      on conflict(user_id) do update set
        input_posts = excluded.input_posts,
        profile_json = excluded.profile_json,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
    args: [userId, posts, JSON.stringify(profile)],
  });

  return profile;
}
