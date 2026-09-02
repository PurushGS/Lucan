---
name: Post generation template detail
modules: Post Generator
method: GET
path: /post_generation_templates/:id
base_url: https://api.supergrow.ai/api/v1
source: Post generator route import and requestFactory export Va/We.
---

# Post generation template detail

## Why this API matters

Fetches one template definition, including fields/prompts used to generate a post.

## Frontend usage

Builds the form for a selected post-generation template.

## Request

```json
{
  "method": "GET",
  "url": "https://api.supergrow.ai/api/v1/post_generation_templates/:id",
  "headers": {
    "Authorization": "Bearer <ACCESS_TOKEN>",
    "ProviderToken": "<LINKEDIN_PROVIDER_TOKEN>",
    "ProviderRefreshToken": "<LINKEDIN_PROVIDER_REFRESH_TOKEN>",
    "WorkspaceID": "47b4efd3-8000-46a5-9630-14ab228b017f",
    "OrgID": "<ORG_ID_IF_PRESENT>",
    "Timezone": "Asia/Kolkata",
    "Supergrow-x-headers": "<base64 client metadata>"
  },
  "pathParams": {
    "id": "template_lesson"
  }
}
```

## Response shape / mock data

```json
{
  "id": "template_lesson",
  "title": "Lesson learned",
  "fields": [
    {
      "key": "topic",
      "label": "Topic",
      "type": "textarea",
      "required": true
    },
    {
      "key": "audience",
      "label": "Audience",
      "type": "text",
      "required": false
    },
    {
      "key": "tone",
      "label": "Tone",
      "type": "select",
      "options": [
        "practical",
        "story",
        "contrarian"
      ]
    }
  ],
  "prompt_schema": {
    "generation_type": "linkedin_post",
    "supports_carousel": true
  }
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
