---
name: Delete company page
modules: Settings
method: DELETE
path: /linked_in_company_pages
base_url: https://api.supergrow.ai/api/v1
source: Frontend bundle requestFactory export hr/br.
---

# Delete company page

## Why this API matters

Disconnects a LinkedIn company page.

## Frontend usage

Company page settings remove action.

## Request

```json
{
  "method": "DELETE",
  "url": "https://api.supergrow.ai/api/v1/linked_in_company_pages",
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
    "linked_in_company_page_id": "page_123"
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
