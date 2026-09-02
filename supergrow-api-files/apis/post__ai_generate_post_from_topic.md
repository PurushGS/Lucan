---
name: Generate post from topic
modules: Post Generator
method: POST
path: /ai/generate_post_from_topic
base_url: https://api.supergrow.ai/api/v1
source: Frontend bundle requestFactory export No/A.
---

# Generate post from topic

## Why this API matters

Generates a post from a simple topic without selecting a full template.

## Frontend usage

Quick topic-to-post generation.

## Request

```json
{
  "method": "POST",
  "url": "https://api.supergrow.ai/api/v1/ai/generate_post_from_topic",
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
    "topic": "What founders misunderstand about onboarding"
  }
}
```

## Response shape / mock data

```json
{
  "post": "Most onboarding problems are not UI problems...",
  "content_generation_trace_id": "trace_124"
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
