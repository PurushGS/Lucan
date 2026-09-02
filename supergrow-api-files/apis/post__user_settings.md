---
name: Create user settings
modules: Settings
method: POST
path: /user_settings
base_url: https://api.supergrow.ai/api/v1
source: Frontend bundle requestFactory export _o/he.
---

# Create user settings

## Why this API matters

Creates a user settings record when one does not already exist.

## Frontend usage

Save first-run account preferences.

## Request

```json
{
  "method": "POST",
  "url": "https://api.supergrow.ai/api/v1/user_settings",
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
    "timezone": "Asia/Kolkata",
    "content_writing_style_id": "style_123",
    "notifications_enabled": true,
    "ai_preferences": {
      "tone": "practical",
      "audience": "founders"
    }
  }
}
```

## Response shape / mock data

```json
{
  "id": "user_setting_123",
  "timezone": "Asia/Kolkata",
  "notifications_enabled": true
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
