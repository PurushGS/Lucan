---
name: List workspaces
modules: Settings, Analytics
method: GET
path: /workspaces
base_url: https://api.supergrow.ai/api/v1
source: Observed live on analytics routes and mapped in requestFactory export Ea/it.
---

# List workspaces

## Why this API matters

Lists workspaces available to the signed-in user.

## Frontend usage

Workspace switcher, settings workspace list, analytics request scoping.

## Request

```json
{
  "method": "GET",
  "url": "https://api.supergrow.ai/api/v1/workspaces",
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
  "workspaces": [
    {
      "id": "47b4efd3-8000-46a5-9630-14ab228b017f",
      "name": "Main workspace",
      "role": "owner",
      "org_id": "org_123"
    }
  ]
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
