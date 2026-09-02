---
name: Rewrite post
modules: Post Generator
method: POST
path: /ai/rewrite/v2
base_url: https://api.supergrow.ai/api/v1
source: Frontend bundle requestFactory export zo/F.
---

# Rewrite post

## Why this API matters

Rewrites draft text using a rewrite template.

## Frontend usage

Rewrite controls such as shorter, punchier, clearer, or more personal.

## Request

```json
{
  "method": "POST",
  "url": "https://api.supergrow.ai/api/v1/ai/rewrite/v2",
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
    "text": "Draft post text...",
    "template_id": "rewrite_more_concise"
  }
}
```

## Response shape / mock data

```json
{
  "rewritten_text": "A tighter version of the draft...",
  "content_generation_trace_id": "trace_125"
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
