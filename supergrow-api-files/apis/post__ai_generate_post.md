---
name: Generate post from template params
modules: Post Generator
method: POST
path: /ai/generate_post
base_url: https://api.supergrow.ai/api/v1
source: Post generator route import and requestFactory export Fo/k.
---

# Generate post from template params

## Why this API matters

Generates a LinkedIn post from selected template parameters.

## Frontend usage

Main AI generation action from a chosen template.

## Request

```json
{
  "method": "POST",
  "url": "https://api.supergrow.ai/api/v1/ai/generate_post",
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
    "params": {
      "template_id": "template_lesson",
      "topic": "shipping a feature before it felt perfect",
      "audience": "SaaS founders",
      "tone": "practical",
      "linked_in_account_id": "s_X8epv5b1"
    }
  }
}
```

## Response shape / mock data

```json
{
  "content_generation_trace_id": "trace_123",
  "post": "I used to wait until features felt perfect before shipping...",
  "alternatives": [
    "Shipping early taught me something uncomfortable..."
  ],
  "metadata": {
    "template_id": "template_lesson",
    "model": "server_selected"
  }
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
