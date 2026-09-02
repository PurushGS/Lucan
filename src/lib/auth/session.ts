import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/app/logto";
import { ensureUser } from "@/src/lib/db/users";
import type { AppUser } from "@/src/types/lucan";

export async function requireUser(): Promise<AppUser> {
  const context = await getLogtoContext(logtoConfig, { fetchUserInfo: true });
  if (!context.isAuthenticated) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return ensureUser(context);
}
