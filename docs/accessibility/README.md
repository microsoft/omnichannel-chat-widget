# Accessibility Tooling

This repo now includes a first-pass accessibility tooling foundation for LCW package development. It focuses on **tooling surfaces and public-safe documentation**, not the full test suites for each bug yet.

## What is included

| Capability | Location | Notes |
|---|---|---|
| Mobile/reflow/zoom Storybook screenshot profiles | `tools\accessibility\storybookProfiles.cjs` | Shared by `chat-widget` and `chat-components`; keeps the default visual flow unchanged unless a profile script or env var is used. |
| Package a11y Jest harness | `chat-widget\jest.config.a11y.cjs`, `chat-components\jest.config.a11y.cjs` | Ready for `*.a11y.spec.*` / `*.a11y.test.*` files; safe when no tests exist yet. |
| `jest-axe` setup | `chat-widget\jest.setup.a11y.js`, `chat-components\jest.setup.a11y.js` | Adds `jest-axe` matchers for future component/state accessibility tests. |
| Screen-reader repro docs | `docs\accessibility\NVDA_SETUP.md`, `docs\accessibility\NARRATOR_SETUP.md` | Public-safe local setup and evidence capture guidance. |
| Real-mobile validation matrix | `docs\accessibility\REAL_MOBILE_VALIDATION.md` | Covers the device-backed scenarios the repo alone cannot fully automate. |

## Commands

### `chat-widget`

```powershell
cd chat-widget
yarn test:a11y
yarn test:visual:mobile:ios
yarn test:visual:mobile:android
yarn test:visual:reflow
yarn test:visual:zoom
```

### `chat-components`

```powershell
cd chat-components
yarn test:a11y
yarn test:visual:mobile:ios
yarn test:visual:mobile:android
yarn test:visual:reflow
yarn test:visual:zoom
```

## Environment variables

The visual-profile scripts are thin wrappers over two environment variables:

| Variable | Purpose | Example |
|---|---|---|
| `STORYBOOK_SCREENSHOT_PROFILE` | Selects the named screenshot profile from `tools\accessibility\storybookProfiles.cjs` | `mobile-iphone` |
| `STORYBOOK_BROWSERS` | Limits Playwright browser launches for the run | `chromium` or `["chromium","firefox"]` |

## Public repo note

This repo intentionally does **not** include MAS rule mapping or internal-only compliance references. Those need to stay outside the public source tree.

## Next step after this tooling pass

Use these harnesses to add targeted accessibility tests incrementally:
1. component/state axe scans in package test suites
2. mobile/reflow/zoom screenshot coverage for affected stories
3. manual/device-backed validation for scenarios that emulation cannot reproduce
