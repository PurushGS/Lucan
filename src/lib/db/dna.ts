import { db } from "./client";
import { ensureSchema } from "./schema";
import type { ContentDnaProfile, ContentDnaRecord } from "@/src/types/lucan";

export async function getContentDna(userId: string): Promise<ContentDnaProfile | null> {
  const record = await getContentDnaRecord(userId);
  return record?.profile ?? null;
}

export async function getContentDnaRecord(userId: string): Promise<ContentDnaRecord | null> {
  await ensureSchema();
  const result = await db.execute({
    sql: `select profile_json, posts_analyzed, median_words, updated_at
      from content_dna
      where user_id = ? and analysis_source = 'linkedin'`,
    args: [userId],
  });

  const row = result.rows[0];
  if (!row?.profile_json) return null;

  return {
    profile: JSON.parse(String(row.profile_json)) as ContentDnaProfile,
    postsAnalyzed: Number(row.posts_analyzed ?? 0),
    medianWords: Number(row.median_words ?? 0),
    updatedAt: String(row.updated_at),
  };
}

export async function upsertLinkedInContentDna(input: {
  userId: string;
  linkedinAccountId: string;
  posts: string;
  profile: ContentDnaProfile;
  postsAnalyzed: number;
  medianWords: number;
  stats: Record<string, unknown>;
}) {
  await ensureSchema();
  await db.execute({
    sql: `insert into content_dna (
        user_id,
        input_posts,
        profile_json,
        linkedin_account_id,
        posts_analyzed,
        median_words,
        stats_json,
        analysis_source
      )
      values (?, ?, ?, ?, ?, ?, ?, 'linkedin')
      on conflict(user_id) do update set
        input_posts = excluded.input_posts,
        profile_json = excluded.profile_json,
        linkedin_account_id = excluded.linkedin_account_id,
        posts_analyzed = excluded.posts_analyzed,
        median_words = excluded.median_words,
        stats_json = excluded.stats_json,
        analysis_source = excluded.analysis_source,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
    args: [
      input.userId,
      input.posts,
      JSON.stringify(input.profile),
      input.linkedinAccountId,
      input.postsAnalyzed,
      input.medianWords,
      JSON.stringify(input.stats),
    ],
  });

  return input.profile;
}
