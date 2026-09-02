---
name: Generate hooks
modules: Post Generator
method: POST
path: /ai/generate_hooks
base_url: https://api.supergrow.ai/api/v1
source: Frontend bundle requestFactory export Oo/R.
---

# Generate hooks

## Why this API matters

Generates alternate hooks/opening lines for a draft.

## Frontend usage

Hook picker in post editor or generator preview.

## Request

```json
{
  "method": "POST",
  "url": "https://api.supergrow.ai/api/v1/ai/generate_hooks",
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
    "post_content": "Draft post body...",
    "number_of_hooks": 5
  }
}
```

## Response shape / mock data

```json
{
  "hooks": [
    "Most onboarding advice starts in the wrong place.",
    "Your onboarding flow may not be the problem."
  ]
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
