import { randomUUID } from "crypto";
import { decryptSecret, encryptSecret } from "@/src/lib/security/encryption";
import { db } from "./client";
import { ensureSchema } from "./schema";
import type {
  LinkedInAccount,
  LinkedInDashboardAnalytics,
  LinkedInPostAnalytics,
} from "@/src/types/lucan";

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

type LinkedInPublicAccountRow = Omit<
  LinkedInAccountRow,
  "linkedin_member_id" | "access_token_encrypted" | "refresh_token_encrypted" | "token_expires_at" | "scopes"
>;

type LinkedInImportedPostRow = {
  linkedin_post_urn: unknown;
  commentary: unknown;
  published_at: unknown;
  impressions: unknown;
  members_reached: unknown;
  reactions: unknown;
  comments: unknown;
  reshares: unknown;
  saves: unknown;
  sends: unknown;
  link_clicks: unknown;
  followers_gained: unknown;
  profile_views: unknown;
};

type LinkedInProfileMetricsRow = {
  follower_count: unknown;
  connection_count: unknown;
};

const emptyAnalytics: LinkedInPostAnalytics = {
  impressions: 0,
  membersReached: 0,
  reactions: 0,
  comments: 0,
  reshares: 0,
  saves: 0,
  sends: 0,
  linkClicks: 0,
  followersGained: 0,
  profileViews: 0,
};

