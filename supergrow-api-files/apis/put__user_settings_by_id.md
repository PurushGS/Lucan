---
name: Update user settings
modules: Settings
method: PUT
path: /user_settings/:id
base_url: https://api.supergrow.ai/api/v1
source: Frontend bundle requestFactory export vo/ge.
---

# Update user settings

## Why this API matters

Updates an existing user settings record.

## Frontend usage

Persist settings form changes.

## Request

```json
{
  "method": "PUT",
  "url": "https://api.supergrow.ai/api/v1/user_settings/:id",
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
    "id": "user_setting_123"
  },
  "body": {
    "timezone": "Asia/Kolkata",
    "default_linked_in_account_id": "s_X8epv5b1",
    "notifications_enabled": false
  }
}
```

## Response shape / mock data

```json
{
  "id": "user_setting_123",
  "timezone": "Asia/Kolkata",
  "notifications_enabled": false
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
