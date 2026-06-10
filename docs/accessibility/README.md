# Accessibility Tooling

This repo now includes a first-pass accessibility tooling foundation for LCW package development. It focuses on **tooling surfaces and public-safe documentation**, not the full test suites for each bug yet.

## What is included

| Capability | Location | Notes |
|---|---|---|
| Mobile/reflow/zoom/forced-colors Storybook screenshot profiles | `tools\accessibility\storybookProfiles.cjs` | Shared by `chat-widget` and `chat-components`; keeps the default visual flow unchanged unless a profile script or env var is used. |
| Per-story axe-core scan harness | `tools\accessibility\axeScan.cjs` | Serves the built Storybook locally and runs `@axe-core/playwright` against every story. Adding a story automatically expands coverage. |
| Microsoft Accessibility Insights scan harness | `tools\accessibility\insightsScan.cjs` | Wraps the `accessibility-insights-scan` CLI against the built Storybook. Same engine as axe (see overlap note below) but emits the MS-curated HTML report. |
| `@axe-core/react` dev opt-in | `chat-*\.storybook\preview.js` | Gated on `STORYBOOK_AXE_DEV=true`; logs violations to the browser console while running `yarn storybook`. No effect on production builds. |
| Package a11y Jest harness | `chat-widget\jest.config.a11y.cjs`, `chat-components\jest.config.a11y.cjs` | Ready for `*.a11y.spec.*` / `*.a11y.test.*` files; safe when no tests exist yet. |
| `jest-axe` setup | `chat-widget\jest.setup.a11y.js`, `chat-components\jest.setup.a11y.js` | Adds `jest-axe` matchers for future component/state accessibility tests. |
| Non-gating manual / nightly scan workflow | `.github\workflows\accessibility-scan.yml` | Runs both axe and Accessibility Insights against built Storybook for both packages on `workflow_dispatch` and a nightly schedule, uploading reports as artifacts. Does not run on PR and does not fail the build. |
| Screen-reader repro docs | `docs\accessibility\NVDA_SETUP.md`, `docs\accessibility\NARRATOR_SETUP.md` | Public-safe local setup and evidence capture guidance. |
| Real-mobile validation matrix | `docs\accessibility\REAL_MOBILE_VALIDATION.md` | Covers the device-backed scenarios the repo alone cannot fully automate. |

## Two scan engines, one rule set: read this first

`@axe-core/playwright` and `accessibility-insights-scan` **both run axe-core internally**. They are not additive in raw rule count. Pick a single primary engine and treat the other as a complementary surface:

- **Use the axe scan** for fast feedback and CI artifacts. It's lightweight, scriptable, and produces compact JSON.
- **Use Accessibility Insights** when you need the MS-curated HTML report, results mapped to MAS rule IDs, or the manual *Assessment* workflow in the browser extension (which the CLI does not cover).

> **Cost vs. benefit of running both.** `accessibility-insights-scan` adds roughly **3 MB** of `node_modules` (Puppeteer-flavored Chromium fetcher + report renderer) and roughly **doubles** scan wall-clock time vs. axe-only because it re-walks every story under its own browser. Keep it in the nightly / on-demand workflow for the MS-curated report and Assessment hand-off, but don't add it to the per-PR gate — axe alone covers the rule set.

Neither engine automatically covers these dimensions; they need the dedicated profiles or future per-component specs:

| Dimension | How it's covered |
|---|---|
| 1.4.4 Resize text 200% | `test:visual:zoom` profile |
| 1.4.10 Reflow at 320px | `test:visual:reflow` profile |
| Mobile rendering / orientation | `test:visual:mobile:ios`, `test:visual:mobile:android` |
| Forced Colors (Windows High Contrast) | `test:visual:forced-colors` profile |
| `prefers-contrast: more` | `test:visual:contrast-more` profile |
| 2.1.1 Keyboard / 2.4.3 Focus order | `chat-widget/automation_tests/e2e/utility/keyboardLoop.ts` + `expectTabOrder.ts`; per-flow specs under `e2e/areas/accessibility/keyboard/` |
| 2.4.7 Focus visible | `focus-ring` + `focus-ring-forced-colors` screenshot profiles, plus future per-component focus specs |
| 4.1.3 Status messages (aria-live) | `chat-widget/automation_tests/e2e/utility/liveRegionObserver.ts` |
| Accessibility-tree shape (link/role/name) | `chat-widget/automation_tests/e2e/utility/a11yTree.ts` (`page.accessibility.snapshot`) |
| Live (post-mount) widget axe scan | `chat-widget/automation_tests/e2e/utility/axeOnPage.ts` |
| Desktop NVDA (Windows) | `tools/accessibility/setupNvda.ps1` + `srAssert.ts`; specs under `e2e/areas/accessibility/sr-nvda/` (Guidepup-driven; soak-only CI job until stable) |
| iOS VoiceOver / Android TalkBack / macOS VoiceOver / JAWS | Not automated — see `REAL_MOBILE_VALIDATION.md`, `NVDA_SETUP.md`, `NARRATOR_SETUP.md` |

