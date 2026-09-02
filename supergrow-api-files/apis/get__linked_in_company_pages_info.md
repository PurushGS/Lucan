---
name: Company page info lookup
modules: Settings
method: GET
path: /linked_in_company_pages/info
base_url: https://api.supergrow.ai/api/v1
source: Frontend bundle requestFactory export vr/xr.
---

# Company page info lookup

## Why this API matters

Looks up public metadata for a LinkedIn company page before connecting or validating it.

## Frontend usage

Company page lookup/preview in integration settings.

## Request

```json
{
  "method": "GET",
  "url": "https://api.supergrow.ai/api/v1/linked_in_company_pages/info",
  "headers": {
    "Authorization": "Bearer <ACCESS_TOKEN>",
    "ProviderToken": "<LINKEDIN_PROVIDER_TOKEN>",
    "ProviderRefreshToken": "<LINKEDIN_PROVIDER_REFRESH_TOKEN>",
    "WorkspaceID": "47b4efd3-8000-46a5-9630-14ab228b017f",
    "OrgID": "<ORG_ID_IF_PRESENT>",
    "Timezone": "Asia/Kolkata",
    "Supergrow-x-headers": "<base64 client metadata>"
  },
  "query": {
    "company_url": "https://www.linkedin.com/company/example-company/",
    "linked_in_account_id": "s_X8epv5b1"
  }
}
```

## Response shape / mock data

```json
{
  "name": "Example Company",
  "page_id": "urn:li:organization:123456",
  "logo_url": "https://media.licdn.com/..."
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
