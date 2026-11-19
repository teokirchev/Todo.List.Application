import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

type Sql = NeonQueryFunction<false, false>;

let client: Sql | null = null;
let schemaReady: Promise<void> | null = null;

function getClient(): Sql {
  if (!client) {
    // The Vercel Neon integration sets DATABASE_URL (and POSTGRES_URL as an alias).
    const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    client = neon(url);
  }
  return client;
}

function ensureSchema(sql: Sql) {
  return sql
    .transaction([
      sql`create table if not exists users (
        id uuid primary key default gen_random_uuid(),
        google_sub text not null unique,
        email text not null,
        name text not null,
        created_at timestamptz not null default now()
      )`,
      sql`create table if not exists todos (
        id uuid primary key,
        user_id uuid not null references users(id) on delete cascade,
        list text not null check (list in ('work', 'personal')),
        title text not null check (char_length(title) between 1 and 500),
        completed boolean not null default false,
        created_at timestamptz not null default now()
      )`,
      sql`create index if not exists todos_user_list_idx on todos (user_id, list, created_at)`,
      // Priority order within a list (1 = top). Added later, so older rows are numbered by creation time.
      sql`alter table todos add column if not exists position integer`,
      sql`with ranked as (
        select t.id,
               row_number() over (partition by t.user_id, t.list order by t.created_at, t.id)
                 + coalesce((select max(p.position) from todos p
                             where p.user_id = t.user_id and p.list = t.list), 0) as rn
        from todos t
        where t.position is null
      )
      update todos set position = ranked.rn from ranked where todos.id = ranked.id`,
    ])
    .then(() => undefined);
}

/** The SQL client, after making sure the tables exist (once per server instance). */
export async function db(): Promise<Sql> {
  const sql = getClient();
  schemaReady ??= ensureSchema(sql).catch((error) => {
    schemaReady = null;
    throw error;
  });
  await schemaReady;
  return sql;
}
