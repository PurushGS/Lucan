---
name: Delete LinkedIn integration
modules: Settings
method: DELETE
path: /linkedin/integrations
base_url: https://api.supergrow.ai/api/v1
source: Frontend bundle requestFactory export _a/ft.
---

# Delete LinkedIn integration

## Why this API matters

Disconnects a LinkedIn profile from the workspace.

## Frontend usage

Disconnect button in integration settings.

## Request

```json
{
  "method": "DELETE",
  "url": "https://api.supergrow.ai/api/v1/linkedin/integrations",
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
    "linked_in_account_id": "s_X8epv5b1"
  }
}
```

## Response shape / mock data

```json
{
  "success": true
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
