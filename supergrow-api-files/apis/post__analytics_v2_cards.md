---
name: Analytics trend cards
modules: Analytics
method: POST
path: /analytics/v2/cards
base_url: https://api.supergrow.ai/api/v1
source: Observed live on Trends tab and mapped in requestFactory export yr/fr.
---

# Analytics trend cards

## Why this API matters

Primary Trends tab API. Fetches chart series for followers, impressions, reactions, comments, reshares, and top post performance.

## Frontend usage

Renders the Trends tab stat cards, line/bar charts, and post performance table.

## Request

```json
{
  "method": "POST",
  "url": "https://api.supergrow.ai/api/v1/analytics/v2/cards",
  "headers": {
    "Authorization": "Bearer <ACCESS_TOKEN>",
    "ProviderToken": "<LINKEDIN_PROVIDER_TOKEN>",
    "ProviderRefreshToken": "<LINKEDIN_PROVIDER_REFRESH_TOKEN>",
    "WorkspaceID": "47b4efd3-8000-46a5-9630-14ab228b017f",
    "OrgID": "<ORG_ID_IF_PRESENT>",
    "Timezone": "Asia/Kolkata",
    "Supergrow-x-headers": "<base64 client metadata>"
  },
  "body": {
    "linkedin_account_id": "s_X8epv5b1",
    "linked_in_company_page_id": null,
    "cards_request": [
      {
        "type": "followers_trend",
        "params": {
          "start_date": "2026-08-03",
          "end_date": "2026-09-02"
        }
      },
      {
        "type": "impressions_trend",
        "params": {
          "start_date": "2026-08-03",
          "end_date": "2026-09-02"
        }
      },
      {
        "type": "reactions_trend",
        "params": {
          "start_date": "2026-08-03",
          "end_date": "2026-09-02"
        }
      },
      {
        "type": "comments_trend",
        "params": {
          "start_date": "2026-08-03",
          "end_date": "2026-09-02"
        }
      },
      {
        "type": "reshares_trend",
        "params": {
          "start_date": "2026-08-03",
          "end_date": "2026-09-02"
        }
      },
      {
        "type": "posts_performance",
        "params": {
          "start_date": "2026-08-03",
          "end_date": "2026-09-02",
          "limit": 100
        }
      }
    ]
  }
}
```

## Response shape / mock data

```json
{
  "cards": [
    {
      "type": "followers_trend",
      "success": true,
      "data": {
        "total": 12840,
        "change": 236,
        "change_percentage": 1.87,
        "series": [
          {
            "date": "2026-08-03",
            "value": 12604
          },
          {
            "date": "2026-08-10",
            "value": 12688
          },
          {
            "date": "2026-08-17",
            "value": 12761
          },
          {
            "date": "2026-08-24",
            "value": 12812
          },
          {
            "date": "2026-09-02",
            "value": 12840
          }
        ]
      }
    },
    {
      "type": "impressions_trend",
      "success": true,
      "data": {
        "total": 48210,
        "change_percentage": 22.4,
        "series": [
          {
            "date": "2026-08-03",
            "value": 8200
          },
          {
            "date": "2026-08-10",
            "value": 9100
          },
          {
            "date": "2026-08-17",
            "value": 10340
          },
          {
            "date": "2026-08-24",
            "value": 9600
          },
          {
            "date": "2026-09-02",
            "value": 10970
          }
        ]
      }
    },
    {
      "type": "posts_performance",
      "success": true,
      "data": {
        "posts": [
          {
            "id": "li_post_123",
            "published_at": "2026-08-28T08:15:00Z",
            "text": "What I learned building in public...",
            "impressions": 12400,
            "reactions": 382,
            "comments": 41,
            "reshares": 18,
            "engagement_rate": 3.56,
            "url": "https://www.linkedin.com/feed/update/..."
          }
        ]
      }
    }
  ]
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
