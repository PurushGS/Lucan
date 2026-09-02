---
name: Update post
modules: Post Generator
method: PUT
path: /posts/:id
base_url: https://api.supergrow.ai/api/v1
source: Frontend bundle requestFactory export ms/p.
---

# Update post

## Why this API matters

Updates an existing draft/scheduled post.

## Frontend usage

Save edits after generation.

## Request

```json
{
  "method": "PUT",
  "url": "https://api.supergrow.ai/api/v1/posts/:id",
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
    "id": "post_123"
  },
  "body": {
    "text": "Edited LinkedIn post text...",
    "media_ids": [],
    "image_urls": [],
    "video_url": null,
    "file_url": null,
    "mentions": [],
    "rich_text": {
      "type": "doc",
      "content": []
    },
    "carousel_title": null,
    "linked_in_account_id": "s_X8epv5b1",
    "tags": [],
    "publish_from_type": "profile",
    "linked_in_company_page_id": null,
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
  "text": "Edited LinkedIn post text..."
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
