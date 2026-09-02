---
name: Update organization content DNA template
modules: Settings
method: PUT
path: /orgs/content_dna_template
base_url: https://api.supergrow.ai/api/v1
source: Settings route import and requestFactory export Ln/Ca.
---

# Update organization content DNA template

## Why this API matters

Updates organization-wide content DNA template.

## Frontend usage

Persist Content DNA settings.

## Request

```json
{
  "method": "PUT",
  "url": "https://api.supergrow.ai/api/v1/orgs/content_dna_template",
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

## Response shape / mock data

```json
{
  "success": true,
  "updated_at": "2026-09-02T05:45:00Z"
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
