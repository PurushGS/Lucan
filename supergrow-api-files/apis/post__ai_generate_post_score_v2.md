---
name: Score generated post
modules: Post Generator
method: POST
path: /ai/generate_post_score/v2
base_url: https://api.supergrow.ai/api/v1
source: Frontend bundle requestFactory export Io/M.
---

# Score generated post

## Why this API matters

Scores a draft post and returns improvement signals.

## Frontend usage

Quality meter and rewrite suggestions in generator preview.

## Request

```json
{
  "method": "POST",
  "url": "https://api.supergrow.ai/api/v1/ai/generate_post_score/v2",
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
    "post": "Most onboarding problems are not UI problems..."
  }
}
```

## Response shape / mock data

```json
{
  "score": 82,
  "dimensions": [
    {
      "name": "hook",
      "score": 78,
      "suggestion": "Make the first line more specific."
    },
    {
      "name": "clarity",
      "score": 90,
      "suggestion": "Good concrete language."
    },
    {
      "name": "engagement",
      "score": 76,
      "suggestion": "Add a stronger question at the end."
    }
  ]
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
