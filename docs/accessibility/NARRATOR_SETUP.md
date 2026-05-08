# Narrator Setup

Use this setup when validating the Microsoft Narrator-specific issues tracked against LCW.

## Recommended environment

| Item | Recommendation |
|---|---|
| OS | Windows 11 |
| Browser | Edge first, then Chrome if needed |
| Screen reader | Built-in Narrator |
| Widget build | Current local branch build or Storybook sample |

## Setup

1. Turn on Narrator from Windows Accessibility settings.
2. Set verbosity to a stable level for the session and do not change it mid-repro.
3. Decide up front whether the repro should be run in scan mode, focus mode, or both.
4. Disable unrelated browser extensions and use a clean profile when possible.

## Repro checklist

Capture the following at the start of each pass:

- branch / commit
- browser and version
- Narrator mode and verbosity
- page, story, or sample under test
- exact sequence of Tab, Shift+Tab, arrow, Enter, and Space inputs

## Evidence to keep

1. Narrator spoken output transcript or screen recording with audio
2. Focus movement notes for every interactive step
3. Screenshot when overlap, reflow, or focus visibility is part of the bug
4. Browser console errors if they explain broken announcements or focus jumps

## Suggested workflow

1. Start the LCW surface to validate.
2. Enable Narrator and confirm the intended mode.
3. Reproduce once without stopping to observe the full announcement sequence.
4. Reproduce a second time while capturing the evidence.
5. Compare against expected announcement wording and focus order.

## Known limits

- Narrator behavior diverges from NVDA enough that both passes remain necessary.
- Mobile screen-reader gesture issues still require device-backed validation.
