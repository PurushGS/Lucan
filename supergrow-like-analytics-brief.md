# Supergrow-Like Analytics Brief

Use this brief to build a Supergrow-like analytics experience without copying Supergrow's code, branding, assets, or private implementation. The goal is to mimic the product behavior and data flow: authenticated workspace context, LinkedIn account selection, Trends metrics, Weekly Report summaries, and supporting app shell data.

## Product Goal

Build an analytics dashboard for creators or teams who publish on LinkedIn.

The app should let a user:

- Select a workspace.
- Select a connected LinkedIn profile or company page.
- View a Trends tab with recent performance metrics.
- View a Weekly Report tab with generated narrative/report insights.
- See account profile metadata such as name, headline, follower count, connection count, avatar, and LinkedIn URL.
- Filter Trends by date range: 7 days, 30 days, 90 days, or custom range.

## Route Shape

Use URL params to preserve selected context:

```text
/analytics?workspace_id=<workspace_id>&user_id=<linkedin_account_id>&tab=overview
/analytics?workspace_id=<workspace_id>&user_id=<linkedin_account_id>&tab=weekly-report
```

Recommended tab values:

```text
overview       -> Trends tab
weekly-report  -> Weekly Report tab
leads          -> future/locked Leads tab
```

## Request Context

Every first-party API request should include the current workspace/account context.

Example headers:

```http
Authorization: Bearer <app_access_token>
WorkspaceID: <workspace_id>
OrgID: <org_id>
Timezone: <browser_timezone>
```

Do not expose provider tokens to the frontend if you can avoid it. If your backend needs LinkedIn tokens, keep them server-side.

## Core Endpoints

These endpoints model the data dependencies seen in the Supergrow-like flow.

### User Settings

```http
GET /api/v1/user_settings
```

Purpose: user preferences, onboarding flags, UI settings.

Example response:

```json
{
  "settings": {
    "timezone": "Asia/Kolkata",
    "default_date_range": "last30Days",
    "analytics_onboarding_dismissed": true
  }
}
```

### Current User

```http
GET /api/v1/users/me
```

Purpose: app user identity and billing/subscription flags.

Example response:

```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "Purushotham Raju",
  "plan_name": "pro",
  "org_id": "org_123"
}
```

### User Info

```http
GET /api/v1/user_infos
```

Purpose: onboarding/profile metadata.

Example response:

```json
{
  "user_info": {
    "onboarding_completed": true,
    "source_of_discovery": "search",
    "linked_in_profile_url": "https://www.linkedin.com/in/example"
  }
}
```

### Workspaces

```http
GET /api/v1/workspaces
```

Purpose: workspace switcher and current workspace validation.

Example response:

```json
{
  "workspaces": [
    {
      "id": "47b4efd3-8000-46a5-9630-14ab228b017f",
      "name": "Purshotham Raju's Workspace",
      "role": "admin"
    }
  ]
}
```

### LinkedIn Integration Status

```http
GET /api/v1/linkedin/integrations/check
```

Purpose: decide whether analytics setup is complete or the user needs to connect/reconnect LinkedIn.

Example response:

```json
{
  "connected": true,
  "needs_reconnect": false,
  "needs_v3_migration": false
}
```

### Connected LinkedIn Profiles

```http
GET /api/v1/linkedin/integrations
```

Purpose: populate profile selector and default analytics target.

Example response:

```json
{
  "integrations": [
    {
      "user_id": "s_X8epv5b1",
      "type": "profile",
      "name": "Purushothama Jagannatha",
      "headline": "Founder | Creator | Builder",
      "avatar_url": "https://cdn.example.com/avatar.png",
      "linked_in_profile_url": "https://www.linkedin.com/in/example",
      "num_of_followers": 1005,
      "num_of_connections": 961,
      "created_at": "2026-08-01T00:00:00Z",
      "needs_v3_migration": false
    }
  ]
}
```

### Connected Company Pages

```http
GET /api/v1/linked_in_company_pages
```

Purpose: add company pages to the analytics target selector.

Example response:

```json
{
  "linked_in_company_pages": [
    {
      "id": "company_page_123",
      "page_id": "company_page_123",
      "type": "company_page",
      "name": "Example Company",
      "logo_url": "https://cdn.example.com/logo.png",
      "follower_count": 12000
    }
  ]
}
```

