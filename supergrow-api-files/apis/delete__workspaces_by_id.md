---
name: Delete workspace
modules: Settings
method: DELETE
path: /workspaces/:id
base_url: https://api.supergrow.ai/api/v1
source: Frontend bundle requestFactory export wa/ct.
---

# Delete workspace

## Why this API matters

Deletes a workspace, with name confirmation in the request body.

## Frontend usage

Workspace destructive action.

## Request

```json
{
  "method": "DELETE",
  "url": "https://api.supergrow.ai/api/v1/workspaces/:id",
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
    "id": "workspace_456"
  },
  "body": {
    "name": "New brand workspace"
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
