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
import { getMissingLinkedInScopes } from "@/src/lib/linkedin/config";
import type { AppUser } from "@/src/types/lucan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SyncStage = "profile" | "permissions" | "posts" | "analytics" | "dna";
type SyncStepStatus = "active" | "complete" | "skipped";
type SyncEvent =
  | { type: "step"; stage: SyncStage; status: SyncStepStatus; message: string }
  | { type: "complete"; message: string; analyticsError: string | null }
  | { type: "error"; error: { code: string; message: string; status: number }; stage?: SyncStage };

type SyncEmitter = (event: SyncEvent) => void | Promise<void>;

export async function POST(request: Request) {
  if (request.headers.get("accept")?.includes("application/x-ndjson")) {
    return streamLinkedInSync();
  }

  try {
    const user = await requireUser();
    return jsonOk(await runLinkedInSync(user));
  } catch (error) {
    const syncError = getSyncError(error);
    if (syncError) return jsonError(syncError.message, syncError.status, syncError.code);

    return handleRouteError(error);
  }
}

function streamLinkedInSync() {
  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      async start(controller) {
        const emit: SyncEmitter = (event) => {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        };

        try {
          const user = await requireUser();
          const result = await runLinkedInSync(user, emit);
          await emit({
            type: "complete",
            message: result.analyticsError
              ? `Content DNA saved. ${result.analyticsError}`
              : "Content DNA saved with LinkedIn analytics.",
            analyticsError: result.analyticsError,
          });
        } catch (error) {
          await emit({ type: "error", error: getSyncError(error) ?? fallbackSyncError() });
        } finally {
          controller.close();
        }
      },
    }),
    {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/x-ndjson; charset=utf-8",
      },
    },
  );
}

async function runLinkedInSync(user: AppUser, emit: SyncEmitter = () => undefined) {
  await emit({ type: "step", stage: "profile", status: "active", message: "Checking the connected LinkedIn profile." });
  const account = await getLinkedInAccountWithTokens(user.id);
  if (!account) {
    throw syncFailure("Connect LinkedIn before generating Content DNA.", 409, "LINKEDIN_NOT_CONNECTED");
  }
  await emit({
    type: "step",
    stage: "profile",
    status: "complete",
    message: account.displayName ? `Connected as ${account.displayName}.` : "LinkedIn profile is connected.",
  });

  await emit({ type: "step", stage: "permissions", status: "active", message: "Checking LinkedIn post permissions." });
  const missingPostScopes = getMissingLinkedInScopes(account.scopes, ["r_member_social"]);
  if (missingPostScopes.length) {
    throw syncFailure(
      "LinkedIn is connected for profile only. Add the LinkedIn member-post permission, request it in LINKEDIN_SCOPES, then reconnect LinkedIn to import real posts and build Content DNA.",
      403,
      "LINKEDIN_SCOPE_REQUIRED",
    );
  }
  await emit({ type: "step", stage: "permissions", status: "complete", message: "LinkedIn post import permission is available." });

  await emit({ type: "step", stage: "posts", status: "active", message: "Importing recent LinkedIn posts." });
  const posts = await fetchLinkedInMemberPosts(account.accessToken, account.linkedinMemberId, 15);
  if (!posts.length) {
    throw syncFailure("No LinkedIn posts were found for this account yet.", 409, "NO_LINKEDIN_POSTS");
  }
  await saveLinkedInPosts({ userId: user.id, accountId: account.id, posts });
  await emit({ type: "step", stage: "posts", status: "complete", message: `Imported ${posts.length} recent LinkedIn posts.` });

  const analyticsError = await syncAnalytics(user.id, account.id, account.accessToken, account.linkedinMemberId, account.scopes, posts, emit);
  const corpus = await getLinkedInPostCorpus(user.id, account.id, 15);
  const dnaInput = buildDnaInput({
    displayName: account.displayName,
    posts: corpus,
  });

  await emit({ type: "step", stage: "dna", status: "active", message: "Analyzing posting style, tone, hooks, topics, and rhythm." });
  const profile = await generateContentDna(dnaInput);
  const stats = summarizePosts(corpus);
  await upsertLinkedInContentDna({
    userId: user.id,
    linkedinAccountId: account.id,
    posts: dnaInput,
    profile,
    postsAnalyzed: corpus.length,
    medianWords: stats.medianWords,
    stats,
  });
  await emit({ type: "step", stage: "dna", status: "complete", message: "Content DNA rebuilt from imported LinkedIn history." });

  return {
    account: await getLinkedInAccount(user.id),
    dna: await getContentDnaRecord(user.id),
    analyticsError,
  };
}

async function syncAnalytics(
  userId: string,
  accountId: string,
  accessToken: string,
  linkedinMemberId: string,
  scopes: string,
  posts: Array<{ urn: string }>,
  emit: SyncEmitter,
) {
  const analyticsErrors: string[] = [];

  await emit({ type: "step", stage: "analytics", status: "active", message: "Importing post and profile analytics from LinkedIn." });
  const missingPostAnalyticsScopes = getMissingLinkedInScopes(scopes, ["r_member_postAnalytics"]);
  if (missingPostAnalyticsScopes.length) {
    analyticsErrors.push(
      "LinkedIn post analytics are not available yet. Request r_member_postAnalytics access to import impressions, reactions, comments, reposts, saves, clicks, and reach.",
    );
  } else {
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
  }

  const missingProfileScopes = getMissingLinkedInScopes(scopes, ["r_member_profileAnalytics", "r_1st_connections_size"]);
  if (missingProfileScopes.length) {
    analyticsErrors.push(
      "LinkedIn profile analytics are not available yet. Request r_member_profileAnalytics and r_1st_connections_size access to import followers and connection count.",
    );
  } else {
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
  }

  await emit({
    type: "step",
    stage: "analytics",
    status: analyticsErrors.length ? "skipped" : "complete",
    message: analyticsErrors.length ? analyticsErrors.join(" ") : "LinkedIn analytics imported.",
  });

  return analyticsErrors.length ? analyticsErrors.join(" ") : null;
}

function buildDnaInput(input: { displayName: string | null; posts: string[] }) {
  return [
    `LinkedIn profile name: ${input.displayName || "Not available"}`,
    "Analyze the following LinkedIn post history to infer writing style, tone, topic patterns, hook behavior, narrative structure, sentence rhythm, point-of-view, and what to avoid.",
    ...input.posts.map((post, index) => `Post ${index + 1}:\n${post}`),
  ].join("\n\n---\n\n");
}

function syncFailure(message: string, status: number, code: string) {
  return Object.assign(new Error(message), { syncStatus: status, syncCode: code });
}

function getSyncError(error: unknown) {
  if (error instanceof Response) {
    return error.status === 401
      ? { message: "Please sign in again to continue.", status: 401, code: "UNAUTHORIZED" }
      : { message: "Something went wrong. Please try again.", status: error.status || 500, code: "REQUEST_FAILED" };
  }

  if (error instanceof LinkedInApiError && error.status === 403) {
    return {
      message:
        "LinkedIn connected, but this app does not yet have approval to read member posts. Request r_member_social access in the LinkedIn developer app to import posts and build Content DNA.",
      status: 403,
      code: "LINKEDIN_SCOPE_REQUIRED",
    };
  }

  if (error instanceof Error && "syncStatus" in error && "syncCode" in error) {
    return {
      message: error.message,
      status: Number(error.syncStatus),
      code: String(error.syncCode),
    };
  }

  return null;
}

function fallbackSyncError() {
  return { message: "Could not sync LinkedIn right now. Please try again.", status: 500, code: "SYNC_FAILED" };
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
