import { randomUUID } from "crypto";
import { createCreativeDocument } from "@/src/lib/creative/templates";
import { db } from "@/src/lib/db/client";
import { ensureSchema } from "@/src/lib/db/schema";
import type { ContentDnaProfile, LinkedInPostAnalytics, SourceType } from "@/src/types/lucan";

const seed = "reachcraft-demo";

type UserRow = {
  id: string;
  email: string | null;
  name: string | null;
};

type LinkedInAccountRow = {
  id: string;
  user_id: string;
  display_name: string | null;
};

type DemoPost = {
  urn: string;
  commentary: string;
  publishedAt: string;
  analytics: LinkedInPostAnalytics;
};

const profile: ContentDnaProfile = {
  identityCore:
    "Operator-led creator voice. Writes from experiments, team learnings, and practical growth systems instead of broad motivation.",
  voiceSignature:
    "Direct, specific, and lightly contrarian. Opens with a pattern break, explains the decision behind the tactic, and ends with one crisp takeaway.",
  contentPillars: [
    "AI-assisted content workflows",
    "LinkedIn growth systems",
    "Founder and operator lessons",
    "Audience research and positioning",
    "Repeatable content production",
  ],
  positioningLayer:
    "A builder who turns messy growth work into simple operating systems that teams can actually ship.",
  audienceField:
    "Founders, marketers, creators, and growth operators who want sharper LinkedIn presence without sounding automated.",
  hookStrategies: [
    "Start with a mistake most teams make.",
    "Compare the old workflow with the new workflow.",
    "Use a concrete metric or time saved.",
    "Name the hidden tradeoff before giving the tactic.",
    "Turn a private operating lesson into a public framework.",
  ],
  avoid: [
    "Generic AI hype",
    "Over-polished thought leadership",
    "Long motivational intros",
    "Unsupported numbers",
    "Hashtag stuffing",
  ],
};

