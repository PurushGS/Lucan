import { handleRouteError, jsonOk } from "@/src/lib/api";
import { requireUser } from "@/src/lib/auth/session";
import { getWorkspaceAnalytics } from "@/src/lib/db/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const analytics = await getWorkspaceAnalytics(user.id);
    return jsonOk({ analytics });
  } catch (error) {
    return handleRouteError(error);
  }
}
