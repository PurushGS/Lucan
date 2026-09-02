---
name: Get organization content DNA template
modules: Settings
method: GET
path: /orgs/content_dna_template
base_url: https://api.supergrow.ai/api/v1
source: Settings route import and requestFactory export Mt/Sa.
---

# Get organization content DNA template

## Why this API matters

Reads organization-wide content DNA template used for writing style guidance.

## Frontend usage

Settings page for organization writing style/content DNA.

## Request

```json
{
  "method": "GET",
  "url": "https://api.supergrow.ai/api/v1/orgs/content_dna_template",
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
  "template": {
    "voice": "direct, useful, founder-led",
    "audience": "B2B SaaS operators",
    "pillars": [
      "product lessons",
      "growth experiments",
      "team rituals"
    ],
    "avoid": [
      "generic motivation",
      "empty listicles"
    ]
  }
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
