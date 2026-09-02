---
name: Check LinkedIn integration
modules: Settings, Analytics
method: GET
path: /linkedin/integrations/check
base_url: https://api.supergrow.ai/api/v1
source: Observed live on analytics routes and mapped in requestFactory export ga/pt.
---

# Check LinkedIn integration

## Why this API matters

Checks whether the current workspace has a valid LinkedIn connection.

## Frontend usage

Drive empty states, reconnect banners, and analytics availability.

## Request

```json
{
  "method": "GET",
  "url": "https://api.supergrow.ai/api/v1/linkedin/integrations/check",
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
  "connected": true,
  "requires_reconnect": false,
  "linked_in_account_id": "s_X8epv5b1"
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