async function main() {
  await ensureSchema();

  const user = await findSeedUser();
  const account = await findLinkedInAccount(user.id);

  if (!account) {
    throw new Error(
      `No LinkedIn account is connected for ${user.name ?? user.email ?? user.id}. Connect LinkedIn first, then run npm run db:seed-demo again.`,
    );
  }

  await clearPreviousSeed(user.id, account.id);

  const posts = buildDemoPosts();
  const drafts = buildDemoDrafts(posts);
  const generations = buildDemoGenerations();

  for (const post of posts) {
    await db.execute({
      sql: `insert into linkedin_posts (
          id,
          account_id,
          user_id,
          linkedin_post_urn,
          commentary,
          published_at,
          raw_json
        )
        values (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        randomUUID(),
        account.id,
        user.id,
        post.urn,
        post.commentary,
        post.publishedAt,
        JSON.stringify({ seed, importedFor: "demo", source: "seed-demo" }),
      ],
    });

    await db.execute({
      sql: `insert into linkedin_post_analytics (
          account_id,
          linkedin_post_urn,
          impressions,
          members_reached,
          reactions,
          comments,
          reshares,
          saves,
          sends,
          link_clicks,
          followers_gained,
          profile_views,
          raw_json
        )
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        account.id,
        post.urn,
        post.analytics.impressions,
        post.analytics.membersReached,
        post.analytics.reactions,
        post.analytics.comments,
        post.analytics.reshares,
        post.analytics.saves,
        post.analytics.sends,
        post.analytics.linkClicks,
        post.analytics.followersGained,
        post.analytics.profileViews,
        JSON.stringify({ seed, source: "seed-demo" }),
      ],
    });
  }

  await db.execute({
    sql: `insert into linkedin_profile_metrics (
        account_id,
        user_id,
        follower_count,
        connection_count,
        raw_json
      )
      values (?, ?, ?, ?, ?)
      on conflict(account_id) do update set
        follower_count = excluded.follower_count,
        connection_count = excluded.connection_count,
        raw_json = excluded.raw_json,
        synced_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
    args: [
      account.id,
      user.id,
      18420,
      500,
      JSON.stringify({
        seed,
        note: "Demo profile metrics until LinkedIn analytics access is approved.",
      }),
    ],
  });

  await db.execute({
    sql: "update linkedin_accounts set last_synced_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') where id = ?",
    args: [account.id],
  });

  await db.execute({
    sql: `insert into content_dna (
        user_id,
        input_posts,
        profile_json,
        linkedin_account_id,
        posts_analyzed,
        median_words,
        stats_json,
        analysis_source
      )
      values (?, ?, ?, ?, ?, ?, ?, 'linkedin')
      on conflict(user_id) do update set
        input_posts = excluded.input_posts,
        profile_json = excluded.profile_json,
        linkedin_account_id = excluded.linkedin_account_id,
        posts_analyzed = excluded.posts_analyzed,
        median_words = excluded.median_words,
        stats_json = excluded.stats_json,
        analysis_source = 'linkedin',
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
    args: [
      user.id,
      posts.map((post) => post.commentary).join("\n\n---\n\n"),
      JSON.stringify(profile),
      account.id,
      posts.length,
      median(posts.map((post) => wordCount(post.commentary))),
      JSON.stringify({
        seed,
        accountName: account.display_name,
        strongestThemes: ["AI workflows", "operator lessons", "content systems"],
        strongestHook: "practical contrarian opening",
      }),
    ],
  });

  for (const draft of drafts) {
    await db.execute({
      sql: `insert into drafts (
          id,
          user_id,
          source_type,
          source_value,
          title,
          content,
          status,
          scheduled_at,
          published_at,
          linkedin_post_urn
        )
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        randomUUID(),
        user.id,
        draft.sourceType,
        draft.sourceValue,
        draft.title,
        draft.content,
        draft.status,
        draft.scheduledAt,
        draft.publishedAt,
        draft.linkedinPostUrn,
      ],
    });
  }

  for (const generation of generations) {
    await db.execute({
      sql: `insert into generations (
          id,
          user_id,
          source_type,
          source_value,
          extracted_content,
          output,
          title,
          model
        )
        values (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        randomUUID(),
        user.id,
        generation.sourceType,
        generation.sourceValue,
        generation.extractedContent,
        generation.output,
        generation.title,
        "demo-seed",
      ],
    });
  }

  await seedCreativeDesigns(user.id);

  console.log(`Seeded Reachcraft demo data for ${user.name ?? user.email ?? user.id}.`);
  console.log(`LinkedIn account: ${account.display_name ?? account.id}`);
  console.log(`Posts: ${posts.length}, drafts: ${drafts.length}, generations: ${generations.length}, creative designs: 3.`);
}

async function findSeedUser(): Promise<UserRow> {
  const requestedUserId = process.env.DEMO_USER_ID;

  if (requestedUserId) {
    const result = await db.execute({
      sql: "select id, email, name from users where id = ?",
      args: [requestedUserId],
    });
    const row = result.rows[0];
    if (!row) throw new Error(`DEMO_USER_ID ${requestedUserId} was not found in users.`);
    return toUserRow(row);
  }

  const withLinkedIn = await db.execute({
    sql: `select u.id, u.email, u.name
      from users u
      inner join linkedin_accounts a on a.user_id = u.id
      order by a.connected_at desc
      limit 1`,
  });

  if (withLinkedIn.rows[0]) return toUserRow(withLinkedIn.rows[0]);

  const latestUser = await db.execute({
    sql: "select id, email, name from users order by updated_at desc limit 1",
  });

  if (!latestUser.rows[0]) {
    throw new Error("No users found. Log in locally once, connect LinkedIn, then run npm run db:seed-demo.");
  }

  return toUserRow(latestUser.rows[0]);
}

async function findLinkedInAccount(userId: string): Promise<LinkedInAccountRow | null> {
  const result = await db.execute({
    sql: "select id, user_id, display_name from linkedin_accounts where user_id = ?",
    args: [userId],
  });
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    display_name: row.display_name ? String(row.display_name) : null,
  };
}

async function clearPreviousSeed(userId: string, accountId: string) {
  await db.execute({
    sql: "delete from linkedin_post_analytics where account_id = ? and raw_json like ?",
    args: [accountId, `%${seed}%`],
  });
  await db.execute({
    sql: "delete from linkedin_posts where user_id = ? and account_id = ? and raw_json like ?",
    args: [userId, accountId, `%${seed}%`],
  });
  await db.execute({
    sql: "delete from drafts where user_id = ? and source_value like ?",
    args: [userId, `${seed}:%`],
  });
  await db.execute({
    sql: "delete from generations where user_id = ? and source_value like ?",
    args: [userId, `${seed}:%`],
  });
  await db.execute({
    sql: "delete from creative_designs where user_id = ? and title in (?, ?, ?)",
    args: [userId, "AI Workflow Carousel", "Content Engine Checklist", "Founder Lesson Quote"],
  });
}

