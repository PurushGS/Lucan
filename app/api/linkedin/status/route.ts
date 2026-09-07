import { handleRouteError, jsonOk } from "@/src/lib/api";
import { requireUser } from "@/src/lib/auth/session";
import { getContentDnaRecord } from "@/src/lib/db/dna";
import { getLinkedInAccount, getLinkedInAccountScopes } from "@/src/lib/db/linkedin";
import { getLinkedInProvider, getMissingLinkedInScopes, isLinkedInConfigured } from "@/src/lib/linkedin/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const [account, accountScopes, dna] = await Promise.all([
      getLinkedInAccount(user.id),
      getLinkedInAccountScopes(user.id),
      getContentDnaRecord(user.id),
    ]);

    return jsonOk({
      status: {
        provider: getLinkedInProvider(),
        configured: isLinkedInConfigured(),
        connected: Boolean(account),
        missingScopes: accountScopes
          ? getMissingLinkedInScopes(accountScopes, [
              "r_member_social",
              "r_member_postAnalytics",
              "r_member_profileAnalytics",
              "r_1st_connections_size",
            ])
          : [],
        account,
        dna,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
