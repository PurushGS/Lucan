---
name: Single influencer posts
modules: Influencers
method: GET
path: /influencers/:id/posts
base_url: https://api.supergrow.ai/api/v1
source: Influencers route import and requestFactory export Qr/Rn.
---

# Single influencer posts

## Why this API matters

Fetches recent/high-performing posts for one influencer.

## Frontend usage

Influencer profile/detail post feed and inspiration-to-draft flow.

## Request

```json
{
  "method": "GET",
  "url": "https://api.supergrow.ai/api/v1/influencers/:id/posts",
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
    "id": "inf_123"
  }
}
```

## Response shape / mock data

```json
{
  "influencer": {
    "id": "inf_123",
    "name": "Example Creator",
    "profile_url": "https://www.linkedin.com/in/example/"
  },
  "posts": [
    {
      "id": "inf_post_456",
      "text": "This post starts with a strong hook...",
      "reactions": 1430,
      "comments": 122,
      "reshares": 46,
      "published_at": "2026-08-29T08:00:00Z",
      "url": "https://www.linkedin.com/feed/update/..."
    }
  ]
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