function buildDemoPosts(): DemoPost[] {
  return [
    {
      urn: "urn:li:share:reachcraft-demo-001",
      publishedAt: daysAgoAt(2, 9),
      commentary:
        "Most teams do not have a content problem.\n\nThey have a context problem.\n\nThe best posts usually come from messy internal notes: customer objections, sales calls, failed experiments, product decisions.\n\nThe workflow that changed it for us:\n\n1. Capture the raw context immediately\n2. Tag it by audience pain\n3. Turn only the strongest signal into a post\n4. Keep the language close to how the team actually speaks\n\nAI helps after the thinking is clear. Not before.",
      analytics: metrics(12840, 9360, 528, 74, 41, 213, 18, 146, 39, 112),
    },
    {
      urn: "urn:li:share:reachcraft-demo-002",
      publishedAt: daysAgoAt(5, 18),
      commentary:
        "A simple rule for LinkedIn posts:\n\nIf the first line could be posted by any other company, rewrite it.\n\nSpecificity is the moat.\n\nBad: We help founders grow faster.\n\nBetter: We turn a 40-minute founder rant into 7 posts, 2 carousels, and a launch email while preserving the founder's voice.\n\nThe second one has a shape. The first one is fog.",
      analytics: metrics(9620, 7210, 388, 51, 29, 164, 11, 97, 28, 76),
    },
    {
      urn: "urn:li:share:reachcraft-demo-003",
      publishedAt: daysAgoAt(8, 11),
      commentary:
        "The hidden cost of posting daily is not writing.\n\nIt is deciding what deserves to be said.\n\nA good content system should reduce decisions:\n\n- What audience pain is this for?\n- What lived example proves it?\n- What should the reader do differently?\n\nWhen those answers exist, the post almost writes itself.",
      analytics: metrics(7150, 5190, 241, 36, 18, 92, 7, 64, 17, 49),
    },
    {
      urn: "urn:li:share:reachcraft-demo-004",
      publishedAt: daysAgoAt(12, 15),
      commentary:
        "We stopped asking AI to write finished posts.\n\nNow we ask it to find the tension:\n\nWhat is surprising here?\nWhat is the tradeoff?\nWhat would a smart reader push back on?\nWhat line sounds too generic?\n\nThat one change made the output less polished and more useful.",
      analytics: metrics(15880, 10890, 671, 96, 57, 254, 24, 188, 44, 138),
    },
    {
      urn: "urn:li:share:reachcraft-demo-005",
      publishedAt: daysAgoAt(16, 8),
      commentary:
        "A founder's Content DNA is not a list of adjectives.\n\nIt is a repeatable pattern:\n\n- topics they keep returning to\n- words they naturally use\n- examples they trust\n- arguments they avoid\n- proof they consider credible\n\nOnce you capture that, content stops sounding like a brand account and starts sounding like a person.",
      analytics: metrics(11290, 8560, 442, 68, 34, 181, 14, 121, 33, 88),
    },
    {
      urn: "urn:li:share:reachcraft-demo-006",
      publishedAt: daysAgoAt(20, 19),
      commentary:
        "The posts that travel outside your network usually do one thing well:\n\nThey make the reader feel smarter in under 10 seconds.\n\nNot impressed.\nNot sold.\nSmarter.\n\nThat means fewer broad claims and more useful distinctions.",
      analytics: metrics(6420, 4880, 207, 29, 16, 71, 5, 43, 12, 35),
    },
    {
      urn: "urn:li:share:reachcraft-demo-007",
      publishedAt: daysAgoAt(26, 10),
      commentary:
        "The best content calendar is not a calendar first.\n\nIt is an evidence bank.\n\nCustomer quote. Failed launch. New objection. Internal debate. Surprising metric. Strong belief.\n\nSchedule after the raw material is real.",
      analytics: metrics(8875, 6720, 331, 42, 22, 119, 9, 83, 21, 64),
    },
  ];
}

