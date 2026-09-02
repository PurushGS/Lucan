import { db } from "./client";

let schemaReady: Promise<void> | null = null;

export function ensureSchema() {
  schemaReady ??= createSchema();
  return schemaReady;
}

async function createSchema() {
  await db.batch(
    [
      `create table if not exists users (
        id text primary key,
        email text,
        name text,
        picture text,
        created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      )`,
      `create table if not exists generations (
        id text primary key,
        user_id text not null references users(id) on delete cascade,
        source_type text not null,
        source_value text not null,
        extracted_content text not null,
        output text not null,
        title text not null,
        model text,
        created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      )`,
      `create table if not exists drafts (
        id text primary key,
        user_id text not null references users(id) on delete cascade,
        source_type text not null,
        source_value text not null,
        title text not null,
        content text not null,
        status text not null default 'draft',
        created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      )`,
      `create table if not exists content_dna (
        user_id text primary key references users(id) on delete cascade,
        input_posts text not null,
        profile_json text not null,
        linkedin_account_id text,
        posts_analyzed integer not null default 0,
        median_words integer not null default 0,
        stats_json text not null default '{}',
        analysis_source text not null default 'manual',
        created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      )`,
      `create table if not exists linkedin_accounts (
        id text primary key,
        user_id text not null unique references users(id) on delete cascade,
        linkedin_member_id text not null,
        display_name text,
        picture text,
        access_token_encrypted text not null,
        refresh_token_encrypted text,
        token_expires_at integer,
        scopes text not null,
        connected_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        last_synced_at text
      )`,
      `create table if not exists linkedin_posts (
        id text primary key,
        account_id text not null references linkedin_accounts(id) on delete cascade,
        user_id text not null references users(id) on delete cascade,
        linkedin_post_urn text not null,
        commentary text not null,
        published_at text,
        raw_json text not null,
        created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        unique(account_id, linkedin_post_urn)
      )`,
      `create index if not exists linkedin_posts_user_created_idx on linkedin_posts(user_id, created_at desc)`,
    ],
    "write",
  );

  await addMissingContentDnaColumns();
}

async function addMissingContentDnaColumns() {
  const existing = await db.execute("pragma table_info(content_dna)");
  const columns = new Set(existing.rows.map((row) => String(row.name)));
  const migrations = [
    ["linkedin_account_id", "alter table content_dna add column linkedin_account_id text"],
    ["posts_analyzed", "alter table content_dna add column posts_analyzed integer not null default 0"],
    ["median_words", "alter table content_dna add column median_words integer not null default 0"],
    ["stats_json", "alter table content_dna add column stats_json text not null default '{}'"],
    ["analysis_source", "alter table content_dna add column analysis_source text not null default 'manual'"],
  ] as const;

  for (const [column, sql] of migrations) {
    if (!columns.has(column)) {
      await db.execute(sql);
    }
  }
}
