---
name: Weekly reports list
modules: Analytics
method: GET
path: /analytics/weekly_reports
base_url: https://api.supergrow.ai/api/v1
source: Observed live on Weekly Report tab and mapped in requestFactory export kr/lr.
---

# Weekly reports list

## Why this API matters

Lists recent weekly analytics reports for a profile or company page.

## Frontend usage

Shows weekly report list/sidebar and picks the current report.

## Request

```json
{
  "method": "GET",
  "url": "https://api.supergrow.ai/api/v1/analytics/weekly_reports",
  "headers": {
    "Authorization": "Bearer <ACCESS_TOKEN>",
    "ProviderToken": "<LINKEDIN_PROVIDER_TOKEN>",
    "ProviderRefreshToken": "<LINKEDIN_PROVIDER_REFRESH_TOKEN>",
    "WorkspaceID": "47b4efd3-8000-46a5-9630-14ab228b017f",
    "OrgID": "<ORG_ID_IF_PRESENT>",
    "Timezone": "Asia/Kolkata",
    "Supergrow-x-headers": "<base64 client metadata>"
  },
  "query": {
    "limit": 12,
    "linked_in_account_id": "s_X8epv5b1",
    "linked_in_company_page_id": null
  }
}
```

## Response shape / mock data

```json
{
  "reports": [
    {
      "week_start_date": "2026-08-24",
      "week_end_date": "2026-08-30",
      "summary": "Impressions grew 18% while comments were flat.",
      "metrics": {
        "impressions": 10970,
        "followers_gained": 68,
        "reactions": 240,
        "comments": 32
      }
    }
  ]
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
