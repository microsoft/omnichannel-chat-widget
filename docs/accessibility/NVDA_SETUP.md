# NVDA Setup

Use this setup when reproducing or validating Windows screen-reader behavior against the LCW widget in a public-safe local environment.

## Recommended environment

| Item | Recommendation |
|---|---|
| OS | Windows 11 |
| Browser | Edge and Chrome |
| Screen reader | Latest NVDA stable release |
| Widget build | Current local branch build or Storybook sample |

## Setup

1. Install NVDA from the public NV Access distribution.
2. Enable **Speech Viewer** so announcement output is visible and copyable during repro.
3. Keep the default keyboard layout unless a bug explicitly depends on laptop layout.
4. Use a normal browser profile with extensions disabled when possible.

## Repro checklist

Before each run, capture:

- repo branch / commit
- package (`chat-widget` or `chat-components`)
- browser and version
- NVDA version
- page or story under test
- exact keyboard path taken

## Evidence to keep

For each validation or bug repro:

1. Speech Viewer text
2. Focus order / key sequence used
3. Screenshot or screen recording when layout/focus is involved
4. Any browser console errors that correlate with the issue

## Suggested workflow

1. Start the target app or Storybook surface.
2. Start NVDA, then open Speech Viewer.
3. Reproduce with keyboard only.
4. Copy the relevant Speech Viewer output into the bug or test evidence.
5. Record whether the behavior differs between browse mode and focus mode.

## Known limits

- NVDA output can vary slightly by browser and mode.
- Some mobile-only issues are not reproducible in NVDA and need the real-mobile matrix instead.
