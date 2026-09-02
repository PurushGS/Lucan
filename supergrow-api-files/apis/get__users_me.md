---
name: Current user
modules: Dashboard, Settings, Analytics
method: GET
path: /users/me
base_url: https://api.supergrow.ai/api/v1
source: Observed live on analytics routes and mapped in requestFactory export no/ke.
---

# Current user

## Why this API matters

Loads signed-in user identity, billing/account flags, and default workspace context.

## Frontend usage

Gate access, show account profile, initialize workspace-specific API calls.

## Request

```json
{
  "method": "GET",
  "url": "https://api.supergrow.ai/api/v1/users/me",
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
  "id": "user_123",
  "email": "founder@example.com",
  "name": "Purush",
  "onboarding_completed": true,
  "current_workspace_id": "47b4efd3-8000-46a5-9630-14ab228b017f",
  "plan": {
    "name": "pro",
    "status": "active"
  }
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
