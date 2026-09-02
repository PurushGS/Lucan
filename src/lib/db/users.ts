import type { LogtoContext } from "@logto/next";
import { db } from "./client";
import { ensureSchema } from "./schema";
import type { AppUser } from "@/src/types/lucan";

export async function ensureUser(context: LogtoContext): Promise<AppUser> {
  await ensureSchema();

  const claims = context.claims;
  if (!claims?.sub) {
    throw new Error("Authenticated Logto context is missing a subject.");
  }

  const user: AppUser = {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    name: typeof claims.name === "string" ? claims.name : typeof claims.username === "string" ? claims.username : null,
    picture: typeof claims.picture === "string" ? claims.picture : null,
  };

  await db.execute({
    sql: `insert into users (id, email, name, picture)
      values (?, ?, ?, ?)
      on conflict(id) do update set
        email = excluded.email,
        name = excluded.name,
        picture = excluded.picture,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
    args: [user.id, user.email, user.name, user.picture],
  });

  return user;
}
