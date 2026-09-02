---
name: User info profile
modules: Settings, Analytics
method: GET
path: /user_infos
base_url: https://api.supergrow.ai/api/v1
source: Observed live on analytics routes and mapped in requestFactory export li/Cn.
---

# User info profile

## Why this API matters

Fetches onboarding/profile metadata used by personalization and account settings.

## Frontend usage

Pre-fill profile/onboarding settings and personalize AI generation.

## Request

```json
{
  "method": "GET",
  "url": "https://api.supergrow.ai/api/v1/user_infos",
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
  "id": "user_info_123",
  "source_of_discovery": "google",
  "linked_in_profile_url": "https://www.linkedin.com/in/example/",
  "user_type": "founder",
  "onboarding_completed": true
}
```

## LLM implementation notes

- Treat response data as a realistic contract/mock, not a confirmed production response dump.
- Keep auth values server-side. Do not expose ProviderToken, ProviderRefreshToken, or bearer tokens to the frontend.
- Scope every workspace-specific request with WorkspaceID and timezone-aware dates.
