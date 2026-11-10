---
description: Local development, packaging, and end-to-end test workflow across the four LCW codebases (omnichannel-sdk, omnichannel-chat-sdk, omnichannel-chat-widget, and the LCW host app in the Crm.Omnichannel mono repo at `Products/CustomerExperiences/LiveChatWidgetV2`). Paths and commands below assume the typical Windows layout with the three public repos cloned side-by-side under `c:\lcw`, the mono repo at `c:\gh\Crm.Omnichannel`, and a Git Bash shell; adjust for WSL (e.g. `/mnt/c/lcw/...`) or macOS/Linux (`~/src/lcw/...`) as needed. Use when changing code in any of these repos and validating the change in the locally served live chat widget (default `http://localhost:9000`).
applyTo: "**"
---

> 📌 **Canonical source:** [`microsoft/omnichannel-chat-sdk`](https://github.com/microsoft/omnichannel-chat-sdk/blob/main/.github/instructions/lcw-local-dev.instructions.md). This file is a synced copy — edit the canonical first, then propagate to the copies in `microsoft/omnichannel-sdk` and `microsoft/omnichannel-chat-widget`. The Crm.Omnichannel mono repo has an outdated pre-migration copy under `Products/CustomerExperiences/LiveChatWidgetV2/.github/instructions/`; Copilot does not load it (only the repo-root `.github/instructions/` is read), so don't rely on it.

# LCW multi-repo local development skill

This workspace contains four interlinked codebases that together produce the Live Chat Widget. The LCW host app used to live in the standalone `CRM.OmniChannel.LiveChatWidget` repo; it has been fully migrated to the `Crm.Omnichannel` mono repo (`Products/CustomerExperiences/LiveChatWidgetV2`). Don't make changes in the old standalone repo. When making a change in any one of them, follow the rules below to (a) propagate the change to the running widget for local testing and (b) prepare a clean PR per repo.

## Repo topology and dependency direction

```
omnichannel-sdk (low-level OC REST client)
        │  consumed by
        ▼
omnichannel-chat-sdk  (high-level chat SDK; owns ACS adapter dep)
        │  consumed by (via yarn link)
        ▼
omnichannel-chat-widget  (React widget components)
        │  consumed by (via npm link; chat-sdk comes in transitively)
        ▼
Crm.Omnichannel/Products/CustomerExperiences/LiveChatWidgetV2  (LCW host app, webpack bundle, serves localhost:9000)
```

Local paths:

| Repo | Path | Build command | Output |
|---|---|---|---|
| omnichannel-sdk | `c:\lcw\omnichannel-sdk` | `yarn build` | `lib/` |
| omnichannel-chat-sdk | `c:\lcw\omnichannel-chat-sdk` | `npm run build:tsc` | `lib/` |
| omnichannel-chat-widget | `c:\lcw\omnichannel-chat-widget\chat-widget` | `yarn build:esm && yarn build:cjs` | `lib/esm`, `lib/cjs` |
| LCW host (mono repo) | `c:\gh\Crm.Omnichannel\Products\CustomerExperiences\LiveChatWidgetV2\src` | `npm run build:webpack:dev` | `dist/v2scripts/ocw.js` |

`omnichannel-chat-widget` also has a sibling package `chat-components` under the same repo; build it the same way if you touched it.

## Linkage facts (verified)

- `omnichannel-chat-sdk` is symlinked into chat-widget via `yarn link`. Check with (Git Bash on Windows shown; WSL/macOS users substitute paths):
  ```bash
  ls -la /c/lcw/omnichannel-chat-widget/chat-widget/node_modules/@microsoft/omnichannel-chat-sdk
  ```
  The expected symlink target depends on which shell ran `yarn link` originally:
  - **Git Bash / PowerShell / cmd on Windows** (yarn installed for the Windows user): `C:\Users\<user>\AppData\Local\Yarn\Data\link\@microsoft\omnichannel-chat-sdk\` (Git Bash also surfaces this as `/c/Users/<user>/AppData/Local/Yarn/Data/link/...`; PowerShell: `$env:LOCALAPPDATA\Yarn\Data\link\...`).
  - **WSL** (yarn installed inside the WSL distro): `~/.config/yarn/link/@microsoft/omnichannel-chat-sdk` inside WSL — note this is the WSL user's home, not `%USERPROFILE%`. WSL accessing files under `/mnt/c/...` will see the Windows link store at `/mnt/c/Users/<user>/AppData/Local/Yarn/Data/link/...` instead.
  Mixing a Windows-installed yarn with a WSL-installed yarn is the most common reason `yarn link` appears to silently no-op — each yarn has its own link registry.
- The LCW host (`LiveChatWidgetV2/src`) uses **npm** (`package-lock.json`, `.npmrc` pointing at the OneCRM feed), not yarn. It depends on `@microsoft/omnichannel-chat-widget` and `@microsoft/omnichannel-chat-components` directly; `omnichannel-chat-sdk` is not a direct dependency and arrives through chat-widget. To test local builds, link chat-widget with npm, and re-link after every `npm install` / `npm ci` (they replace the symlinks):
  ```bash
  cd /c/gh/Crm.Omnichannel/Products/CustomerExperiences/LiveChatWidgetV2/src
  npm link /c/lcw/omnichannel-chat-widget/chat-widget
  ls -la node_modules/@microsoft/omnichannel-chat-widget
  ```
  Don't add `chat-components` to the same `npm link` call: the host's `package.json` pins `@microsoft/omnichannel-chat-components` in `overrides`, so npm fails with `EOVERRIDE` and links neither package. To test a local chat-components build, first remove its `overrides` entry locally, then `npm link` it. Never commit that change.
  The host webpack config keeps the default `resolve.symlinks: true`, so a linked chat-widget resolves `@microsoft/omnichannel-chat-sdk` from its own `c:\lcw\omnichannel-chat-widget\chat-widget\node_modules` (where chat-sdk is yarn-linked). Linking chat-sdk into chat-widget is therefore enough for chat-sdk changes to reach the host bundle.
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
cd /c/gh/Crm.Omnichannel/Products/CustomerExperiences/LiveChatWidgetV2/src
rm -rf node_modules/.cache/webpack
npm run build:webpack:dev   # runs `npm run lint` first (prebuild:webpack:dev)

# 5. Serve src/ statically (keep it running), then hard-reload the browser
python -m http.server 9000   # or any static server rooted at src/
#    Test page: http://localhost:9000/public/test.html
```

The test pages in `src/public` (`test.html`, `testCustom.html`, `oauthTest.html`, `testRules.html`) load the bundle from `../dist/v2scripts/`, so they need the on-disk build from step 4 served alongside them. Don't use `npm run start:webpack` for them: its dev server serves only `public/` at the root and the in-memory bundle at `/v2scripts/`, so `/dist/v2scripts/LiveChatBootstrapper.js` returns 404 and the widget never loads.

Wipe `node_modules/.cache/webpack` before every rebuild after editing a linked package, because webpack 5's persistent cache key does not invalidate on symlinked-source mtime changes.

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
5. **yarn.lock vs package-lock.json** — chat-sdk and the LCW host in the mono repo use npm (`package-lock.json`); omnichannel-sdk and omnichannel-chat-widget use yarn (`yarn.lock`). (`LiveChatWidgetV2/CLAUDE.md` in the mono repo still says Yarn; the tracked lockfile is `package-lock.json`.) Regenerate the right one for each repo when bumping deps.

## Per-repo PR preparation checklist

When opening a PR in **any** of the four codebases (for the LCW host, run these from `Products/CustomerExperiences/LiveChatWidgetV2`):

1. From the repo root: `git status --short` — confirm only intended files are modified.
2. Verify no stray node_modules edits: `git diff --stat | grep node_modules` should be empty.
3. Regenerate the lockfile cleanly:
   - chat-sdk and LCW host: `npm install --package-lock-only --no-audit --no-fund`
   - omnichannel-sdk and chat-widget: `yarn install` (let yarn rewrite `yarn.lock`)
4. Update the changelog (`CHANGELOG.md` or `CHANGE_LOG.md`) under the `## [Unreleased]` section with a one-line entry.
5. Run the repo's own build to confirm it compiles:
   - chat-sdk: `npm run build:tsc`
   - chat-widget: `yarn build:esm && yarn build:cjs`
   - omnichannel-sdk: `yarn build`
   - LCW host: `npm run build:webpack:dev`
6. Run lint/tests if the repo has a CI script: `npm run lint`, `npm test`, `yarn test`.
7. Branch naming convention used so far: `<alias>/<short-description>` (e.g. `coryeurom/pin-acs-adapter-beta.8`).
8. Push and open the PR. If the built-in GitHub PR tool fails with "Enterprise Managed User" errors, use the URL printed by `git push` or `gh pr create --base main --head <branch>`.

> **GitHub account note:** the `Crm.Omnichannel` mono repo is hosted on GitHub Enterprise (`microsoft.ghe.com/bic/Crm.Omnichannel`) and needs a **different GitHub identity** than the public repos. Use `gh ... --hostname microsoft.ghe.com` (or `GH_HOST=microsoft.ghe.com`) for its PRs. If pushing fails with 403/EMU errors, switch your credential helper / browser session to the authorized account before retrying. The other three repos (`omnichannel-sdk`, `omnichannel-chat-sdk`, `omnichannel-chat-widget`) generally share one identity.

## Cross-repo release ordering

When a change touches multiple repos, ship them bottom-up to avoid consumers pulling a stale published version:

1. Land + publish `omnichannel-sdk` (if changed).
2. Land + publish `omnichannel-chat-sdk`. Get the new published version number.
3. Bump `omnichannel-chat-sdk` dependency in `omnichannel-chat-widget`. Land + publish.
4. Bump `@microsoft/omnichannel-chat-widget` (exact version) in `Crm.Omnichannel/Products/CustomerExperiences/LiveChatWidgetV2/src/package.json`, following the "Updating shared chat packages" section of `LiveChatWidgetV2/README.md`. Tests in other parts of the mono repo gate the exact versions, so the same PR must also update, for example, `APPROVED_SDK_VERSION` in `LiveChatWidgetV2/combined/tests/sdkAdoptionCapability.test.ts` and the VNext pinned-V2 storage contract (`LiveChatWidgetVNext/src/test/pinnedV2StorageContract.ts` and its fixtures). That README section is the full, authoritative checklist. Land that PR.

For local testing only (steps 1–3 not needed), use yarn link / npm link instead of publishing.

## Quick verification helpers

```bash
# Which adapter version is actually installed in each tree?
for d in \
  /c/lcw/omnichannel-chat-sdk \
  /c/lcw/omnichannel-chat-widget/chat-widget \
  /c/gh/Crm.Omnichannel/Products/CustomerExperiences/LiveChatWidgetV2/src; do
  echo "== $d =="
  grep '"version"' "$d/node_modules/@microsoft/botframework-webchat-adapter-azure-communication-chat/package.json"
done

# Does the LCW bundle have the fast-poll fix?
grep -oE '[a-zA-Z_]+ <= 45' /c/gh/Crm.Omnichannel/Products/CustomerExperiences/LiveChatWidgetV2/src/dist/v2scripts/ocw.js | head -1
# Expect: something like "g <= 45" (4 hits total). Empty result = old adapter bundled.
```
