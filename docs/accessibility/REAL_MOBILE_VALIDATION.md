# Real Mobile Validation

Real mobile accessibility coverage is only **partially** solvable inside this repo. The repo can provide the matrix and supporting documentation, but the actual validation still needs either physical devices or a device cloud.

## When to use this matrix

Use real-mobile validation for issues that browser emulation does not reliably cover:

- software keyboard occlusion
- TalkBack or VoiceOver swipe gestures
- focus restoration after keyboard dismissal
- touch exploration behavior
- native mobile browser quirks

## Minimum matrix

| Platform | Browser | Screen reader | Primary scenarios |
|---|---|---|---|
| iOS | Safari | VoiceOver | landing page layout, focus order, on-screen keyboard overlap, chat input behavior |
| Android | Chrome | TalkBack | adaptive cards, attachment announcements, swipe-to-explore order, focus recovery |
| Android | Chrome | No SR | touch target size, reflow, viewport overlap, keyboard occlusion |

## Evidence checklist

For each device-backed pass, capture:

1. device model and OS version
2. browser version
3. screen reader state and verbosity if enabled
4. portrait vs. landscape orientation
5. whether the on-screen keyboard was visible
6. video or screenshots for layout/focus problems
7. exact gesture or key path used

## Relationship to repo tooling

The repo tooling should be used in this order:

1. run desktop and mobile-emulated visual coverage
2. run automated a11y/unit harnesses
3. use this matrix for the remaining device-only cases

## Selection guidance

- Physical devices are best for final validation of SR-specific bugs.
- A device cloud is acceptable for repeatable regression passes if it supports the needed browsers and screen-reader flows.
- If neither is available, keep the manual matrix and capture requirements in the bug so the missing coverage is explicit.
