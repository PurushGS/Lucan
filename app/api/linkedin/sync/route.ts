import { handleRouteError, jsonError, jsonOk } from "@/src/lib/api";
import { generateContentDna } from "@/src/lib/ai/generate";
import { requireUser } from "@/src/lib/auth/session";
import { getContentDnaRecord, upsertLinkedInContentDna } from "@/src/lib/db/dna";
import {
  getLinkedInAccount,
  getLinkedInAccountWithTokens,
  getLinkedInPostCorpus,
  saveLinkedInPostAnalytics,
  saveLinkedInPosts,
  saveLinkedInProfileMetrics,
} from "@/src/lib/db/linkedin";
import {
  fetchLinkedInMemberPosts,
  fetchLinkedInPostAnalytics,
  fetchLinkedInProfileMetrics,
  LinkedInApiError,
} from "@/src/lib/linkedin/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const user = await requireUser();
    const account = await getLinkedInAccountWithTokens(user.id);
    if (!account) {
      return jsonError("Connect LinkedIn before generating Content DNA.", 409, "LINKEDIN_NOT_CONNECTED");
    }

    const posts = await fetchLinkedInMemberPosts(account.accessToken, account.linkedinMemberId, 15);
    if (!posts.length) {
      return jsonError("No LinkedIn posts were found for this account yet.", 409, "NO_LINKEDIN_POSTS");
    }

    await saveLinkedInPosts({ userId: user.id, accountId: account.id, posts });
    const analyticsError = await syncAnalytics(user.id, account.id, account.accessToken, account.linkedinMemberId, posts);
    const corpus = await getLinkedInPostCorpus(user.id, account.id, 15);
    const profile = await generateContentDna(corpus.join("\n\n---\n\n"));
    const stats = summarizePosts(corpus);
    await upsertLinkedInContentDna({
      userId: user.id,
      linkedinAccountId: account.id,
      posts: corpus.join("\n\n---\n\n"),
      profile,
      postsAnalyzed: corpus.length,
      medianWords: stats.medianWords,
      stats,
    });

    return jsonOk({
      account: await getLinkedInAccount(user.id),
      dna: await getContentDnaRecord(user.id),
      analyticsError,
    });
  } catch (error) {
    if (error instanceof LinkedInApiError && error.status === 403) {
      return jsonError(
        "LinkedIn connected, but this app does not yet have approval to read member posts. Request r_member_social access in the LinkedIn developer app to import posts and build Content DNA.",
        403,
        "LINKEDIN_SCOPE_REQUIRED",
      );
    }

    return handleRouteError(error);
  }
}

async function syncAnalytics(
  userId: string,
  accountId: string,
  accessToken: string,
  linkedinMemberId: string,
  posts: Array<{ urn: string }>,
) {
  const analyticsErrors: string[] = [];

  try {
    const analytics = await fetchLinkedInPostAnalytics(accessToken, posts);
    await saveLinkedInPostAnalytics({ accountId, analytics });
  } catch (error) {
    if (error instanceof LinkedInApiError && error.status === 403) {
      analyticsErrors.push(
        "LinkedIn post analytics are not available yet. Request r_member_postAnalytics access to import impressions, reactions, comments, reposts, saves, clicks, and reach.",
      );
    } else {
      throw error;
    }
  }

  try {
    const metrics = await fetchLinkedInProfileMetrics(accessToken, linkedinMemberId);
    await saveLinkedInProfileMetrics({
      userId,
      accountId,
      followerCount: metrics.followerCount,
      connectionCount: metrics.connectionCount,
      raw: metrics.raw,
    });
  } catch (error) {
    if (error instanceof LinkedInApiError && error.status === 403) {
      analyticsErrors.push(
        "LinkedIn profile analytics are not available yet. Request r_member_profileAnalytics and r_1st_connections_size access to import followers and connection count.",
      );
    } else {
      throw error;
    }
  }

  return analyticsErrors.length ? analyticsErrors.join(" ") : null;
}

function summarizePosts(posts: string[]) {
  const wordCounts = posts.map((post) => post.split(/\s+/).filter(Boolean).length).sort((a, b) => a - b);
  const midpoint = Math.floor(wordCounts.length / 2);
  const medianWords =
    wordCounts.length % 2 === 0
      ? Math.round(((wordCounts[midpoint - 1] ?? 0) + (wordCounts[midpoint] ?? 0)) / 2)
      : wordCounts[midpoint] ?? 0;

  return {
    postsAnalyzed: posts.length,
    medianWords,
  };
}