export async function getLinkedInAccount(userId: string): Promise<LinkedInAccount | null> {
  await ensureSchema();
  const result = await db.execute({
    sql: `select
        a.id,
        a.display_name,
        a.picture,
        a.connected_at,
        a.last_synced_at,
        count(p.id) as posts_imported
      from linkedin_accounts a
      left join linkedin_posts p on p.account_id = a.id
      where a.user_id = ?
      group by a.id`,
    args: [userId],
  });

  const row = result.rows[0] as unknown as LinkedInPublicAccountRow | undefined;
  return row ? toPublicAccount(row) : null;
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

export async function saveLinkedInPostAnalytics(input: {
  accountId: string;
  analytics: Array<{ urn: string; metrics: LinkedInPostAnalytics; raw: unknown }>;
}) {
  await ensureSchema();

  for (const item of input.analytics) {
    await db.execute({
      sql: `insert into linkedin_post_analytics (
          account_id,
          linkedin_post_urn,
          impressions,
          members_reached,
          reactions,
          comments,
          reshares,
          saves,
          sends,
          link_clicks,
          followers_gained,
          profile_views,
          raw_json,
          synced_at
        )
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        on conflict(account_id, linkedin_post_urn) do update set
          impressions = excluded.impressions,
          members_reached = excluded.members_reached,
          reactions = excluded.reactions,
          comments = excluded.comments,
          reshares = excluded.reshares,
          saves = excluded.saves,
          sends = excluded.sends,
          link_clicks = excluded.link_clicks,
          followers_gained = excluded.followers_gained,
          profile_views = excluded.profile_views,
          raw_json = excluded.raw_json,
          synced_at = excluded.synced_at`,
      args: [
        input.accountId,
        item.urn,
        item.metrics.impressions,
        item.metrics.membersReached,
        item.metrics.reactions,
        item.metrics.comments,
        item.metrics.reshares,
        item.metrics.saves,
        item.metrics.sends,
        item.metrics.linkClicks,
        item.metrics.followersGained,
        item.metrics.profileViews,
        JSON.stringify(item.raw),
      ],
    });
  }
}

export async function saveLinkedInProfileMetrics(input: {
  userId: string;
  accountId: string;
  followerCount: number | null;
  connectionCount: number | null;
  raw: unknown;
}) {
  await ensureSchema();
  await db.execute({
    sql: `insert into linkedin_profile_metrics (
        account_id,
        user_id,
        follower_count,
        connection_count,
        raw_json,
        synced_at
      )
      values (?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      on conflict(account_id) do update set
        follower_count = excluded.follower_count,
        connection_count = excluded.connection_count,
        raw_json = excluded.raw_json,
        synced_at = excluded.synced_at`,
    args: [
      input.accountId,
      input.userId,
      input.followerCount,
      input.connectionCount,
      JSON.stringify(input.raw),
    ],
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

export async function getLinkedInDashboardAnalytics(userId: string): Promise<LinkedInDashboardAnalytics> {
  await ensureSchema();
  const account = await getLinkedInAccount(userId);
  if (!account) {
    return {
      connected: false,
      account: null,
      followerCount: null,
      connectionCount: null,
      totals: { ...emptyAnalytics },
      posts: [],
      analyticsAvailable: false,
      analyticsError: null,
    };
  }

  const [profileResult, postsResult, analyticsCountResult] = await Promise.all([
    db.execute({
      sql: `select follower_count, connection_count
        from linkedin_profile_metrics
        where account_id = ?`,
      args: [account.id],
    }),
    db.execute({
      sql: `select
          p.linkedin_post_urn,
          p.commentary,
          p.published_at,
          coalesce(a.impressions, 0) as impressions,
          coalesce(a.members_reached, 0) as members_reached,
          coalesce(a.reactions, 0) as reactions,
          coalesce(a.comments, 0) as comments,
          coalesce(a.reshares, 0) as reshares,
          coalesce(a.saves, 0) as saves,
          coalesce(a.sends, 0) as sends,
          coalesce(a.link_clicks, 0) as link_clicks,
          coalesce(a.followers_gained, 0) as followers_gained,
          coalesce(a.profile_views, 0) as profile_views
        from linkedin_posts p
        left join linkedin_post_analytics a
          on a.account_id = p.account_id and a.linkedin_post_urn = p.linkedin_post_urn
        where p.user_id = ? and p.account_id = ?
        order by coalesce(p.published_at, p.created_at) desc
        limit 25`,
      args: [userId, account.id],
    }),
    db.execute({
      sql: "select count(*) as count from linkedin_post_analytics where account_id = ?",
      args: [account.id],
    }),
  ]);

  const profile = profileResult.rows[0] as unknown as LinkedInProfileMetricsRow | undefined;
  const posts = (postsResult.rows as unknown as LinkedInImportedPostRow[]).map((row) => ({
    urn: String(row.linkedin_post_urn),
    commentary: String(row.commentary),
    publishedAt: row.published_at ? String(row.published_at) : null,
    analytics: toAnalytics(row),
  }));

  return {
    connected: true,
    account,
    followerCount: nullableNumber(profile?.follower_count),
    connectionCount: nullableNumber(profile?.connection_count),
    totals: posts.reduce(addAnalytics, { ...emptyAnalytics }),
    posts,
    analyticsAvailable: Number(analyticsCountResult.rows[0]?.count ?? 0) > 0,
    analyticsError: null,
  };
}

function toPublicAccount(row: LinkedInPublicAccountRow): LinkedInAccount {
  return {
    id: String(row.id),
    displayName: row.display_name ? String(row.display_name) : null,
    picture: row.picture ? String(row.picture) : null,
    connectedAt: String(row.connected_at),
    lastSyncedAt: row.last_synced_at ? String(row.last_synced_at) : null,
    postsImported: Number(row.posts_imported ?? 0),
  };
}

function toAnalytics(row: LinkedInImportedPostRow): LinkedInPostAnalytics {
  return {
    impressions: Number(row.impressions ?? 0),
    membersReached: Number(row.members_reached ?? 0),
    reactions: Number(row.reactions ?? 0),
    comments: Number(row.comments ?? 0),
    reshares: Number(row.reshares ?? 0),
    saves: Number(row.saves ?? 0),
    sends: Number(row.sends ?? 0),
    linkClicks: Number(row.link_clicks ?? 0),
    followersGained: Number(row.followers_gained ?? 0),
    profileViews: Number(row.profile_views ?? 0),
  };
}

function addAnalytics(total: LinkedInPostAnalytics, post: { analytics: LinkedInPostAnalytics }) {
  return {
    impressions: total.impressions + post.analytics.impressions,
    membersReached: total.membersReached + post.analytics.membersReached,
    reactions: total.reactions + post.analytics.reactions,
    comments: total.comments + post.analytics.comments,
    reshares: total.reshares + post.analytics.reshares,
    saves: total.saves + post.analytics.saves,
    sends: total.sends + post.analytics.sends,
    linkClicks: total.linkClicks + post.analytics.linkClicks,
    followersGained: total.followersGained + post.analytics.followersGained,
    profileViews: total.profileViews + post.analytics.profileViews,
  };
}

function nullableNumber(value: unknown) {
  if (value === null || value === undefined) return null;
  return Number(value);
}