## Trends Tab

Route:

```text
/analytics?workspace_id=<workspace_id>&user_id=<linkedin_account_id>&tab=overview
```

Main data endpoint:

```http
POST /api/v1/analytics/v2/cards
```

Default date range:

- `last30Days`
- If today is `2026-09-02`, use `start_date: "2026-08-04"` and `end_date: "2026-09-02"`.

Request body for a LinkedIn profile:

```json
{
  "linkedin_account_id": "s_X8epv5b1",
  "cards_request": [
    {
      "type": "followers_trend",
      "params": {
        "start_date": "2026-08-04",
        "end_date": "2026-09-02"
      }
    },
    {
      "type": "impressions_trend",
      "params": {
        "start_date": "2026-08-04",
        "end_date": "2026-09-02"
      }
    },
    {
      "type": "reactions_trend",
      "params": {
        "start_date": "2026-08-04",
        "end_date": "2026-09-02"
      }
    },
    {
      "type": "comments_trend",
      "params": {
        "start_date": "2026-08-04",
        "end_date": "2026-09-02"
      }
    },
    {
      "type": "reshares_trend",
      "params": {
        "start_date": "2026-08-04",
        "end_date": "2026-09-02"
      }
    },
    {
      "type": "posts_performance",
      "params": {
        "start_date": "2026-08-04",
        "end_date": "2026-09-02",
        "limit": 100
      }
    }
  ]
}
```

For company pages, include:

```json
{
  "linked_in_company_page_id": "company_page_123"
}
```

LLM-ready mocked response shape:

This mock is based on the Trends screen that rendered for `user_id=s_X8epv5b1` on `2026-09-02`. The exact backend response can use different field names, but your frontend should normalize it into this structure before rendering.

```json
{
  "sync_pending": false,
  "account_info": {
    "follower_count": 1005,
    "connections_count": 961,
    "profile_url": "https://www.linkedin.com/in/purushothama-jagannatha-9b074a151"
  },
  "cards": [
    {
      "type": "followers_trend",
      "success": true,
      "data": {
        "label": "New followers",
        "total": 5,
        "display_total": "+5",
        "percentage_change": 1,
        "percentage_unit": "%",
        "comparison_label": "vs. prev. 30 days",
        "series": [
          { "x": "2026-08-04", "y": 1000 },
          { "x": "2026-08-11", "y": 1000 },
          { "x": "2026-08-18", "y": 1001 },
          { "x": "2026-08-25", "y": 1002 },
          { "x": "2026-09-02", "y": 1005 }
        ]
      }
    },
    {
      "type": "impressions_trend",
      "success": true,
      "data": {
        "label": "Impressions",
        "total": 552,
        "display_total": "552",
        "percentage_change": 1,
        "percentage_unit": "%",
        "comparison_label": "vs. prev. 30 days",
        "series": [
          { "x": "2026-08-04", "y": 30 },
          { "x": "2026-08-11", "y": 85 },
          { "x": "2026-08-18", "y": 140 },
          { "x": "2026-08-25", "y": 178 },
          { "x": "2026-09-01", "y": 119 }
        ]
      }
    },
    {
      "type": "engagement_rate",
      "success": true,
      "data": {
        "label": "Engagement",
        "total": 5.3,
        "display_total": "5.3%",
        "percentage_change": 0.4,
        "percentage_unit": "pt",
        "comparison_label": "vs. prev. 30 days",
        "series": [
          { "x": "2026-08-04", "y": 4.8 },
          { "x": "2026-08-11", "y": 4.9 },
          { "x": "2026-08-18", "y": 5.0 },
          { "x": "2026-08-25", "y": 5.1 },
          { "x": "2026-09-02", "y": 5.3 }
        ]
      }
    },
    {
      "type": "reactions_trend",
      "success": true,
      "data": {
        "label": "Reactions",
        "total": 30,
        "display_total": "30",
        "percentage_change": 8,
        "percentage_unit": "%",
        "comparison_label": "vs. prev. 30 days",
        "series": [
          { "x": "2026-08-04", "y": 2 },
          { "x": "2026-08-11", "y": 6 },
          { "x": "2026-08-18", "y": 8 },
          { "x": "2026-08-25", "y": 9 },
          { "x": "2026-09-02", "y": 5 }
        ]
      }
    },
    {
      "type": "comments_trend",
      "success": true,
      "data": {
        "label": "Comments",
        "total": -1,
        "display_total": "-1",
        "percentage_change": null,
        "percentage_unit": null,
        "comparison_label": null,
        "series": [
          { "x": "2026-08-04", "y": 0 },
          { "x": "2026-08-11", "y": 0 },
          { "x": "2026-08-18", "y": 0 },
          { "x": "2026-08-25", "y": 0 },
          { "x": "2026-09-02", "y": -1 }
        ]
      }
    },
    {
      "type": "reshares_trend",
      "success": true,
      "data": {
        "label": "Reposts",
        "total": 0,
        "display_total": "0",
        "percentage_change": null,
        "percentage_unit": null,
        "comparison_label": null,
        "series": [
          { "x": "2026-08-04", "y": 0 },
          { "x": "2026-08-11", "y": 0 },
          { "x": "2026-08-18", "y": 0 },
          { "x": "2026-08-25", "y": 0 },
          { "x": "2026-09-02", "y": 0 }
        ]
      }
    },
    {
      "type": "posts_performance",
      "success": true,
      "data": {
        "summary": {
          "posts": 1,
          "impressions": 119,
          "likes": 5,
          "comments": 0,
          "reshares": 0,
          "avg_engagement_rate": 4.2,
          "last_updated_text": "24m ago"
        },
        "posts": [
          {
            "id": "post_123",
            "text_preview": "AI is doing the thinking now. I've seen it in my own workflow. You reach for the AI before you've e...",
            "external_url": "https://www.linkedin.com/feed/update/urn:li:share:7500494224946130944",
            "published_at": "2026-09-01T00:00:00Z",
            "impressions": 119,
            "likes": 5,
            "comments": 0,
            "reshares": 0,
            "engagement_rate": 4.2
          }
        ]
      }
    }
  ]
}
```

