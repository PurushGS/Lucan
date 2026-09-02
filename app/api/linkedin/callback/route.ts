import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireUser } from "@/src/lib/auth/session";
import { upsertLinkedInAccount } from "@/src/lib/db/linkedin";
import { exchangeCodeForToken, getLinkedInProfile } from "@/src/lib/linkedin/client";
import { verifyLinkedInState } from "@/src/lib/security/oauth-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const destination = new URL("/", request.url);

  try {
    const error = request.nextUrl.searchParams.get("error");
    if (error) {
      throw new Error(request.nextUrl.searchParams.get("error_description") || error);
    }

    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    if (!code || !state) {
      throw new Error("LinkedIn callback is missing code or state.");
    }

    const user = await requireUser();
    const verifiedState = verifyLinkedInState(state);
    if (verifiedState.userId !== user.id) {
      throw new Error("LinkedIn callback user did not match the signed state.");
    }

    const token = await exchangeCodeForToken(code);
    const profile = await getLinkedInProfile(token.access_token);
    await upsertLinkedInAccount({
      userId: user.id,
      linkedinMemberId: profile.sub,
      displayName: profile.name ?? null,
      picture: profile.picture ?? null,
      accessToken: token.access_token,
      refreshToken: token.refresh_token ?? null,
      expiresInSeconds: token.expires_in ?? null,
      scopes: token.scope ?? "",
    });

    destination.searchParams.set("linkedin", "connected");
    destination.searchParams.set("message", "LinkedIn connected. Run sync to import posts, analytics, and rebuild Content DNA.");
  } catch (error) {
    destination.searchParams.set("linkedin", "error");
    destination.searchParams.set("message", error instanceof Error ? error.message : "LinkedIn connection failed.");
  }

  return NextResponse.redirect(destination);
}
