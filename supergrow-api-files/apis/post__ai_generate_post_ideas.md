---
name: Generate post ideas
modules: Post Generator
method: POST
path: /ai/generate_post_ideas
base_url: https://api.supergrow.ai/api/v1
source: Frontend bundle requestFactory export Po/j.
---

# Generate post ideas

## Why this API matters

Returns idea prompts for future LinkedIn posts.

## Frontend usage

Idea generator surface inside post creation.

## Request

```json
{
  "method": "POST",
  "url": "https://api.supergrow.ai/api/v1/ai/generate_post_ideas",
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
    "industry": "B2B SaaS",
    "use_latest_news": true
  }
}
```

## Response shape / mock data

```json
{
  "ideas": [
    {
      "title": "The hidden cost of activation metrics",
      "angle": "challenge a common dashboard habit"
    },
    {
      "title": "How I would redesign onboarding emails",
      "angle": "tactical teardown"
    }
  ]
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
