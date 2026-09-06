---
feature: Creative Studio
status: options
register: product
aesthetic_direction: Swiss / grid
design_system: Radix primitives + semantic CSS tokens
source_reference: Supergrow Creative Studio inspection on 2026-09-06
---

## Design Read
Creative Studio should feel like a focused production bench for LinkedIn visuals: templates first, editing second, export always close.

## Supergrow Observations

Studio landing:
- Header copy: "Creative Studio" and "Design carousels, infographics, and visuals, or upload your own."
- Primary actions: Upload, Design new.
- Legacy bridge: "Looking for the old carousel maker? Open it here."
- Asset filters: All types, Images, Videos, Carousels, Audio, Fonts.
- Existing assets appear as preview tiles with More actions.

Design new flow:
- Opens a template picker, not the editor directly.
- Tabs: Featured, My Templates, Canva Import Soon.
- Type filters: All types, Carousels, Infographics, Images.
- First action: Start from blank.
- Template examples include Advocacy-First, GTM Stack, Bold & Bloom, Sleek, Royal, Forest, Indigo, Spotlight, Midnight Lavender, Mint Grid, Stat Grid, Timeline, Compare, Big Stat, Process Flow, 2x2 Matrix, Comparison Table, Pyramid, Org Chart, Workflow, Roadmap, Tech Stack, Quote Frame, Cover, Tip Card, Testimonial, Anniversary.

Blank editor:
- Canvas editor with multiple canvas elements.
- Left/bottom creation tools: Text, Image, Shapes, Templates.
- Text panel: Add a heading, Add a subheading, Add body text.
- Image panel: open image library or upload.
- Shapes panel: Rectangle, Ellipse, Line, Arrow, Star.
- Top controls: title rename, undo, redo, add page, duplicate page, delete page, export, zoom out/in, fit to screen.
- Export menu: Download as PNG, Download as ZIP, Download as PDF, Save image to library, Save carousel to library.
- Right inspector: Pages, Canvas, Position, Layers.
- Canvas presets: LinkedIn Post Square 1080x1080, LinkedIn Carousel Portrait 1080x1350, LinkedIn Story 1080x1920, LinkedIn Banner 1584x396, Custom width and height.
- Canvas options include guides/grid and page background color or image.
- Layer panel has an honest empty state: "No layers yet. Add Text, Image, or a Shape from the bottom toolbar to get started."

## Lucan Current State

Frontend:
- Main UI is still concentrated in `components/lucan-app.tsx`.
- Navigation already has room for a Studio tab, but the product shell should be split before adding a heavy editor.
- Current CSS is semantic token based and can support the studio surface without a new visual identity.

Backend:
- Turso schema has users, drafts, generations, content DNA, LinkedIn accounts, imported posts, post analytics, and profile metrics.
- No tables exist yet for media assets, design documents, templates, page JSON, previews, or exports.
- Existing AI layer supports JSON responses through OpenRouter-compatible OpenAI SDK calls.
- Captured Supergrow APIs include `/ai/generate_carousel_content` and `/ai/generate_image`; no complete Creative Studio save/export backend contract is currently captured.

## Option A: Lucan-Native Template Studio

Scope:
- Add Creative Studio nav and landing page.
- Asset library with filters for Images and Carousels first.
- Design new opens a Lucan template picker.
- Generate carousel content from an existing post or a topic using our LLM.
- Render templates with React/SVG/HTML into fixed LinkedIn sizes.
- Save design JSON and preview URL/data into Turso.
- Export PNG from the browser-rendered design first; PDF can follow.

Backend:
- `creative_assets`: id, user_id, type, title, preview_url, source, created_at, updated_at.
- `creative_designs`: id, user_id, title, format, width, height, pages_json, thumbnail_url, status, created_at, updated_at.
- `creative_exports`: id, design_id, format, file_url or data reference, created_at.
- API routes: `GET/POST /api/creative/designs`, `GET/PUT/DELETE /api/creative/designs/:id`, `POST /api/creative/carousel`, `POST /api/creative/export`.

Frontend:
- New modular feature folder: `components/creative-studio/*`.
- Landing: compact toolbar, upload/design actions, asset filters, asset grid.
- Template picker: featured templates and format filters.
- Editor: simple page rail, fixed preview canvas, text controls, background controls, export menu.