### WCAG 2.2 success criteria

The axe / Accessibility Insights rule set defaults to `wcag2a, wcag2aa, wcag21aa, best-practice` (see `axeScan.cjs --tags`). The new WCAG 2.2 success criteria below are **not yet covered** by either automated engine here and are tracked as gaps:

| WCAG 2.2 SC | Title | Status in this repo |
|---|---|---|
| 2.4.11 | Focus Not Obscured (Minimum) — AA | Not asserted; manual review during the focus-pass triage |
| 2.4.13 | Focus Appearance — AAA | Partially covered by `focus-ring` + `focus-ring-forced-colors` screenshot profiles; no per-pixel contrast/area assertion |
| 2.5.7 | Dragging Movements — AA | Not asserted; the widget surfaces no drag-only interactions today, but new features should add a non-drag path before AA claim |
| 2.5.8 | Target Size (Minimum) — AA | Not asserted; candidate for an axe `runOnly` extension or a focused per-story spec |
| 3.2.6 | Consistent Help — A | Doc-level only |
| 3.3.7 | Redundant Entry — A | Doc-level only |
| 3.3.8 | Accessible Authentication (Minimum) — AA | Out of scope for the widget itself |

Adding 2.2 enforcement to the axe runs is tracked under `tools/accessibility/axeScan.cjs --tags`; the default value can be expanded to `wcag22aa` once the existing 2.1 backlog burns down.

### Catcher confidence tiers

a11y "catcher" specs in this repo fall into two distinct confidence tiers. A reader (or PR reviewer) needs to know which tier a spec belongs to in order to judge whether a green run actually rules out a regression.

| Tier | What it asserts | Trust level | Examples |
|---|---|---|---|
| **Direct DOM** | A specific DOM contract that maps 1:1 to the user-visible accessibility behavior the bug is about — role, accessible name, `aria-*`, focus order, programmatic announcement region. | **High.** A green run is strong evidence the bug is fixed. A regression flips the spec red. | `PostChatLoadingPaneStateful.a11y.spec.tsx` asserting `role="status"` on the loading region; keyboard-traversal specs asserting an explicit tab order. |
| **Proxy / state** | An indirect signal that *correlates* with the accessibility behavior but does not prove it — `document.activeElement` after a reload, internal state flags, render counts, `data-*` attributes added for test-only observability. | **Best-effort.** A green run is necessary but not sufficient; the bug class still needs a manual screen-reader pass to confirm. A red run is still actionable (the proxy is broken), but a green run does not close the bug. | Focus-trap-after-reload specs that check `document.activeElement` rather than the AT focus; specs that watch a `data-state="loaded"` attribute as a stand-in for an aria-live announcement. |

**How to tell which tier a spec belongs to.** Read the spec's outermost `expect(...)`:

- If it walks the *accessibility tree* (`page.accessibility.snapshot`, axe rules, role/name lookups, `getByRole(...)`), or asserts that a specific `aria-*`/`role`/announcement region exists, it's **Direct DOM**.
- If it walks the *DOM* in a way the screen reader does not directly observe (`document.activeElement` after a reload, internal `data-state` markers, render-count or store-state assertions), or relies on a `wait` to "let the announcement fire" without inspecting the announcement region, it's **Proxy / state**.

