---
name: Workspace plan
modules: Settings
method: GET
path: /workspaces/:id/plan
base_url: https://api.supergrow.ai/api/v1
source: Frontend bundle requestFactory export Ta/st.
---

# Workspace plan

## Why this API matters

Fetches subscription/plan limits for a workspace.

## Frontend usage

Show plan status and disable actions when limits are reached.

## Request

```json
{
  "method": "GET",
  "url": "https://api.supergrow.ai/api/v1/workspaces/:id/plan",
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
  }
}
```

## Response shape / mock data

```json
{
  "plan": "pro",
  "limits": {
    "linkedin_accounts": 3,
    "scheduled_posts": 100,
    "ai_generations_per_month": 500
  },
  "usage": {
    "linkedin_accounts": 1,
    "scheduled_posts": 8,
    "ai_generations_this_month": 74
  }
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
