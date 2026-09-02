---
name: Dashboard cards
modules: Dashboard
method: GET
path: /dashboard/cards
base_url: https://api.supergrow.ai/api/v1
source: Frontend bundle requestFactory export Ar/ar. Helpful for the main dashboard surface.
---

# Dashboard cards

## Why this API matters

Hydrates the top-level dashboard cards, usually totals and recent publishing/account metrics.

## Frontend usage

Render dashboard KPI tiles, counts, and recent/upcoming content summaries.

## Request

```json
{
  "method": "GET",
  "url": "https://api.supergrow.ai/api/v1/dashboard/cards",
  "headers": {
    "Authorization": "Bearer <ACCESS_TOKEN>",
    "ProviderToken": "<LINKEDIN_PROVIDER_TOKEN>",
    "ProviderRefreshToken": "<LINKEDIN_PROVIDER_REFRESH_TOKEN>",
    "WorkspaceID": "47b4efd3-8000-46a5-9630-14ab228b017f",
    "OrgID": "<ORG_ID_IF_PRESENT>",
    "Timezone": "Asia/Kolkata",
    "Supergrow-x-headers": "<base64 client metadata>"
  }
}
```

## Response shape / mock data

```json
{
  "cards": [
    {
      "type": "scheduled_posts",
      "title": "Scheduled posts",
      "value": 8,
      "delta": {
        "value": 2,
        "direction": "up"
      }
    },
    {
      "type": "published_posts",
      "title": "Published posts",
      "value": 21,
      "delta": {
        "value": 12,
        "direction": "up"
      }
    },
    {
      "type": "draft_posts",
      "title": "Drafts",
      "value": 14
    },
    {
      "type": "engagement",
      "title": "Engagement",
      "value": 538,
      "delta": {
        "value": 18.4,
        "direction": "up"
      }
    }
  ],
  "upcoming_posts": [
    {
      "id": "post_123",
      "text": "Short preview...",
      "scheduled_at": "2026-09-03T09:30:00Z",
      "status": "scheduled"
    }
  ]
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
