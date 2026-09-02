---
name: Post generation templates v2
modules: Post Generator
method: GET
path: /post_generation_templates/v2
base_url: https://api.supergrow.ai/api/v1
source: Post generator route import and requestFactory export Ba/Ue.
---

# Post generation templates v2

## Why this API matters

Fetches grouped/modern templates shown in the Post Generator template picker.

## Frontend usage

Template gallery and category filters in the post generator.

## Request

```json
{
  "method": "GET",
  "url": "https://api.supergrow.ai/api/v1/post_generation_templates/v2",
  "headers": {
    "Authorization": "Bearer <ACCESS_TOKEN>",
    "ProviderToken": "<LINKEDIN_PROVIDER_TOKEN>",
    "ProviderRefreshToken": "<LINKEDIN_PROVIDER_REFRESH_TOKEN>",
    "WorkspaceID": "47b4efd3-8000-46a5-9630-14ab228b017f",
    "OrgID": "<ORG_ID_IF_PRESENT>",
    "Timezone": "Asia/Kolkata",
    "Supergrow-x-headers": "<base64 client metadata>"
  }
}
```

## Response shape / mock data

```json
{
  "categories": [
    {
      "id": "cat_founder",
      "name": "Founder",
      "templates": [
        {
          "id": "template_lesson",
          "title": "Lesson learned",
          "description": "Turn an experience into a LinkedIn post.",
          "inputs": [
            "topic",
            "audience",
            "tone"
          ]
        }
      ]
    }
  ]
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
