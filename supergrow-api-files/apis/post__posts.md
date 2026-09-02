---
name: Create post
modules: Post Generator, Viral Posts, Influencers
method: POST
path: /posts
base_url: https://api.supergrow.ai/api/v1
source: Frontend bundle requestFactory export us/f.
---

# Create post

## Why this API matters

Creates a draft/scheduled post from generated text, viral post inspiration, or influencer inspiration.

## Frontend usage

Save generated or repurposed content into the app's post workflow.

## Request

```json
{
  "method": "POST",
  "url": "https://api.supergrow.ai/api/v1/posts",
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
    "text": "Final LinkedIn post text...",
    "media_ids": [],
    "image_urls": [],
    "video_url": null,
    "file_url": null,
    "mentions": [],
    "rich_text": {
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Final LinkedIn post text..."
            }
          ]
        }
      ]
    },
    "carousel_title": null,
    "linked_in_account_id": "s_X8epv5b1",
    "video_title": null,
    "video_thumbnail_url": null,
    "tags": [],
    "show_link_preview": true,
    "link_preview_data": null,
    "source": "post_generator"
  }
}
```

## Response shape / mock data

```json
{
  "id": "post_123",
  "status": "draft",
  "text": "Final LinkedIn post text...",
  "created_at": "2026-09-02T05:45:00Z"
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
