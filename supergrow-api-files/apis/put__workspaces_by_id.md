---
name: Update workspace
modules: Settings
method: PUT
path: /workspaces/:id
base_url: https://api.supergrow.ai/api/v1
source: Frontend bundle requestFactory export Da/ot.
---

# Update workspace

## Why this API matters

Renames or updates workspace metadata.

## Frontend usage

Workspace settings edit form.

## Request

```json
{
  "method": "PUT",
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
    "id": "47b4efd3-8000-46a5-9630-14ab228b017f"
  },
  "body": {
    "name": "Main workspace"
  }
}
```

## Response shape / mock data

```json
{
  "id": "47b4efd3-8000-46a5-9630-14ab228b017f",
  "name": "Main workspace"
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