Recommended frontend normalization:

```ts
type AnalyticsCardType =
  | "followers_trend"
  | "impressions_trend"
  | "engagement_rate"
  | "reactions_trend"
  | "comments_trend"
  | "reshares_trend"
  | "posts_performance";

type TrendMetricCard = {
  type: AnalyticsCardType;
  label: string;
  total: number;
  displayTotal: string;
  percentageChange: number | null;
  percentageUnit: "%" | "pt" | null;
  comparisonLabel: string | null;
  series: Array<{ x: string; y: number }>;
};

type PostPerformanceRow = {
  id: string;
  textPreview: string;
  externalUrl: string;
  publishedAt: string;
  impressions: number;
  likes: number;
  comments: number;
  reshares: number;
  engagementRate: number;
};
```

### Trends Rendering Requirements

Render these stat cards:

- Impressions
- Engagement
- New followers
- Reactions
- Comments
- Reposts

Render a profile summary:

- Avatar
- Name
- Headline
- Number of followers
- Connections
- View profile link

Render a post-by-post table:

- Post text preview
- Date
- Impressions
- Likes
- Comments
- Reshares
- Engagement rate

Render date-range controls:

- 7 days
- 30 days
- 90 days
- Custom

When the date range changes, call `/api/v1/analytics/v2/cards` again with the new `start_date` and `end_date`.

## Weekly Report Tab

Route:

```text
/analytics?workspace_id=<workspace_id>&user_id=<linkedin_account_id>&tab=weekly-report
```

List endpoint:

```http
GET /api/v1/analytics/weekly_reports?limit=12&linked_in_account_id=<linkedin_account_id>
```

Purpose: populate report list and week picker.

Example response:

```json
{
  "weekly_reports": [
    {
      "week_label": "Aug 31 - Sep 6",
      "week_start_date": "2026-08-31",
      "week_end_date": "2026-09-06",
      "status": "generated"
    }
  ]
}
```

Detail endpoint:

```http
GET /api/v1/analytics/weekly_reports/<week_start_date>?linked_in_account_id=<linkedin_account_id>
```

Example:

