---
name: Influencers by category
modules: Influencers
method: GET
path: /influencers
base_url: https://api.supergrow.ai/api/v1
source: Influencers route import and requestFactory export Zr/In.
---

# Influencers by category

## Why this API matters

Lists influencers for a selected category.

## Frontend usage

Influencer directory grid/list.

## Request

```json
{
  "method": "GET",
  "url": "https://api.supergrow.ai/api/v1/influencers",
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
    "category_id": "cat_startups"
  }
}
```

## Response shape / mock data

```json
{
  "influencers": [
    {
      "id": "inf_123",
      "name": "Example Creator",
      "headline": "Founder and writer",
      "profile_url": "https://www.linkedin.com/in/example/",
      "avatar_url": "https://media.licdn.com/...",
      "followers_count": 95000,
      "average_engagement": 812
    }
  ]
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
