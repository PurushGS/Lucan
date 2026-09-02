---
name: Generate carousel content
modules: Post Generator
method: POST
path: /ai/generate_carousel_content
base_url: https://api.supergrow.ai/api/v1
source: Frontend bundle requestFactory export Ao/N.
---

# Generate carousel content

## Why this API matters

Transforms a post into carousel slide text.

## Frontend usage

Carousel generation option from post preview.

## Request

```json
{
  "method": "POST",
  "url": "https://api.supergrow.ai/api/v1/ai/generate_carousel_content",
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
    "post": "Most onboarding problems are not UI problems...",
    "slides_format": "problem_solution",
    "number_of_slides": 6
  }
}
```

## Response shape / mock data

```json
{
  "title": "Onboarding is a trust problem",
  "slides": [
    {
      "index": 1,
      "headline": "Onboarding is not just UI",
      "body": "The real issue is confidence."
    },
    {
      "index": 2,
      "headline": "Users need one clear win",
      "body": "Show value before asking for setup."
    }
  ]
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
