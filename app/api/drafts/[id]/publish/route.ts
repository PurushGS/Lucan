import { handleRouteError, jsonError, jsonOk } from "@/src/lib/api";
import { requireUser } from "@/src/lib/auth/session";
import { getDraft, markDraftPublished } from "@/src/lib/db/drafts";
import { getLinkedInAccountWithTokens } from "@/src/lib/db/linkedin";
import { LinkedInApiError, publishLinkedInPost } from "@/src/lib/linkedin/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const [draft, account] = await Promise.all([getDraft(user.id, id), getLinkedInAccountWithTokens(user.id)]);

    if (!draft) {
      return jsonError("Draft not found.", 404, "DRAFT_NOT_FOUND");
    }

    if (!account) {
      return jsonError("Connect LinkedIn before publishing.", 409, "LINKEDIN_NOT_CONNECTED");
    }

    const result = await publishLinkedInPost({
      accessToken: account.accessToken,
      memberId: account.linkedinMemberId,
      postText: draft.content,
    });

    await markDraftPublished({
      id,
      userId: user.id,
      linkedinPostUrn: result.urn,
    });

    return jsonOk({
      draft: await getDraft(user.id, id),
      linkedin: result,
    });
  } catch (error) {
    if (error instanceof LinkedInApiError && error.status === 403) {
      return jsonError(
        "LinkedIn connected, but this app does not have permission to publish posts. Request w_member_social access before publishing live.",
        403,
        "LINKEDIN_SCOPE_REQUIRED",
      );
    }

    return handleRouteError(error);
  }
}
