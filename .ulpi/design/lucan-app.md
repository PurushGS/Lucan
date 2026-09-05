## Flow: Write And Improve A LinkedIn Post

Goal: let a logged-in user turn a topic, article, PDF, or YouTube link into a draft, score it, improve it, and save or publish it.

Entry points: Dashboard primary action, Post Generator nav, Drafts editor, Kanban board.

Prerequisites: authenticated Logto session. Content DNA is optional but improves generation, scoring, and rewrite.

Path:
Start -> choose source -> provide source details -> generate -> edit -> check score -> optional improve -> save draft -> optional schedule or publish.

States:
Loading shows disabled buttons with action-specific labels. Empty draft panes show one quiet placeholder. Errors use the danger status strip. Success uses the success status strip. Session expiry returns to sign-in. Offline/network failures keep the draft text in local component state and show retry copy.

## Flow: Connect And Sync LinkedIn

Goal: connect an account, import posts, sync analytics when permitted, and rebuild Content DNA from the user’s actual posts.

Entry points: Dashboard DNA action, Content DNA screen, Settings screen.

Path:
Start -> LinkedIn connection status -> connect account or show account -> sync posts -> save imported posts -> generate Content DNA -> refresh dashboard/analytics.

States:
Unconfigured live OAuth shows setup status. Sandbox mode says sandbox connection. Connected state shows account, imported count, and last sync. Partial permission state imports what is available and states which LinkedIn permission is missing.

## Flow: Manage Account Settings

Goal: let a signed-in user see the Logto-backed profile/login details Lucan has stored and update account security without Lucan handling raw passwords.

Entry points: Settings nav.

Path:
Start -> Settings -> Profile and login details -> Change password -> Logto reset-password flow -> return/sign in again.

States:
Profile shows the current stored Logto subject, email, display name, and avatar fallback. Missing fields show “Not set”. Password change links to Logto’s hosted reset-password flow, not an inline password field.

## Component Specs

AppShell: two-column product shell. Desktop uses fixed 248px sidebar and fluid main. Mobile stacks sidebar above main with two-column nav. One primary action appears in the topbar.

SidebarNav: lucide icons, active teal left rail, 44px minimum target, visible focus ring. Labels remain visible until mobile, where nav wraps into two columns.

Topbar: compact title, one-line contextual subtitle, primary shortcut group. No oversized hero treatment.

Panel: white ruled surface with 8px radius, 1px border, soft shadow only for main panels. No nested cards.

Metric: compact data block for dashboard totals. Label uses utility styling; value is bold display text. Loading state may show zero or “Pending” but must not shift layout.

DashboardOverview: first screen must be dense and useful, not a scroll-heavy feed. Use one metric strip, compact draft cards, best posting slots, and a short LinkedIn/DNA status. Recent drafts are cards with clamped content, not tall full-width boxes.

SegmentedSourcePicker: four equal source options with icons. Active option uses teal border/fill. Keyboard path follows normal button tab order.

DraftEditor: textarea is the dominant surface. Action order: Save draft, Schedule, Publish, Check score, Improve with score. Improve remains disabled until a score exists.

KanbanBoard: three ruled columns for Draft, Scheduled, and Published. Cards are compact, clamped, and show source plus scheduled/published metadata. This can start as status-grouped rather than drag-and-drop; do not fake workflow transitions without backend support.

CalendarPlanner: shows scheduled/published posts plus a best-time-to-post strip. Best-time slots derive from imported LinkedIn posts and analytics when available. If there is not enough real LinkedIn history, label the slots as baseline guidance, never as measured performance.

ContentInspiration: uses the user’s imported LinkedIn posts as source material for reusable angles, hooks, and topics. Empty state asks the user to sync LinkedIn. No invented viral examples.

ViralPosts: ranks imported LinkedIn posts by engagement and reach. Empty state is explicit when there are no imported posts or LinkedIn analytics are unavailable.

ScorePanel: uses metrics, voice check, criteria, and finding list. Model label uses utility type. Findings show severity, reason, quoted line, and suggestion.

LinkedInStatus: shows configuration, connection, and sync state in one status strip. Never imply live analytics are available when LinkedIn scopes are missing.

AnalyticsTable: table-first, not card grid. Horizontal scroll on mobile. Numeric columns remain scannable.

AccountSettings: two panels for profile/login and security. Profile/login details come from the stored Lucan user row synced from Logto claims. Password change uses Logto reset-password, not an inline password field.

## Accessibility

All buttons use visible focus outlines. Touch targets are at least 44px high. Status/error regions use text and color, not color alone. Text contrast follows `DESIGN.md`. Motion is non-essential and disabled for reduced motion.

## Build Handoff

Target agent: nextjs-senior-engineer.

Design system: Radix primitives + semantic CSS tokens. Current implementation can use native controls where accessible, but any future dialog/menu/select primitives should use Radix and be themed with the locked tokens.

Acceptance criteria:
- Implement exactly this spec. Theme the design system with our locked tokens; do not redesign or re-implement its components.
- Dashboard, generator, drafts, calendar, analytics, DNA, and settings read as one product.
- Kanban, Content Inspiration, and Viral Posts are present in navigation and use real/imported data or honest empty states.
- Influencers is removed from phase scope.
- Settings shows stored login/profile details and links to Logto password reset.
- Primary actions are visually clear; secondary actions are subordinate.
- No purple-blue glow, gradient text, nested cards, decorative blobs, or marketing hero layout.
- Mobile layout has no overlapping text or controls.
- All existing API workflows still pass lint, type-check, build, and smoke tests.

## Pre-Flight

Identity lock: passed. All values derive from `DESIGN.md`.

Anti-slop: passed. No banned fonts as primary identity, no purple glow, no cream default, no nested cards, no fake metrics, no gradient text.

State coverage: passed for generate, score, rewrite, LinkedIn sync, empty drafts, empty analytics, error, loading, session expiry, and partial LinkedIn permissions.

Accessibility: passed in spec. Implementation must verify contrast, focus, keyboard order, touch size, and responsive no-overlap.

Layout craft: passed. Uses sidebar rail, metric strip, split editor, table analytics, and status strips.

Cognitive load: passed. Nav is compact; each view has one dominant action path.

Self-critique: distinctiveness 3, hierarchy 3, consistency 4, accessibility 3, state coverage 3, copy quality 3, restraint 4, motion motivation 4. Total 27/32. No axis below 3.
