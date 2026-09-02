---
name: Get user settings
modules: Settings, Analytics
method: GET
path: /user_settings
base_url: https://api.supergrow.ai/api/v1
source: Observed live on analytics routes and mapped in requestFactory export go/me.
---

# Get user settings

## Why this API matters

Reads user-level preferences such as timezone, writing settings, notification defaults, and UI preferences.

## Frontend usage

Controls defaults across settings, analytics target selection, and post generation.

## Request

```json
{
  "method": "GET",
  "url": "https://api.supergrow.ai/api/v1/user_settings",
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
  "id": "user_setting_123",
  "timezone": "Asia/Kolkata",
  "default_linked_in_account_id": "s_X8epv5b1",
  "content_writing_style_id": "style_123",
  "notifications_enabled": true,
  "ai_preferences": {
    "tone": "practical",
    "audience": "founders"
  }
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
