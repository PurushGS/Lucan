---
name: Influencer category posts
modules: Influencers
method: GET
path: /influencers/categories/:category_id/posts
base_url: https://api.supergrow.ai/api/v1
source: Influencers route import and requestFactory export $r/zn.
---

# Influencer category posts

## Why this API matters

Fetches posts across a category of influencers.

## Frontend usage

Category-level inspiration feed in Influencers.

## Request

```json
{
  "method": "GET",
  "url": "https://api.supergrow.ai/api/v1/influencers/categories/:category_id/posts",
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
    "category_id": "cat_startups"
  },
  "query": {
    "per_page": 20,
    "page": 1
  }
}
```

## Response shape / mock data

```json
{
  "posts": [
    {
      "id": "inf_post_123",
      "influencer_id": "inf_123",
      "author_name": "Example Creator",
      "text": "A high-performing post in this category...",
      "reactions": 980,
      "comments": 76,
      "reshares": 31,
      "published_at": "2026-08-22T12:00:00Z",
      "url": "https://www.linkedin.com/feed/update/..."
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 430
  }
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
