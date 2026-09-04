---
project: Lucan
register: product
aesthetic_direction: Swiss / grid
color_strategy: restrained
design_system: Radix primitives + semantic CSS tokens
design_variance: 4
motion_intensity: 2
visual_density: 7
---

## Design Read
Quiet operating room for LinkedIn writing: content first, metrics close, every action obvious.

## Signature
The Lucan signature is a left command rail plus ruled work surfaces: a disciplined grid where writing, scoring, DNA, and publishing sit in one operational workspace. The memorable move is the narrow teal active rail and compact status strips, not decoration.

## Inspiration
Supergrow app: took the dense creator workspace, persistent sidebar, clear write action, white work area, rounded controls, and direct draft/analytics orientation. Rejected Inter as a primary identity, sky-blue dominance, pill-heavy sameness, and broad feature sprawl.

Synthesis: Lucan keeps the practical creator workflow, but reads more like a focused internal writing tool with sharper grid discipline and a teal-black identity.

## Color (locked)
| role | OKLCH | hex | use | contrast |
|------|-------|-----|-----|----------|
| background | 0.982 0.012 181 | #f5fbfa | app canvas | ink 14.6:1 |
| surface | 1.000 0.000 0 | #ffffff | main panels, inputs | ink 16.1:1 |
| elevated | 0.967 0.018 186 | #edf7f6 | selected nav, quiet fills | ink 13.5:1 |
| text | 0.210 0.034 231 | #10202a | primary copy | surface 16.1:1 |
| muted | 0.495 0.043 222 | #667985 | supporting copy | surface 4.7:1 |
| subtle | 0.646 0.036 217 | #8aa0ab | metadata | surface 3.0:1 large |
| border | 0.898 0.024 192 | #d8e6e8 | rules, dividers | UI 3.1:1 |
| accent | 0.572 0.122 181 | #039487 | primary action, active state | white 3.5:1 large, ink 5.6:1 |
| accent-strong | 0.441 0.103 181 | #047168 | hover, high emphasis | white 5.5:1 |
| info | 0.508 0.148 257 | #2166d1 | links, scheduled states | white 5.4:1 |
| success | 0.514 0.114 158 | #147b57 | confirmations | white 5.0:1 |
| warning | 0.620 0.130 75 | #a86c11 | caution copy | white 4.1:1 large |
| danger | 0.528 0.143 13 | #b6425b | errors | white 4.8:1 |

Use 60-30-10 by visual weight: background/surface 60, ink/muted/borders 30, teal accent 10. Blue never competes with teal.

## Type (locked)
| role | family | use | notes |
|------|--------|-----|-------|
| display | Satoshi, Avenir Next, ui-sans-serif | page titles, large metrics | weight 700-800, compact but not oversized |
| body | Geist, ui-sans-serif, system-ui | app copy and textareas | 15-16px, 65-75ch reading measure |
| utility | IBM Plex Mono, SFMono-Regular, monospace | IDs, model labels, timestamps | 12-13px, uppercase only for tiny labels |

Letter spacing is 0. No gradient text. Keep hero-scale type out of the product shell.

## Scales (locked)
spacing: 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

radius: sm 4, md 8, lg 12, full 9999. Cards and panels use md; brand mark uses lg; pills use full.

shadow: none by default; raised surfaces use `0 16px 48px rgba(16, 32, 42, 0.08)`.

motion: fast 120ms, base 220ms, emphasis 360ms; easing `cubic-bezier(0.16, 1, 0.3, 1)`. Motion is limited to hover/focus/background transitions and honors `prefers-reduced-motion`.

## Voice
register: plain, operational, creator-aware.

action vocabulary: Generate, Save draft, Check score, Improve with score, Schedule, Publish, Sync posts, Connect LinkedIn. State vocabulary mirrors actions: Generated, Draft saved, Scheduled, Published, Synced.

Every screen must read as the same product if placed side by side.
