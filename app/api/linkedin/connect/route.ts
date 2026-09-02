import { NextResponse } from "next/server";
import { handleRouteError } from "@/src/lib/api";
import { requireUser } from "@/src/lib/auth/session";
import { getLinkedInAuthUrl } from "@/src/lib/linkedin/client";
import { createLinkedInState } from "@/src/lib/security/oauth-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.redirect(getLinkedInAuthUrl(createLinkedInState(user.id)));
  } catch (error) {
    return handleRouteError(error);
  }
}
