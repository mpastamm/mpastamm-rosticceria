# Design QA — Mpastamm storefront

## Comparison target

- source visual truth path: `C:\Users\ANTONI~1.NAV\AppData\Local\Temp\codex-clipboard-1fbadb05-7a55-46d2-9a7a-0c469999e7ad.png`
- implementation screenshot path: `http://127.0.0.1:3006/` (Chrome capture via CUA; the browser-control surface exposes the capture directly but not a filesystem raster path)
- route: `/`
- state: desktop storefront, catalog loaded, no products in cart, default “Tutte le categorie” filter selected
- source pixels: `1672 × 941`
- implementation capture: `1904 × 876` viewport screenshot
- CSS size and density: implementation observed at the Chrome viewport above, device scale assumed `1`; source is a reference screenshot, so comparison was normalized to content regions rather than browser chrome or exact pixel dimensions

## Full-view comparison evidence

The source mockup and the live Chrome implementation were opened and inspected during the same QA pass. The implementation preserves the reference hierarchy: dark green masthead, compact hero, warm cream page surface, left-aligned category pills, three equal upper showcase modules, and the asymmetric two-module lower row. The live page also keeps the footer and catalog content in the same visual system.

## Focused region comparison evidence

- Header: script-style white brand mark, dark green navigation, search field, account and cart actions are visually present and aligned with the reference.
- Hero: `src/pages/HomePage.tsx` uses the supplied `hero_mpastamm_garden.png`, with a cream-to-transparent overlay so the “La Vetrina” copy remains readable.
- Showcase modules: `src/components/CategoryShowcaseModule.tsx` and `src/components/GlassDisplayCase.tsx` reproduce the editorial image header, green icon badge, rounded paper card, three display cases, and external name/price labels.
- Footer: `src/components/Footer.tsx` now reads address and city from the configured settings rather than placeholder text.

## Required fidelity surfaces

- Fonts and typography: `Playfair Display` is used for display headings, `DM Sans` for UI/body text, and `Caveat` for script branding; hierarchy and wrapping remain legible in the captured desktop view.
- Spacing and layout rhythm: the compact 198px desktop hero, 64px masthead, pill spacing, 3-column upper grid, and 2-column lower grid are consistent with the source composition. Cards retain rounded corners, warm borders, and restrained elevation.
- Colors and visual tokens: the implementation maps the source to dark olive green, cream paper, warm brown imagery, muted gold accents, and translucent dark image overlays. Contrast remains readable over the supplied hero and food imagery.
- Image quality and asset fidelity: the user-supplied hero image is bundled as a real raster asset at `src/assets/images/hero_mpastamm_garden.png`; category and product imagery remain real raster assets and are not replaced by CSS drawings or placeholder SVG art.
- Copy and content: storefront labels, category descriptions, prices, footer details, and calls to action are coherent Italian product copy. Live catalog values replace the mockup’s intentional “Nome prodotto / € 0,00” placeholders.
- Icons and interactions: category, account, cart, search, and showcase actions are rendered as actual controls; the accessibility tree exposes the buttons and image alt text. The desktop capture showed no overlap or clipped persistent control.
- Accessibility/responsiveness: semantic headings, labelled image content, keyboard-reachable buttons, and mobile-specific hero sizing/grid classes are present. A separate emulated-device screenshot was not available through the current Chrome CUA surface; responsive behavior remains a follow-up runtime check.

## Findings

- [P3] Hero crop is intentionally more panoramic than the source collage.
  Location: `src/pages/HomePage.tsx`, hero image object position.
  Evidence: the supplied hero image is a single garden/interior photograph while the source mockup composes several venue panels; the implementation uses the supplied asset as the hero background and keeps the hero compact.
  Impact: the single image cannot reproduce the mockup’s multi-panel collage pixel-for-pixel, but it preserves the intended venue, warmth, and text-left/image-right art direction.
  Fix: no blocking fix required. If desired later, provide a dedicated panoramic crop or a multi-panel asset matching the original mockup.

## Comparison history

1. Initial visual pass: the new hero asset was visible, but `object-position: center 44%` clipped too much of the neon-sign area in the compact hero.
2. Fix applied: changed the hero crop to `object-[center_27%]` in `src/pages/HomePage.tsx`.
3. Post-fix evidence: fresh Chrome capture at `http://127.0.0.1:3006/` shows the sign, plants, left cream copy area, and main storefront composition without layout collisions; lower showcase modules were also inspected after scrolling.
4. No actionable P0/P1/P2 findings remain.

## Implementation Checklist

- [x] Supplied hero image bundled and mapped to `ASSET_IMAGES.hero`.
- [x] Header, hero, category filters, showcase cards, display cases, and footer aligned to the reference direction.
- [x] Desktop live render verified in actual Chrome.
- [x] Hero crop rechecked after the visual fix.
- [x] TypeScript lint passed with `npm run lint`.
- [x] Production build passed with `npm run build`.
- [ ] Optional follow-up: capture a dedicated mobile/tablet QA pass when viewport emulation is available.

## Follow-up Polish

- [P3] A dedicated panoramic hero crop could more closely echo the multi-panel reference collage.
- [P3] Product-specific display-case photos can be curated further once the final catalog photography is available.

final result: passed