**Naming convention (deferred).** A future sweep will rename best-effort proxies to `*.a11y.proxy.spec.ts` (or `.tsx`) so the tier is visible at a glance in test output, and keep direct DOM catchers as plain `*.a11y.spec.ts`. The rename is intentionally **not** part of this doc pass because there are several in-flight per-bug fix PRs that would all conflict on rebase. Once the foundation PR and its dependent fix PRs land, the rename will be a single mechanical sweep that also stamps each spec with the bug it guards. Track this under issue [#919](https://github.com/microsoft/omnichannel-chat-widget/issues/919).

### RTL / locale coverage

Today every catcher spec, screenshot profile, and NVDA phrase catalog assumes **left-to-right, English (en-US)**. Two real gaps:

- **No `dir="rtl"` story variants.** Mirrored layouts are exercised manually only. Bidi-related focus order and label-association regressions would not be caught by any of the existing automation. Adding an RTL screenshot profile (similar to `forced-colors`) is the cheapest first step.
- **No non-English NVDA phrase catalog.** `tools/accessibility/nvda-phrases.json` ships English phrases against NVDA `2024.4`. NVDA cadence and verb forms vary per locale, so adding a Japanese (`ja-JP`) or Arabic (`ar`) profile means adding a parallel phrase file (e.g. `nvda-phrases.ja.json`) and a small accessor change in `srAssert.ts`. Until that lands, locale-specific announcement bugs need a manual sweep.

Both items are tracked under issue [#920](https://github.com/microsoft/omnichannel-chat-widget/issues/920).

## Prerequisites

The accessibility tooling reuses the existing per-package install flow. Nothing extra needs to be installed globally.

1. **Install package dependencies** in the package you intend to test. This pulls in `jest-axe`, `playwright`, `@axe-core/playwright`, `@axe-core/react`, and `accessibility-insights-scan`.

   ```powershell
   cd chat-widget        # or: cd chat-components
   yarn install
   ```

2. **Install Playwright browsers** before running any `test:visual:*` or `scan:a11y:*` command. Both packages auto-install via the `pretest:visual` hook; if you ever need to run it explicitly:

   ```powershell
   yarn playwright install chromium
   ```

3. **`test:a11y` status differs by package.** Both jest configs use `passWithNoTests: true`, so the command is always safe to run.
   - `chat-components` currently ships **no** `*.a11y.spec.*` / `*.a11y.test.*` files, so `yarn test:a11y` reports "No tests found, exiting with code 0". This is expected for the tooling-foundation pass.
   - `chat-widget` already ships at least one a11y spec (`EmailTranscriptPaneStateful.a11y.spec.tsx`), so `yarn test:a11y` runs and passes.

4. **`scan:a11y:*` requires a built Storybook.** Use the `*:build` variants (e.g. `scan:a11y:axe:build`) if `storybook-static/` does not yet exist; they run `yarn build-storybook` first.

## Commands

### `chat-widget`

```powershell
cd chat-widget

# Component-level (jest + jest-axe)
yarn test:a11y

# Visual screenshot profiles
yarn test:visual:mobile:ios
yarn test:visual:mobile:android
yarn test:visual:reflow
yarn test:visual:zoom
yarn test:visual:forced-colors
yarn test:visual:contrast-more

# Per-story axe-core scan
yarn scan:a11y:axe:build       # builds storybook then scans
yarn scan:a11y:axe             # assumes storybook-static/ exists

# Microsoft Accessibility Insights scan
yarn scan:a11y:insights:build
yarn scan:a11y:insights

# Run both scans (after a fresh build)
yarn scan:a11y

# Dev: open `yarn storybook` with @axe-core/react reporting violations to the browser console
$env:STORYBOOK_AXE_DEV = "true"; yarn storybook
```

`chat-components` exposes the same script names; substitute the `cd` target.

## Environment variables

| Variable | Purpose | Example |
|---|---|---|
| `STORYBOOK_SCREENSHOT_PROFILE` | Selects the named screenshot profile from `tools\accessibility\storybookProfiles.cjs` | `forced-colors` |
| `STORYBOOK_BROWSERS` | Limits Playwright browser launches for the run | `chromium` or `["chromium","firefox"]` |
| `STORYBOOK_AXE_DEV` | Enables `@axe-core/react` runtime reporter inside `yarn storybook` | `true` |
| `A11Y_SCAN_SKIP_STORIES` | Comma-separated story IDs to skip during `scan:a11y:axe` | `welcome--default,demo--broken` |

## `axeScan.cjs` flags

| Flag | Default | Purpose |
|---|---|---|
| `--storybook-dir` | `./storybook-static` | Path to the built Storybook |
| `--report-dir` | `./accessibility-reports` | Where the JSON report is written |
| `--port` | `0` (random) | Port for the local static server |
| `--tags` | `wcag2a,wcag2aa,wcag21aa,best-practice` | axe `runOnly` tag list |
| `--fail-on` | `none` | One of `none\|minor\|moderate\|serious\|critical\|any`; the foundation default never fails |
| `--story-timeout` | `15000` | Per-story render timeout in ms |
| `--include` | _(unset)_ | Regex applied to story IDs (allow-list) |
| `--exclude` | _(unset)_ | Regex applied to story IDs (deny-list) |

## Public repo note

This repo intentionally does **not** include MAS rule mapping or internal-only compliance references. Those need to stay outside the public source tree. The Accessibility Insights HTML report it generates is safe to publish as a PR artifact; it cites public WCAG / Section 508 references only.

## Next step after this tooling pass

Use these harnesses to add targeted accessibility tests incrementally:
1. component/state axe scans in package test suites
2. mobile/reflow/zoom/forced-colors screenshot coverage for affected stories
3. a real keyboard-traversal Playwright spec for the live widget shell
4. manual/device-backed validation for scenarios that emulation cannot reproduce

## Current scan baselines

| Package | Stories | Violations | Critical | Serious | Moderate |
|---|---:|---:|---:|---:|---:|
| `chat-components` | 73 | 135 | 7 | 12 | 116 |
| `chat-widget`     | 10 | 19  | 0 | 1  | 18  |

`chat-widget` violations (10 stories): 9× `landmark-one-main`, 9× `page-has-heading-one`, 1× `aria-command-name` (real, in `live-chat-widget-custom-2`; tracked in [#920](https://github.com/microsoft/omnichannel-chat-widget/issues/920) — see the inline `TODO` next to `LiveChatWidgetCustom2` in `chat-widget/src/components/livechatwidget/LiveChatWidget.stories.tsx` for the source location). The two `landmark-*` rules are story-isolation artifacts (no `<main>` on a Storybook canvas) and are good candidates to suppress on a per-story basis once L1.2 triage lands.

`chat-components` violations (73 stories) are dominated by structural story-isolation artifacts; see `accessibility-reports/axe-report.json` after a fresh `yarn scan:a11y:axe:build` for the per-story breakdown.

## Reading the Insights HTML report locally

After `yarn scan:a11y:insights:build`, open `accessibility-reports/insights/index.html` in a browser. The summary header lists violation counts by impact and by rule ID. Each finding links to the specific WCAG SC and to a remediation reference. The HTML is safe to share publicly — it cites only public WCAG/Section 508 references and does not include Microsoft-internal rule mappings.

## Screen-reader (NVDA) specs

Phase 3 adds a Guidepup-driven NVDA harness for desktop screen-reader assertions:

- `tools/accessibility/setupNvda.ps1` — silent NVDA install at a pinned version. Idempotent; safe to run repeatedly.
- `tools/accessibility/nvda-phrases.json` — single source of truth mapping abstract events (e.g. `chatButtonFocused`) to expected NVDA phrases. Bumped when NVDA cadence changes.
- `chat-widget/automation_tests/e2e/utility/srAssert.ts` — `expectAnnounced(sr, "...")` / `expectAnnouncedEvent(sr, "messageReceived")`.
- `.github/workflows/accessibility-sr.yml` — soak-only PR workflow; concurrency-limited to 1 because NVDA is single-instance per host. Runtime: ~10s per spec due to real speech synthesis.

To run NVDA specs locally on Windows:

```powershell
pwsh -File tools/accessibility/setupNvda.ps1
cd chat-widget
yarn build-sample
yarn jest -c automation_tests/jest.config.js --runInBand --testPathPattern "automation_tests/e2e/areas/accessibility/sr-nvda"
```

NVDA must already be installable via the public NV Access download URL; corporate proxies should allow `https://www.nvaccess.org/download/`.

## Out of scope (still)

- macOS VoiceOver — would require adding a macOS runner; defer.
- iOS VoiceOver — Apple does not expose announcement capture; manual sweep before release.
- Android TalkBack — accessibility-service capture is fragile; manual sweep before release.
- JAWS — commercial; NVDA already covers the desktop SR layer.

