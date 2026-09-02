---
name: Create workspace
modules: Settings
method: POST
path: /workspaces
base_url: https://api.supergrow.ai/api/v1
source: Frontend bundle requestFactory export Oa/at.
---

# Create workspace

## Why this API matters

Creates a new workspace.

## Frontend usage

Workspace settings creation flow.

## Request

```json
{
  "method": "POST",
  "url": "https://api.supergrow.ai/api/v1/workspaces",
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
    "name": "New brand workspace"
  }
}
```

## Response shape / mock data

```json
{
  "id": "workspace_456",
  "name": "New brand workspace",
  "role": "owner"
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
