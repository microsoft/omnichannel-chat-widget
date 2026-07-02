# Android accessibility-tree check (focus escape)

Open-source, device-free validation for the Live Chat Widget "focus escape"
behavior, where a screen reader can still reach the host page while the widget
is open. It runs on the standard Android emulator (AOSP / Google APIs image) with
Appium + UiAutomator2, so it needs no physical device and no paid tooling.

## Why this exists (the gap it fills)

The existing Playwright test (`automation_tests/e2e/areas/accessibility/mobileFocusTrap.spec.ts`)
runs desktop Chromium at a phone viewport and checks only the keyboard Tab
boundary. It never builds the Android accessibility tree, so it cannot tell
whether `aria-hidden` on ancestor-level siblings actually removes the background
from what an Android TalkBack swipe can reach. That residual gap is documented in
`docs/accessibility/REAL_MOBILE_VALIDATION.md`.

This harness closes part of that gap: it launches the emulator's real Chrome with
`--force-renderer-accessibility` (which exports the web accessibility tree into the
native Android accessibility tree), opens the widget, then reads the NATIVE tree
via UiAutomator2 and asserts the background markers are gone.

It exercises the real product function `setAriaHiddenForSiblings`
(`chat-widget/src/common/utils.ts`), extracted at build time by `build-util.js`,
so reverting the fix flips the result from GREEN to RED. It is a genuine catcher.

## What it does NOT cover

- It does not run TalkBack's speech engine, so it cannot assert spoken output.
  Emulator Chrome a11y export is very close to, but not identical to, a physical
  device. Final sign-off still needs on-device TalkBack (Android) and VoiceOver
  (iOS). VoiceOver / the iOS Simulator are Apple-only and not open source.

## Open-source stack

| Layer | Tool | License |
| --- | --- | --- |
| Device | Android Emulator (AVD), Android SDK | Apache 2.0 tooling |
| Automation | Appium + UiAutomator2 driver | Apache 2.0 |
| Client | WebdriverIO | MIT |
| Bundler | esbuild (already in chat-widget) | MIT |

## Prerequisites

1. Android SDK with `platform-tools` (adb) and `emulator`, an AVD created, and
   the emulator booted (`adb devices` shows `device`).
2. Java 17+ and Node 18+.
3. Install deps once:
   ```
   npm install
   npx appium driver install uiautomator2
   ```

## Run

Boot an emulator first, then:

```
# one-shot (Windows): builds, serves, starts Appium, runs, tears down
pwsh ./run-all.ps1
```

Or manually, in three terminals:

```
npm run build:util        # extract setAriaHiddenForSiblings into public/focusEscapeUtil.bundle.js
npm run serve             # static server on :8099
npm run appium            # Appium server on :4723
npm test                  # the accessibility-tree check
```

Exit code `0` = GREEN (focus escape does not reproduce), `1` = RED or harness error.

## Proving RED (catcher check)

From `chat-widget/`, temporarily revert the fix, rebuild, and re-run:

```
git stash push src/common/utils.ts     # reverts to the one-level implementation
npm --prefix automation_tests/android-a11y run build:util
npm --prefix automation_tests/android-a11y test   # expect RED: background still reachable
git stash pop                           # restore the fix
```
