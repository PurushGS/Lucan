---
name: Unfurl post link
modules: Post Generator
method: POST
path: /posts/unfurl
base_url: https://api.supergrow.ai/api/v1
source: Frontend bundle requestFactory export ps/E.
---

# Unfurl post link

## Why this API matters

Fetches link preview metadata for URLs pasted into a post.

## Frontend usage

Renders and stores link preview cards for posts.

## Request

```json
{
  "method": "POST",
  "url": "https://api.supergrow.ai/api/v1/posts/unfurl",
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
    "url": "https://example.com/article"
  }
}
```

## Response shape / mock data

```json
{
  "title": "Example article title",
  "description": "Short preview description.",
  "image_url": "https://example.com/og.png",
  "url": "https://example.com/article"
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
