---
name: Influencer categories
modules: Influencers
method: GET
path: /influencers/categories
base_url: https://api.supergrow.ai/api/v1
source: Influencers route import and requestFactory export Xr/Ln.
---

# Influencer categories

## Why this API matters

Lists categories used to browse influencers.

## Frontend usage

Category tabs/filters in the Influencers module.

## Request

```json
{
  "method": "GET",
  "url": "https://api.supergrow.ai/api/v1/influencers/categories",
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
  "categories": [
    {
      "id": "cat_startups",
      "name": "Startups",
      "influencer_count": 120
    },
    {
      "id": "cat_marketing",
      "name": "Marketing",
      "influencer_count": 94
    }
  ]
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
