import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/app/logto";
import { isRecoverableAuthError } from "@/src/lib/auth/errors";
import { ensureUser } from "@/src/lib/db/users";
import type { AppUser } from "@/src/types/lucan";

export async function requireUser(): Promise<AppUser> {
  const context = await getSafeContext();
  if (!context.isAuthenticated) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return ensureUser(context);
}

async function getSafeContext() {
  try {
    return await getLogtoContext(logtoConfig, { fetchUserInfo: true });
  } catch (error) {
    if (isRecoverableAuthError(error)) {
      return { isAuthenticated: false };
    }

    throw error;
  }
}
