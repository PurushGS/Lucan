---
name: Search viral content
modules: Viral Posts
method: GET
path: /content_search
base_url: https://api.supergrow.ai/api/v1
source: Viral posts route import and requestFactory export pr/Sr.
---

# Search viral content

## Why this API matters

Searches public/high-performing LinkedIn content by query, date range, and minimum engagement.

## Frontend usage

Feeds Viral Posts search results, filters, pagination, and inspiration-to-draft flow.

## Request

```json
{
  "method": "GET",
  "url": "https://api.supergrow.ai/api/v1/content_search",
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
    "query": "startup growth",
    "page": 1,
    "per_page": 20,
    "date_from": "2026-08-03",
    "date_to": "2026-09-02",
    "min_engagement": 100
  }
}
```

## Response shape / mock data

```json
{
  "posts": [
    {
      "id": "viral_123",
      "author_name": "Example Creator",
      "author_headline": "Founder",
      "author_profile_url": "https://www.linkedin.com/in/example/",
      "text": "A viral LinkedIn post preview...",
      "published_at": "2026-08-20T10:00:00Z",
      "reactions": 2100,
      "comments": 180,
      "reshares": 74,
      "engagement": 2354,
      "url": "https://www.linkedin.com/feed/update/..."
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 842
  }
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