function buildDemoDrafts(posts: DemoPost[]) {
  return [
    {
      sourceType: "topic" as SourceType,
      sourceValue: `${seed}:topic:founder-content-system`,
      title: "Founder content should start from messy notes",
      status: "draft",
      scheduledAt: null,
      publishedAt: null,
      linkedinPostUrn: null,
      content:
        "Most founder content gets worse when it starts in a blank editor.\n\nThe better starting point is messier: customer calls, internal debates, Loom rants, product decisions, and questions the team keeps answering.\n\nThat raw context carries the founder's real voice.\n\nAI should organize it, not replace it.",
    },
    {
      sourceType: "article" as SourceType,
      sourceValue: `${seed}:article:https://example.com/ai-content-ops`,
      title: "AI content ops needs a human quality bar",
      status: "scheduled",
      scheduledAt: daysFromNowAt(1, 9),
      publishedAt: null,
      linkedinPostUrn: null,
      content:
        "AI can make content production faster.\n\nBut speed without taste just creates more average posts.\n\nThe quality bar should be simple:\n\n- Is the hook specific?\n- Is the example lived?\n- Is the claim useful without the tool?\n- Would the founder actually say this?\n\nThat is the difference between automation and leverage.",
    },
    {
      sourceType: "youtube" as SourceType,
      sourceValue: `${seed}:youtube:https://youtube.com/watch?v=demo-founder-interview`,
      title: "Turn a founder interview into a point of view",
      status: "scheduled",
      scheduledAt: daysFromNowAt(3, 18),
      publishedAt: null,
      linkedinPostUrn: null,
      content:
        "A founder interview should not become a transcript summary.\n\nIt should become a point of view.\n\nThe useful move is to extract:\n\n1. The belief behind the story\n2. The tradeoff they accepted\n3. The lesson another operator can use\n\nThat is where the post lives.",
    },
    {
      sourceType: "pdf" as SourceType,
      sourceValue: `${seed}:pdf:q3-linkedin-playbook.pdf`,
      title: "What we learned from reviewing 40 LinkedIn posts",
      status: "draft",
      scheduledAt: null,
      publishedAt: null,
      linkedinPostUrn: null,
      content:
        "After reviewing 40 posts, the pattern was obvious.\n\nThe high-performing posts were not more dramatic.\n\nThey were clearer.\n\nThey used one idea, one example, and one takeaway. The weak posts tried to sound complete. The strong ones made a useful distinction and stopped.",
    },
    {
      sourceType: "topic" as SourceType,
      sourceValue: `${seed}:topic:content-dna-launch`,
      title: "Content DNA is an operating system",
      status: "published",
      scheduledAt: null,
      publishedAt: daysAgoAt(1, 11),
      linkedinPostUrn: posts[0]?.urn ?? null,
      content:
        "Content DNA is not a writing preset.\n\nIt is an operating system for preserving how a person thinks in public.\n\nOnce you know their hooks, examples, beliefs, and boundaries, every draft has a better chance of sounding like them.",
    },
    {
      sourceType: "article" as SourceType,
      sourceValue: `${seed}:article:https://example.com/network-reach`,
      title: "Reach starts with relevance",
      status: "published",
      scheduledAt: null,
      publishedAt: daysAgoAt(6, 18),
      linkedinPostUrn: posts[1]?.urn ?? null,
      content:
        "Reach is downstream of relevance.\n\nBefore optimizing timing, hashtags, or post length, answer this:\n\nWho is meant to feel seen by this post?\n\nWhen that answer is sharp, distribution has something to work with.",
    },
  ];
}

