---
name: Generate image
modules: Post Generator
method: POST
path: /ai/generate_image
base_url: https://api.supergrow.ai/api/v1
source: Frontend bundle requestFactory export Mo/L.
---

# Generate image

## Why this API matters

Generates an image suggestion/asset for a post.

## Frontend usage

Image generation from a draft post.

## Request

```json
{
  "method": "POST",
  "url": "https://api.supergrow.ai/api/v1/ai/generate_image",
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
  "image_url": "https://cdn.example.com/generated/image.png",
  "prompt": "Clean editorial illustration about onboarding confidence"
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
