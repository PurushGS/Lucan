---
name: List LinkedIn integrations
modules: Settings, Analytics
method: GET
path: /linkedin/integrations
base_url: https://api.supergrow.ai/api/v1
source: Observed live on analytics routes and mapped in requestFactory export va/lt.
---

# List LinkedIn integrations

## Why this API matters

Lists LinkedIn personal profiles connected to the workspace.

## Frontend usage

Account picker for analytics, post publishing, and settings.

## Request

```json
{
  "method": "GET",
  "url": "https://api.supergrow.ai/api/v1/linkedin/integrations",
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
  "integrations": [
    {
      "id": "li_int_123",
      "user_id": "s_X8epv5b1",
      "name": "Purush",
      "profile_url": "https://www.linkedin.com/in/example/",
      "status": "connected",
      "expires_at": "2026-10-01T00:00:00Z"
    }
  ]
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
