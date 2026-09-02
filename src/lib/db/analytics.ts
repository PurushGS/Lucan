import { db } from "./client";
import { ensureSchema } from "./schema";

export async function getWorkspaceAnalytics(userId: string) {
  await ensureSchema();

  const [drafts, generations, dna, mix] = await Promise.all([
    db.execute({ sql: "select count(*) as count from drafts where user_id = ?", args: [userId] }),
    db.execute({ sql: "select count(*) as count from generations where user_id = ?", args: [userId] }),
    db.execute({
      sql: "select count(*) as count from content_dna where user_id = ? and analysis_source = 'linkedin'",
      args: [userId],
    }),
    db.execute({
      sql: `select source_type, count(*) as count
        from generations
        where user_id = ?
        group by source_type
        order by source_type`,
      args: [userId],
    }),
  ]);

  return {
    drafts: Number(drafts.rows[0]?.count ?? 0),
    generations: Number(generations.rows[0]?.count ?? 0),
    hasDna: Number(dna.rows[0]?.count ?? 0) > 0,
    sourceMix: mix.rows.map((row) => ({
      sourceType: String(row.source_type),
      count: Number(row.count),
    })),
  };
}
