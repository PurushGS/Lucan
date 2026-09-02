import { randomUUID } from "crypto";
import { decryptSecret, encryptSecret } from "@/src/lib/security/encryption";
import { db } from "./client";
import { ensureSchema } from "./schema";
import type { LinkedInAccount } from "@/src/types/lucan";

export type StoredLinkedInAccount = LinkedInAccount & {
  linkedinMemberId: string;
  accessToken: string;
  refreshToken: string | null;
  tokenExpiresAt: number | null;
  scopes: string;
};

type LinkedInAccountRow = {
  id: unknown;
  linkedin_member_id: unknown;
  display_name: unknown;
  picture: unknown;
  access_token_encrypted: unknown;
  refresh_token_encrypted: unknown;
  token_expires_at: unknown;
  scopes: unknown;
  connected_at: unknown;
  last_synced_at: unknown;
  posts_imported: unknown;
};

export async function getLinkedInAccount(userId: string): Promise<LinkedInAccount | null> {
  const account = await getLinkedInAccountWithTokens(userId);
  if (!account) return null;

  return {
    id: account.id,
    displayName: account.displayName,
    picture: account.picture,
    connectedAt: account.connectedAt,
    lastSyncedAt: account.lastSyncedAt,
    postsImported: account.postsImported,
  };
}

export async function getLinkedInAccountWithTokens(userId: string): Promise<StoredLinkedInAccount | null> {
  await ensureSchema();
  const result = await db.execute({
    sql: `select
        a.id,
        a.linkedin_member_id,
        a.display_name,
        a.picture,
        a.access_token_encrypted,
        a.refresh_token_encrypted,
        a.token_expires_at,
        a.scopes,
        a.connected_at,
        a.last_synced_at,
        count(p.id) as posts_imported
      from linkedin_accounts a
      left join linkedin_posts p on p.account_id = a.id
      where a.user_id = ?
      group by a.id`,
    args: [userId],
  });

  const row = result.rows[0] as unknown as LinkedInAccountRow | undefined;
  if (!row) return null;

  return {
    id: String(row.id),
    linkedinMemberId: String(row.linkedin_member_id),
    displayName: row.display_name ? String(row.display_name) : null,
    picture: row.picture ? String(row.picture) : null,
    accessToken: decryptSecret(String(row.access_token_encrypted)),
    refreshToken: row.refresh_token_encrypted ? decryptSecret(String(row.refresh_token_encrypted)) : null,
    tokenExpiresAt: row.token_expires_at === null ? null : Number(row.token_expires_at),
    scopes: String(row.scopes),
    connectedAt: String(row.connected_at),
    lastSyncedAt: row.last_synced_at ? String(row.last_synced_at) : null,
    postsImported: Number(row.posts_imported ?? 0),
  };
}

export async function upsertLinkedInAccount(input: {
  userId: string;
  linkedinMemberId: string;
  displayName: string | null;
  picture: string | null;
  accessToken: string;
  refreshToken: string | null;
  expiresInSeconds: number | null;
  scopes: string;
}) {
  await ensureSchema();
  const id = randomUUID();
  const expiresAt = input.expiresInSeconds ? Math.floor(Date.now() / 1000) + input.expiresInSeconds : null;

  await db.execute({
    sql: `insert into linkedin_accounts (
        id,
        user_id,
        linkedin_member_id,
        display_name,
        picture,
        access_token_encrypted,
        refresh_token_encrypted,
        token_expires_at,
        scopes
      )
      values (?, ?, ?, ?, ?, ?, ?, ?, ?)
      on conflict(user_id) do update set
        linkedin_member_id = excluded.linkedin_member_id,
        display_name = excluded.display_name,
        picture = excluded.picture,
        access_token_encrypted = excluded.access_token_encrypted,
        refresh_token_encrypted = excluded.refresh_token_encrypted,
        token_expires_at = excluded.token_expires_at,
        scopes = excluded.scopes,
        connected_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
    args: [
      id,
      input.userId,
      input.linkedinMemberId,
      input.displayName,
      input.picture,
      encryptSecret(input.accessToken),
      input.refreshToken ? encryptSecret(input.refreshToken) : null,
      expiresAt,
      input.scopes,
    ],
  });
}

export async function saveLinkedInPosts(input: {
  userId: string;
  accountId: string;
  posts: Array<{ urn: string; commentary: string; publishedAt: string | null; raw: unknown }>;
}) {
  await ensureSchema();

  for (const post of input.posts) {
    await db.execute({
      sql: `insert into linkedin_posts (
          id,
          account_id,
          user_id,
          linkedin_post_urn,
          commentary,
          published_at,
          raw_json
        )
        values (?, ?, ?, ?, ?, ?, ?)
        on conflict(account_id, linkedin_post_urn) do update set
          commentary = excluded.commentary,
          published_at = excluded.published_at,
          raw_json = excluded.raw_json`,
      args: [
        randomUUID(),
        input.accountId,
        input.userId,
        post.urn,
        post.commentary,
        post.publishedAt,
        JSON.stringify(post.raw),
      ],
    });
  }

  await db.execute({
    sql: "update linkedin_accounts set last_synced_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') where id = ?",
    args: [input.accountId],
  });
}

export async function getLinkedInPostCorpus(userId: string, accountId: string, limit = 15) {
  await ensureSchema();
  const result = await db.execute({
    sql: `select commentary
      from linkedin_posts
      where user_id = ? and account_id = ?
      order by coalesce(published_at, created_at) desc
      limit ?`,
    args: [userId, accountId, limit],
  });

  return result.rows.map((row) => String(row.commentary)).filter(Boolean);
}
