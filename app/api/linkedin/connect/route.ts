import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { handleRouteError } from "@/src/lib/api";
import { requireUser } from "@/src/lib/auth/session";
import { getLinkedInAuthUrl } from "@/src/lib/linkedin/client";
import { LinkedInSetupError } from "@/src/lib/linkedin/config";
import { createLinkedInState } from "@/src/lib/security/oauth-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    return NextResponse.redirect(getLinkedInAuthUrl(createLinkedInState(user.id)));
  } catch (error) {
    if (error instanceof LinkedInSetupError) {
      const destination = new URL("/", request.url);
      destination.searchParams.set("linkedin", "setup");
      destination.searchParams.set("message", error.message);
      return NextResponse.redirect(destination);
    }

    return handleRouteError(error);
  }
}
