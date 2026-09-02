---
name: Weekly report detail
modules: Analytics
method: GET
path: /analytics/weekly_reports/:week_start_date
base_url: https://api.supergrow.ai/api/v1
source: Mapped in requestFactory export Or/ur.
---

# Weekly report detail

## Why this API matters

Fetches a specific weekly report detail.

## Frontend usage

Renders the detailed weekly report panel, recommendations, and post highlights.

## Request

```json
{
  "method": "GET",
  "url": "https://api.supergrow.ai/api/v1/analytics/weekly_reports/:week_start_date",
  "headers": {
    "Authorization": "Bearer <ACCESS_TOKEN>",
    "ProviderToken": "<LINKEDIN_PROVIDER_TOKEN>",
    "ProviderRefreshToken": "<LINKEDIN_PROVIDER_REFRESH_TOKEN>",
    "WorkspaceID": "47b4efd3-8000-46a5-9630-14ab228b017f",
    "OrgID": "<ORG_ID_IF_PRESENT>",
    "Timezone": "Asia/Kolkata",
    "Supergrow-x-headers": "<base64 client metadata>"
  },
  "pathParams": {
    "week_start_date": "2026-08-24"
  },
  "query": {
    "linked_in_account_id": "s_X8epv5b1",
    "linked_in_company_page_id": null
  }
}
```

## Response shape / mock data

```json
{
  "week_start_date": "2026-08-24",
  "week_end_date": "2026-08-30",
  "key_takeaways": [
    "Posts with tactical examples drove the highest saves.",
    "Morning posts received more early comments."
  ],
  "metrics": {
    "impressions": 10970,
    "profile_views": 410,
    "followers_gained": 68,
    "reactions": 240,
    "comments": 32,
    "reshares": 12
  },
  "top_posts": [
    {
      "id": "li_post_123",
      "text": "What I learned...",
      "impressions": 12400,
      "engagement_rate": 3.56
    }
  ],
  "content_suggestions": [
    {
      "topic": "Break down a failed experiment",
      "reason": "High-comment reflective posts performed best."
    }
  ]
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
