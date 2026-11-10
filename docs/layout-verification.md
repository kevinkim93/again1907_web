# Layout investigation

## Reported desktop shrinkage

The supplied `layout_broken.png` shows the whole page at approximately one quarter of its intended size. Several independent dimensions match the original CSS at the same ratio:

| Element | Original CSS size | Approximate screenshot size |
| --- | ---: | ---: |
| Main/header content width | 1200px | 300px |
| Schedule content width | 1500px | 375px |
| Venue iframe height | 394px | 99px |
| Body text | 20px | 5px |

The browser toolbar also shows a zoom-out indicator. These observations strongly indicate browser page zoom near 25%, rather than a narrow container alone. The original browser session and its zoom setting were not accessible, so the exact setting is inferred from the screenshot, not directly measured.

On 2026-11-10, the live HTML at `https://again1907.kr/` and its linked stylesheets were fetched and inspected. The live viewport is already `width=device-width, initial-scale=1`. Its main width (1200px), schedule width (1500px), and map height (394px) match the baseline source at `c1b8504`.

The baseline source has no page `zoom` rule, no scale below 1, and no JavaScript that shrinks the document. Its only scale animation affects the decorative hero background, from 1.025 to 1. The root route also bypasses the legacy shell wrapper. This rules out those code paths as the cause of the uniform shrinkage.

For the affected browser, press **Ctrl+0** to restore 100% page zoom before reviewing. Site CSS should not apply an inverse scale: that would make the page oversized for visitors using normal zoom and interfere with their zoom preferences.

## Independent responsive issue

The original hero remains in two columns down to 761px, while its title keeps a minimum English size of 58px and Korean size of 52px. At a 768px viewport, the copy column is only about 302px wide. This is a separate tablet layout weakness; tablet layouts should stack the hero before its typography becomes crowded.

The schedule already has a horizontally scrollable wrapper and an enhanced mobile day selector. Runtime verification should check both behaviors, plus body overflow, at 375, 768, 1280, and 1920px with normal page zoom.

## Changes and verification (2026-11-10)

The main container now allows 1320px. The hero, header and venue layout stack
through 960px. The schedule switches to date selection based on its own width
(720px or less), and shows its scroll hint whenever the full table cannot fit.
The table retains 19px text and a 1340px minimum width in the all-days view.

Expected dimensions from the CSS, **not browser measurements**:

| Viewport | Main content | Homepage schedule | Expected schedule view |
| --- | ---: | ---: | --- |
| 375px | 335px | 335px | Date selection |
| 768px | 704px | 688px | Date selection |
| 1280px | 1184px | 1200px | All days, horizontal scroll |
| 1920px | 1320px | 1500px | All days fit |

The dedicated `/gathering/schedule` page is capped at 1320px, so its all-days
table still scrolls slightly even at 1920px; the hint correctly stays visible.
Without JavaScript or container-query support, the full scrollable table remains
available. Schedule content and registration behavior are unchanged.

Completed checks:

- ESLint passed for every modified JavaScript file.
- `git diff --check` passed.
- Artwork XML, font glyph coverage and bounds checked. Poster, theme and share
  compositions visually inspected using the bundled-font raster previews.
- Social PNG is 1200 × 630; rebuilding it produced identical hashes.

Environment limits:

- Node 22.21.0 is installed; the project declares Node 20. Dependencies were
  installed from the existing lockfile with `npm ci --ignore-scripts` and a local
  cache because the sandbox denied the default cache and lifecycle subprocesses.
  Package manifest, lockfile and deployment configuration are unchanged.
- `npm run build` compiled successfully with Next.js 16.0.8, then failed when
  TypeScript checking attempted to start a worker (`spawn EPERM`). A temporary
  worker-thread configuration got through page-data collection but failed in
  static generation with `DataCloneError`. That configuration was restored;
  **a full production build has not passed in this environment**.
- The preview server could not bind to `127.0.0.1:3000` (`EACCES`). Headless
  browser launch also failed (`EPERM`), and the browser-access host was unavailable.
  **375/768/1280/1920px browser rendering and interaction checks remain pending**.
- The workspace's `.git` directory is read-only in this session, preventing the
  requested local commit. No push or deployment was attempted.

Before pushing, use Node 20, run `npm ci` and `npm run build`, then check `/` and
`/gathering/schedule` at the four widths above with normal page zoom. On compact
layouts, select each of the six dates and check the corresponding sessions; on
desktop, scroll to Saturday and verify that only the table scrolls horizontally.
Also inspect the standalone poster download and `/gathering/media`.