Effort:
- 50 percent Supergrow parity in 4 to 6 focused build passes.
- Lower risk, no paid canvas dependency.
- Best for Lucan right now if we want useful output quickly.

Tradeoff:
- Not a full drag-resize canvas editor initially.
- Harder to support freeform Canva-like editing later unless the document model is designed carefully.

## Option B: Polotno-Powered Editor

Scope:
- Embed Polotno as the editor engine.
- Use our own Studio landing, asset library, template picker, and persistence.
- Let Polotno handle pages, elements, selection, transforms, zoom, undo/redo, exports, and editor interactions.

Backend:
- Store Polotno JSON in `creative_designs.pages_json`.
- Save generated previews and exports to storage later.
- Template records map to Polotno JSON documents.

Frontend:
- Dynamic client-only editor route/component.
- Use Polotno workspace, side panel, toolbar, pages timeline, and zoom controls.
- Theme surrounding Lucan shell with locked tokens; accept that the inner editor has its own system unless we pay/customize deeply.

Effort:
- 60 to 80 percent Supergrow parity fastest.
- Best if we want a true drag-resize editor soon.

Tradeoff:
- Requires Polotno API key/license decision.
- Adds a heavier dependency and a second design system inside Lucan.
- Less control over exact UX details unless customized.

## Option C: Konva or Fabric Custom Editor

Scope:
- Build our own editor using a lower-level canvas library.
- Support selectable text, images, shapes, transforms, multi-page carousels, layers, serialization, and export.

Backend:
- Similar to Option A, but pages_json stores canvas-library objects.

Frontend:
- Custom editor components for all tools and inspectors.
- Konva/Fabric handles canvas rendering, drag/resize, serialization, and image export.

Effort:
- 50 percent parity is possible, but slower than Option A.
- 80 percent parity will take materially longer than Polotno.

Tradeoff:
- More control than Polotno.
- More surface area for bugs: selection, text editing, image CORS, layer ordering, responsive canvas, export quality.

## Recommendation

Start with Option A for Lucan's first Creative Studio phase.

Why:
- It fits current Lucan architecture and avoids dragging in a full Canva clone before core content workflows are stable.
- It gives users the main value: turn post ideas or drafts into visual LinkedIn assets, save them, and export/share them.
- It keeps the code modular and human-maintainable.
- The backend model can still migrate to Polotno/Konva later because we store versioned design JSON rather than screenshots only.

First milestone:
- Studio landing and asset library.
- Template picker with 8 to 12 Lucan templates.
- AI carousel text generation from topic or existing draft.
- Simple multi-page carousel renderer.
- Save design as draft asset.
- Export PNG per page.

Second milestone:
- Upload image library.
- Background/image controls.
- PDF and ZIP export.
- Duplicate/delete/reorder pages.
- Basic text editing controls.

Third milestone:
- If users actually need freeform editing, choose Polotno or Konva with real usage evidence.

## Build Handoff

Target agent: nextjs-senior-engineer.

Instruction:
Implement Option A first. Keep production code modular under `components/creative-studio`, `src/lib/db/creative.ts`, `src/lib/creative/templates.ts`, and `app/api/creative/*`. Theme every screen with `.ulpi/design/DESIGN.md`. Do not redesign the product shell.

Acceptance criteria:
- Studio is present in Lucan navigation.
- Landing has Upload, Design new, type filters, and an honest empty asset grid.
- Design new opens a template picker with LinkedIn formats and named templates.
- User can generate a carousel from topic or draft content using the existing AI layer.
- User can save a design to Turso and reopen it.
- User can export at least one PNG from a saved or unsaved design.
- No mock AI output.
- Empty, loading, error, and unauthenticated states are handled.
- Mobile does not attempt full editor parity; it offers preview, template selection, and a clear desktop recommendation for detailed editing.

## Pre-Flight

- Identity lock: uses existing Lucan `DESIGN.md`; no new palette, type, radius, or motion scale.
- Anti-slop: no purple-blue glow, no gradient text, no nested cards, no decorative blobs.
- State coverage: landing, template picker, editor, save, export, empty library, failed AI generation, failed save, failed export.
- Accessibility: template picker and export menu should use proper dialog/menu semantics; canvas preview must have text alternatives and keyboard-reachable controls.
- Self-critique: distinctiveness 3, hierarchy 3, consistency 4, accessibility 3, state coverage 3, copy quality 3, restraint 4, motion motivation 4. Total 27/32.
