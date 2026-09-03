import { handleRouteError, jsonOk } from "@/src/lib/api";
import { requireUser } from "@/src/lib/auth/session";
import { getContentDnaRecord } from "@/src/lib/db/dna";
import { getLinkedInAccount } from "@/src/lib/db/linkedin";
import { getLinkedInProvider, isLinkedInConfigured } from "@/src/lib/linkedin/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const [account, dna] = await Promise.all([getLinkedInAccount(user.id), getContentDnaRecord(user.id)]);

    return jsonOk({
      status: {
        provider: getLinkedInProvider(),
        configured: isLinkedInConfigured(),
        connected: Boolean(account),
        account,
        dna,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
