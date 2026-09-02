---
name: Connect company page
modules: Settings
method: POST
path: /linked_in_company_pages/connect
base_url: https://api.supergrow.ai/api/v1
source: Frontend bundle requestFactory export mr/yr.
---

# Connect company page

## Why this API matters

Connects LinkedIn company pages after an authorization or migration token is returned.

## Frontend usage

Company page connect flow.

## Request

```json
{
  "method": "POST",
  "url": "https://api.supergrow.ai/api/v1/linked_in_company_pages/connect",
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
    "temp_token": "<temporary_linkedin_token>"
  }
}
```

## Response shape / mock data

```json
{
  "success": true,
  "connected_pages": [
    {
      "id": "page_123",
      "name": "Example Company"
    }
  ]
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
