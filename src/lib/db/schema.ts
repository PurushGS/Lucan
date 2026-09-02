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
        created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      )`,
    ],
    "write",
  );
}
