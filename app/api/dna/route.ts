import { handleRouteError, jsonError, jsonOk } from "@/src/lib/api";
import { requireUser } from "@/src/lib/auth/session";
import { getContentDnaRecord } from "@/src/lib/db/dna";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const dna = await getContentDnaRecord(user.id);
    return jsonOk({ profile: dna?.profile ?? null, dna });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST() {
  return jsonError(
    "Content DNA is generated only from a connected LinkedIn account. Use LinkedIn sync instead.",
    405,
    "LINKEDIN_REQUIRED",
  );
}
