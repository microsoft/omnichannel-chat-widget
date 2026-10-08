---
description: Local development, packaging, and end-to-end test workflow across the four LCW repos (omnichannel-sdk, omnichannel-chat-sdk, omnichannel-chat-widget, CRM.OmniChannel.LiveChatWidget). Paths and commands below assume the typical Windows layout with all four repos cloned side-by-side under `c:\lcw` and a Git Bash shell; adjust for WSL (e.g. `/mnt/c/lcw/...`) or macOS/Linux (`~/src/lcw/...`) as needed. Use when changing code in any of these repos and validating the change in the locally served live chat widget (default `http://localhost:9000`).
applyTo: "**"
---

> 📌 **Canonical source:** [`microsoft/omnichannel-chat-sdk`](https://github.com/microsoft/omnichannel-chat-sdk/blob/main/.github/instructions/lcw-local-dev.instructions.md). This file is a synced copy — edit the canonical first, then propagate to the other three repos.

# LCW multi-repo local development skill

This workspace contains four interlinked repos that together produce the Live Chat Widget. When making a change in any one of them, follow the rules below to (a) propagate the change to the running widget for local testing and (b) prepare a clean PR per repo.

## Repo topology and dependency direction

```
omnichannel-sdk (low-level OC REST client)
        │  consumed by
        ▼
omnichannel-chat-sdk  (high-level chat SDK; owns ACS adapter dep)
        │  consumed by (via yarn link)
        ▼
omnichannel-chat-widget  (React widget components)
        │  consumed by (via yarn link)
        ▼
CRM.OmniChannel.LiveChatWidget  (LCW host app, webpack bundle, serves localhost:9000)
```

Local paths:

| Repo | Path | Build command | Output |
|---|---|---|---|
| omnichannel-sdk | `c:\lcw\omnichannel-sdk` | `yarn build` | `lib/` |
| omnichannel-chat-sdk | `c:\lcw\omnichannel-chat-sdk` | `npm run build:tsc` | `lib/` |
| omnichannel-chat-widget | `c:\lcw\omnichannel-chat-widget\chat-widget` | `yarn build:esm && yarn build:cjs` | `lib/esm`, `lib/cjs` |
| CRM.OmniChannel.LiveChatWidget | `c:\lcw\CRM.OmniChannel.LiveChatWidget\src` | `SKIP_TS_CHECK=1 yarn build:webpack:dev` | `dist/v2scripts/ocw.js` |

`omnichannel-chat-widget` also has a sibling package `chat-components` under the same repo; build it the same way if you touched it.

## Linkage facts (verified)

- `omnichannel-chat-sdk` is symlinked into chat-widget and LCW via `yarn link`. Check with (Git Bash on Windows shown; WSL/macOS users substitute paths):
  ```bash
  ls -la /c/lcw/omnichannel-chat-widget/chat-widget/node_modules/@microsoft/omnichannel-chat-sdk
  ls -la /c/lcw/CRM.OmniChannel.LiveChatWidget/src/node_modules/@microsoft/omnichannel-chat-sdk
  ```
  The expected symlink target depends on which shell ran `yarn link` originally:
  - **Git Bash / PowerShell / cmd on Windows** (yarn installed for the Windows user): `C:\Users\<user>\AppData\Local\Yarn\Data\link\@microsoft\omnichannel-chat-sdk\` (Git Bash also surfaces this as `/c/Users/<user>/AppData/Local/Yarn/Data/link/...`; PowerShell: `$env:LOCALAPPDATA\Yarn\Data\link\...`).
  - **WSL** (yarn installed inside the WSL distro): `~/.config/yarn/link/@microsoft/omnichannel-chat-sdk` inside WSL — note this is the WSL user's home, not `%USERPROFILE%`. WSL accessing files under `/mnt/c/...` will see the Windows link store at `/mnt/c/Users/<user>/AppData/Local/Yarn/Data/link/...` instead.
  Mixing a Windows-installed yarn with a WSL-installed yarn is the most common reason `yarn link` appears to silently no-op — each yarn has its own link registry.
- `omnichannel-chat-widget` (the `chat-widget` and `chat-components` sub-packages) are likewise yarn-linked into LCW when working locally.
- The ACS adapter (`@microsoft/botframework-webchat-adapter-azure-communication-chat`) is a transitive dep installed independently in each of the three downstream node_modules trees. Lockfiles in each downstream repo pin it independently. Do **not** assume changing chat-sdk's `package.json` will alter the version installed in chat-widget or LCW node_modules — those come from their own lockfiles.

## The standard local-test loop (update → build → refresh)

When a change is made anywhere in the stack, rebuild every consumer below it, **wipe LCW's webpack cache**, then refresh the browser.

```bash
# 1. (if omnichannel-sdk changed)
cd /c/lcw/omnichannel-sdk && yarn build

# 2. (if omnichannel-chat-sdk changed)
cd /c/lcw/omnichannel-chat-sdk && npm run build:tsc

# 3. (if omnichannel-chat-widget changed)
cd /c/lcw/omnichannel-chat-widget/chat-widget && yarn build:esm && yarn build:cjs

# 4. ALWAYS for LCW (webpack cache MUST be wiped between linked-dep edits or
#    stale modules will be served even after rebuild)
cd /c/lcw/CRM.OmniChannel.LiveChatWidget/src
rm -rf node_modules/.cache/webpack
SKIP_TS_CHECK=1 yarn build:webpack:dev

# 5. Start (or keep running) the dev server, then hard-reload the browser
#    Test page: http://localhost:9000/lcw-test.html
```

If the LCW dev server is already running with file-watching, you still must wipe `node_modules/.cache/webpack` after editing a yarn-linked package, because webpack 5's persistent cache key does not invalidate on symlinked-source mtime changes.

## Common gotchas

1. **ACS adapter resolves to `0.0.1-beta-1` instead of `beta.N`** — caret ranges (`^0.0.1-beta.6` etc.) can resolve to the rogue prerelease `0.0.1-beta-1` even though intuitively it looks like `beta.6` should win. Why this happens per SemVer 2.0.0 §11.4:
   - Pre-release identifiers are split on `.`. `beta-1` is **one** identifier (the `-` is a literal character inside an alphanumeric identifier, not a separator). `beta.6` is **two** identifiers: `beta` and `6`.
   - The first identifiers are compared: `beta-1` (alphanumeric) vs `beta` (alphanumeric). Per §11.4.2 these are compared lexically in ASCII order. `beta` is a prefix of `beta-1`, so by ASCII string compare `beta-1` > `beta`.
   - The comparison resolves at position 1, so position 2 (`6`) of `beta.6` is never reached. Net ordering across the published versions: `0.0.1-beta-1` > `0.0.1-beta.8` > `0.0.1-beta.7` > … > `0.0.1-beta.1`.
   - Empirically confirmed: with `node-semver` (used by both npm and yarn), `semver.maxSatisfying(["0.0.1-beta.6","0.0.1-beta.7","0.0.1-beta.8","0.0.1-beta-1"], "^0.0.1-beta.6", { includePrerelease: true })` returns `0.0.1-beta-1`, and `yarn add ...@^0.0.1-beta.6` installs `0.0.1-beta-1`.

   Always **pin the exact version** (`"0.0.1-beta.8"`, no caret, no tilde) and verify with:
   ```bash
   grep '"version"' node_modules/@microsoft/botframework-webchat-adapter-azure-communication-chat/package.json
   ```
2. **Adapter is dual-entry** — `package.json` has `"main": "dist/chat-adapter"` (CommonJS minified) and `"module": "dist-esm/index"` (ESM). Webpack picks the `module` field, so when bundle-grepping for adapter code, search in dist-esm signatures, not the minified `dist/chat-adapter.js`.
3. **Variable mangling in the LCW bundle** — readable identifiers like `initialPollingOptimizationCount` become single letters (`g`, `d`, etc.) in `ocw.js`. Search for the numeric constants or unique string literals (e.g. `'Polling call issued too soon'`).
4. **Don't edit files in `node_modules`** for anything you intend to ship. Patches there must be either upstreamed (new published version) or persisted via `patch-package` / `yarn patch`. Always revert node_modules edits before opening a PR.
5. **yarn.lock vs package-lock.json** — chat-sdk uses npm (`package-lock.json`); the other three use yarn (`yarn.lock`). Regenerate the right one for each repo when bumping deps.

## Per-repo PR preparation checklist

When opening a PR in **any** of the four repos:

1. From the repo root: `git status --short` — confirm only intended files are modified.
2. Verify no stray node_modules edits: `git diff --stat | grep node_modules` should be empty.
3. Regenerate the lockfile cleanly:
   - chat-sdk: `npm install --package-lock-only --no-audit --no-fund`
   - others: `yarn install` (let yarn rewrite `yarn.lock`)
4. Update the changelog (`CHANGELOG.md` or `CHANGE_LOG.md`) under the `## [Unreleased]` section with a one-line entry.
5. Run the repo's own build to confirm it compiles:
   - chat-sdk: `npm run build:tsc`
   - chat-widget: `yarn build:esm && yarn build:cjs`
   - omnichannel-sdk: `yarn build`
   - LCW: `SKIP_TS_CHECK=1 yarn build:webpack:dev`
6. Run lint/tests if the repo has a CI script: `npm run lint`, `npm test`, `yarn test`.
7. Branch naming convention used so far: `<alias>/<short-description>` (e.g. `coryeurom/pin-acs-adapter-beta.8`).
8. Push and open the PR. If the built-in GitHub PR tool fails with "Enterprise Managed User" errors, use the URL printed by `git push` or `gh pr create --base main --head <branch>`.

> **GitHub account note:** `CRM.OmniChannel.LiveChatWidget` typically requires a **different GitHub identity** than the other three repos. If pushing or PR-opening to that repo fails with 403/EMU errors, switch your GitHub credential helper / browser session to the CRM-authorized account before retrying. The other three repos (`omnichannel-sdk`, `omnichannel-chat-sdk`, `omnichannel-chat-widget`) generally share one identity.

## Cross-repo release ordering

When a change touches multiple repos, ship them bottom-up to avoid consumers pulling a stale published version:

1. Land + publish `omnichannel-sdk` (if changed).
2. Land + publish `omnichannel-chat-sdk`. Get the new published version number.
3. Bump `omnichannel-chat-sdk` dependency in `omnichannel-chat-widget`. Land + publish.
4. Bump `omnichannel-chat-widget` dependency in `CRM.OmniChannel.LiveChatWidget`. Land that PR.

For local testing only (steps 1–3 not needed), use yarn link instead of publishing.

## Quick verification helpers

```bash
# Which adapter version is actually installed in each tree?
for d in \
  /c/lcw/omnichannel-chat-sdk \
  /c/lcw/omnichannel-chat-widget/chat-widget \
  /c/lcw/CRM.OmniChannel.LiveChatWidget/src; do
  echo "== $d =="
  grep '"version"' "$d/node_modules/@microsoft/botframework-webchat-adapter-azure-communication-chat/package.json"
done

# Does the LCW bundle have the fast-poll fix?
grep -oE '[a-zA-Z_]+ <= 45' /c/lcw/CRM.OmniChannel.LiveChatWidget/src/dist/v2scripts/ocw.js | head -1
# Expect: something like "g <= 45" (4 hits total). Empty result = old adapter bundled.
```