function buildDemoGenerations() {
  return [
    {
      sourceType: "topic" as SourceType,
      sourceValue: `${seed}:generation:content-dna`,
      title: "Content DNA is not a preset",
      extractedContent: "Raw topic: explain why writing style should come from historical LinkedIn posts.",
      output:
        "A writing preset can copy surface style.\n\nContent DNA should copy decision patterns: what the person notices, how they prove ideas, and where they refuse to sound generic.",
    },
    {
      sourceType: "youtube" as SourceType,
      sourceValue: `${seed}:generation:founder-interview`,
      title: "Founder interviews need a sharper edit",
      extractedContent: "Demo transcript notes about using founder interviews for LinkedIn content.",
      output:
        "Do not summarize a founder interview. Mine it.\n\nFind the opinion, the scar tissue, and the useful distinction. That is what makes the post feel earned.",
    },
    {
      sourceType: "pdf" as SourceType,
      sourceValue: `${seed}:generation:playbook`,
      title: "A practical content playbook",
      extractedContent: "Demo PDF notes with hooks, best times, and post review criteria.",
      output:
        "The practical content playbook is boring in the best way: capture signal, draft with constraints, score honestly, schedule where history says attention is highest.",
    },
    {
      sourceType: "article" as SourceType,
      sourceValue: `${seed}:generation:distribution`,
      title: "Distribution rewards clarity",
      extractedContent: "Demo article summary about social distribution and audience specificity.",
      output:
        "Distribution does not rescue unclear thinking.\n\nIt rewards the post that tells the right reader: this was written for you.",
    },
  ];
}

async function seedCreativeDesigns(userId: string) {
  const designs = [
    {
      title: "AI Workflow Carousel",
      kind: "carousel" as const,
      document: createCreativeDocument({
        templateId: "lucan-advocacy-first",
        title: "Stop asking AI for final posts",
        slides: [
          {
            index: 1,
            headline: "Stop asking AI for final posts",
            body: "Ask it to find the tension, then write from your point of view.",
          },
          {
            index: 2,
            headline: "The better prompt",
            body: "What is surprising, specific, and actually useful here?",
          },
          {
            index: 3,
            headline: "The output gets less generic",
            body: "Because the draft starts with judgment instead of decoration.",
          },
        ],
      }),
    },
    {
      title: "Content Engine Checklist",
      kind: "carousel" as const,
      document: createCreativeDocument({
        templateId: "lucan-checklist",
        title: "A content system needs three inputs",
        slides: [
          {
            index: 1,
            headline: "A content system needs three inputs",
            body: "Audience pain, lived proof, and one useful takeaway.",
          },
          {
            index: 2,
            headline: "Everything else is polish",
            body: "Timing helps. Design helps. But signal comes first.",
          },
        ],
      }),
    },
    {
      title: "Founder Lesson Quote",
      kind: "image" as const,
      document: createCreativeDocument({
        templateId: "lucan-quote-frame",
        title: "Specificity is the moat.",
        slides: [
          {
            index: 1,
            headline: "Specificity is the moat.",
            body: "If the first line could be posted by anyone, rewrite it.",
          },
        ],
        format: "square",
      }),
    },
  ];

  for (const design of designs) {
    await db.execute({
      sql: `insert into creative_designs (
          id,
          user_id,
          title,
          kind,
          format,
          width,
          height,
          document_json
        )
        values (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        randomUUID(),
        userId,
        design.title,
        design.kind,
        design.document.format,
        design.document.width,
        design.document.height,
        JSON.stringify(design.document),
      ],
    });
  }
}

function metrics(
  impressions: number,
  membersReached: number,
  reactions: number,
  comments: number,
  reshares: number,
  saves: number,
  sends: number,
  linkClicks: number,
  followersGained: number,
  profileViews: number,
): LinkedInPostAnalytics {
  return {
    impressions,
    membersReached,
    reactions,
    comments,
    reshares,
    saves,
    sends,
    linkClicks,
    followersGained,
    profileViews,
  };
}

function toUserRow(row: Record<string, unknown>): UserRow {
  return {
    id: String(row.id),
    email: row.email ? String(row.email) : null,
    name: row.name ? String(row.name) : null,
  };
}

function daysAgoAt(days: number, hour: number) {
  return daysRelativeAt(-days, hour);
}

function daysFromNowAt(days: number, hour: number) {
  return daysRelativeAt(days, hour);
}

function daysRelativeAt(days: number, hour: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 30, 0, 0);
  return date.toISOString();
}

function wordCount(value: string) {
  return value.split(/\s+/).filter(Boolean).length;
}

function median(values: number[]) {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (!sorted.length) return 0;
  if (sorted.length % 2 === 1) return sorted[middle] ?? 0;
  return Math.round(((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