```http
GET /api/v1/analytics/weekly_reports/2026-08-31?linked_in_account_id=s_X8epv5b1
```

Recommended response shape:

```json
{
  "weekly_report": {
    "week_label": "Aug 31 - Sep 6",
    "week_start_date": "2026-08-31",
    "week_end_date": "2026-09-06",
    "summary": {
      "posts_published": 3,
      "total_engagements": 120,
      "vs_baseline_percentage": 18
    },
    "audience_growth": {
      "impressions": {
        "this_week_total": 2400,
        "wow_change_percentage": 12
      },
      "followers": {
        "current_count": 1005,
        "this_week_change": 5
      }
    },
    "best_performer": {
      "post_id": "post_123",
      "multiplier": 2.4,
      "insight": {
        "winning_formula": "A strong personal observation followed by a practical takeaway.",
        "repeat_this": "Open with a sharp contrast from your own workflow."
      }
    },
    "worst_performer": {
      "post_id": "post_456",
      "multiplier": 0.5,
      "insight": {
        "main_problem": "The hook was too abstract.",
        "rewritten_hook": "I stopped using AI for answers. I started using it for better questions."
      }
    },
    "posts_breakdown": [
      {
        "id": "post_123",
        "text_preview": "AI is doing the thinking now...",
        "external_url": "https://www.linkedin.com/feed/update/...",
        "published_at": "2026-09-01T00:00:00Z",
        "performance_multiplier": 2.4,
        "total_engagement": 5,
        "breakdown": {
          "likes": 5,
          "comments": 0,
          "reposts": 0
        },
        "analysis": {
          "do_more": "Use concrete first-person observations.",
          "do_less": "Avoid generic productivity claims.",
          "next_post_idea": "Write about the first workflow you changed after adopting AI.",
          "engagement_tip": "End with a direct question."
        }
      }
    ],
    "content_suggestion": {
      "inferred_category": "AI workflow",
      "article": {
        "title": "Example industry article",
        "source": "Example Source",
        "url": "https://example.com/article",
        "hot_take_score": 82,
        "why_react": "This topic aligns with your recent posts.",
        "suggested_angle": "Explain what builders misunderstand about AI delegation."
      }
    }
  }
}
```

Empty state:

```json
{
  "weekly_reports": []
}
```

Frontend copy for empty state:

```text
No weekly reports yet.
Your first report will arrive on Sunday after you've posted at least once that week.
Reports are generated every Sunday at midnight UTC.
```

## LLM Implementation Prompt

Copy this into your coding LLM:

```text
Build a Supergrow-like LinkedIn analytics dashboard. Do not copy Supergrow branding, source code, layouts exactly, or assets. Implement a similar product workflow using original UI.

Create an /analytics route that accepts workspace_id, user_id, and tab query params. Supported tabs are overview for Trends, weekly-report for Weekly Report, and leads as a disabled/coming-soon tab.

The page should fetch app shell data from:
- GET /api/v1/user_settings
- GET /api/v1/users/me
- GET /api/v1/user_infos
- GET /api/v1/workspaces
- GET /api/v1/linkedin/integrations/check
- GET /api/v1/linkedin/integrations
- GET /api/v1/linked_in_company_pages

For the Trends tab, call POST /api/v1/analytics/v2/cards with linkedin_account_id and cards_request. The default range is last30Days. Include card types followers_trend, impressions_trend, reactions_trend, comments_trend, reshares_trend, and posts_performance. Render stat cards for impressions, engagement, new followers, reactions, comments, and reposts. Render a profile summary and a post-by-post breakdown table.

For the Weekly Report tab, call GET /api/v1/analytics/weekly_reports?limit=12&linked_in_account_id=<id>. If reports exist, select the first generated/sent report and call GET /api/v1/analytics/weekly_reports/<week_start_date>?linked_in_account_id=<id>. Render week summary, audience growth, best/worst performer, post breakdown, and content suggestion. If no reports exist, show an empty state.

Use mock API handlers first if the backend does not exist yet. Keep provider tokens server-side. Use workspace_id and org_id as request context. Make the UI responsive and dense enough for repeated use: sidebar, top profile selector, tab bar, date range controls, metric cards, charts, and tables.
```
