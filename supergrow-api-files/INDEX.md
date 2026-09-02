# Supergrow API Files

Generated from Supergrow's shipped frontend bundles and the live analytics route observations from 2026-09-02.

These files are designed as LLM input for building a Supergrow-like app. Each endpoint has a separate Markdown file with request headers, query/body payloads, response-shape mock data, and notes about which frontend module uses it.

Important limitation: the in-app browser did not expose raw network response bodies, so response examples are contract-style mock data inferred from route usage and naming. Request URLs and request payload shapes are derived from the frontend request factory.

## Shared request conventions

```json
{
  "Authorization": "Bearer <ACCESS_TOKEN>",
  "ProviderToken": "<LINKEDIN_PROVIDER_TOKEN>",
  "ProviderRefreshToken": "<LINKEDIN_PROVIDER_REFRESH_TOKEN>",
  "WorkspaceID": "47b4efd3-8000-46a5-9630-14ab228b017f",
  "OrgID": "<ORG_ID_IF_PRESENT>",
  "Timezone": "Asia/Kolkata",
  "Supergrow-x-headers": "<base64 client metadata>"
}
```

Base URL: `https://api.supergrow.ai/api/v1`

## Modules

### Dashboard

- [GET /dashboard/cards](apis/get__dashboard_cards.md) - Dashboard cards
- [GET /users/me](apis/get__users_me.md) - Current user

### Settings

- [GET /users/me](apis/get__users_me.md) - Current user
- [GET /user_infos](apis/get__user_infos.md) - User info profile
- [GET /user_settings](apis/get__user_settings.md) - Get user settings
- [POST /user_settings](apis/post__user_settings.md) - Create user settings
- [PUT /user_settings/:id](apis/put__user_settings_by_id.md) - Update user settings
- [GET /workspaces](apis/get__workspaces.md) - List workspaces
- [POST /workspaces](apis/post__workspaces.md) - Create workspace
- [PUT /workspaces/:id](apis/put__workspaces_by_id.md) - Update workspace
- [DELETE /workspaces/:id](apis/delete__workspaces_by_id.md) - Delete workspace
- [GET /workspaces/:id/plan](apis/get__workspaces_by_id_plan.md) - Workspace plan
- [GET /linkedin/integrations/check](apis/get__linkedin_integrations_check.md) - Check LinkedIn integration
- [GET /linkedin/integrations](apis/get__linkedin_integrations.md) - List LinkedIn integrations
- [POST /linkedin/integrations](apis/post__linkedin_integrations.md) - Create LinkedIn integration
- [DELETE /linkedin/integrations](apis/delete__linkedin_integrations.md) - Delete LinkedIn integration
- [GET /linked_in_company_pages](apis/get__linked_in_company_pages.md) - List connected company pages
- [POST /linked_in_company_pages/connect](apis/post__linked_in_company_pages_connect.md) - Connect company page
- [DELETE /linked_in_company_pages](apis/delete__linked_in_company_pages.md) - Delete company page
- [GET /linked_in_company_pages/info](apis/get__linked_in_company_pages_info.md) - Company page info lookup
- [GET /orgs/content_dna_template](apis/get__orgs_content_dna_template.md) - Get organization content DNA template
- [PUT /orgs/content_dna_template](apis/put__orgs_content_dna_template.md) - Update organization content DNA template

### Analytics

- [GET /users/me](apis/get__users_me.md) - Current user
- [GET /user_infos](apis/get__user_infos.md) - User info profile
- [GET /user_settings](apis/get__user_settings.md) - Get user settings
- [GET /workspaces](apis/get__workspaces.md) - List workspaces
- [GET /linkedin/integrations/check](apis/get__linkedin_integrations_check.md) - Check LinkedIn integration
- [GET /linkedin/integrations](apis/get__linkedin_integrations.md) - List LinkedIn integrations
- [GET /linked_in_company_pages](apis/get__linked_in_company_pages.md) - List connected company pages
- [POST /analytics/v2/cards](apis/post__analytics_v2_cards.md) - Analytics trend cards
- [GET /analytics/weekly_reports](apis/get__analytics_weekly_reports.md) - Weekly reports list
- [GET /analytics/weekly_reports/:week_start_date](apis/get__analytics_weekly_reports_by_week_start_date.md) - Weekly report detail

### Post Generator

- [GET /post_generation_templates/v2](apis/get__post_generation_templates_v2.md) - Post generation templates v2
- [GET /post_generation_templates/:id](apis/get__post_generation_templates_by_id.md) - Post generation template detail
- [POST /ai/generate_post](apis/post__ai_generate_post.md) - Generate post from template params
- [POST /ai/generate_post_from_topic](apis/post__ai_generate_post_from_topic.md) - Generate post from topic
- [POST /ai/generate_post_ideas](apis/post__ai_generate_post_ideas.md) - Generate post ideas
- [POST /ai/generate_post_score/v2](apis/post__ai_generate_post_score_v2.md) - Score generated post
- [POST /ai/rewrite/v2](apis/post__ai_rewrite_v2.md) - Rewrite post
- [POST /ai/generate_carousel_content](apis/post__ai_generate_carousel_content.md) - Generate carousel content
- [POST /ai/generate_hooks](apis/post__ai_generate_hooks.md) - Generate hooks
- [POST /ai/generate_image](apis/post__ai_generate_image.md) - Generate image
- [POST /posts](apis/post__posts.md) - Create post
- [PUT /posts/:id](apis/put__posts_by_id.md) - Update post
- [POST /posts/unfurl](apis/post__posts_unfurl.md) - Unfurl post link

### Viral Posts

- [POST /posts](apis/post__posts.md) - Create post
- [GET /content_search](apis/get__content_search.md) - Search viral content

### Influencers

- [POST /posts](apis/post__posts.md) - Create post
- [GET /influencers/categories](apis/get__influencers_categories.md) - Influencer categories
- [GET /influencers](apis/get__influencers.md) - Influencers by category
- [GET /influencers/categories/:category_id/posts](apis/get__influencers_categories_by_category_id_posts.md) - Influencer category posts
- [GET /influencers/:id/posts](apis/get__influencers_by_id_posts.md) - Single influencer posts

## Recommended minimum clone API surface

- Dashboard: `GET /dashboard/cards`
- Settings: user settings, workspaces, LinkedIn integrations, company pages, content DNA template
- Analytics: `POST /analytics/v2/cards`, weekly report list/detail, integration/account selectors
- Post Generator: templates, AI generation, scoring, rewriting, hooks/carousel/image helpers, create/update post
- Viral Posts: `GET /content_search`, then `POST /posts` for save-to-draft
- Influencers: categories, influencers, category posts, influencer posts, then `POST /posts` for save-to-draft
