# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Public React component library (`@microsoft/omnichannel-chat-widget`) for building Omnichannel chat UIs. Published to npm and consumed by CRM.OmniChannel.LiveChatWidget and external customers.

**Two independent packages (no Lerna/Nx):**
- **chat-components** (`@microsoft/omnichannel-chat-components`) — Stateless UI primitives (buttons, panes, header, footer)
- **chat-widget** (`@microsoft/omnichannel-chat-widget`) — Stateful chat widget components integrating chat-components + omnichannel-chat-sdk

## Build & Test Commands

All commands use **yarn**. Run from within the respective package directory (`chat-components/` or `chat-widget/`).

### chat-components

```bash
cd chat-components
yarn install
yarn build              # lint + ESM + CJS + types
yarn test:unit          # Jest unit tests (jsdom)
yarn test:visual        # Playwright visual regression tests
yarn test:all           # unit + visual
yarn storybook          # localhost:6006
yarn build-storybook    # static storybook build
```

### chat-widget

```bash
cd chat-widget
yarn install
yarn build              # clean + lint + ESM + CJS + types
yarn lint               # ESLint (--max-warnings=0)
yarn test:unit          # Jest unit tests (jsdom)
yarn test:visual        # Playwright visual regression tests
yarn test:all           # unit + visual
yarn test:e2e           # Playwright E2E (from automation_tests/)
yarn storybook          # localhost:6006
yarn build-sample       # build widget + webpack sample app (dist/out.js)
yarn dev                # watch mode (ESM + webpack)
```

### Running a single test

```bash
# Run one test file
yarn jest -c jest.config.unit.cjs --env=jsdom --runInBand path/to/Component.test.tsx

# Run tests matching a pattern
yarn jest -c jest.config.unit.cjs --env=jsdom --runInBand -t "test name pattern"
```

## Architecture

### Build Pipeline
- **Babel** compiles TypeScript/React to dual output: ESM (`lib/esm/`) and CJS (`lib/cjs/`)
- **TypeScript** (`tsc`) generates declaration files only (`lib/types/`)
- **Webpack** bundles sample apps and UMD builds
- Separate babel configs: `babel.config.json` (CJS) and `babel.esm.config.json` (ESM)
- Some webpack/storybook commands require `NODE_OPTIONS=--openssl-legacy-provider`

### Styling
All styling uses **Fluent UI** (`@fluentui/react`) inline style objects (`IStyle`, `IStackStyles`, etc.) — no CSS files, no CSS modules, no styled-components.

### Component Pattern (chat-components)
Each component directory contains:
- `ComponentName.tsx` — Implementation
- `ComponentName.test.tsx` — Unit tests
- `ComponentName.stories.tsx` — Storybook stories
- `interfaces/IComponentNameProps.ts` — Prop types (+ control props, style props)
- `common/defaultProps/` — Default prop values
- `common/defaultStyles/` — Default Fluent UI style objects
- `__screenshots__/` — Visual regression baselines

### chat-widget Stateful Layer
`chat-widget/src/components/` wraps chat-components with state management:
- `livechatwidget/` — Main orchestrator component
- Stateful wrappers for each pane (prechat, postchat, loading, etc.)
- `contexts/` — React context providers
- `common/` — Telemetry, storage, facades, utilities
- `plugins/` — BotFramework WebChat integration

### Key Dependencies
- `@fluentui/react` — UI framework and styling
- `@microsoft/omnichannel-chat-sdk` — Chat operations (peer dep of chat-widget)
- `botframework-webchat` — Message rendering
- `markdown-it` + `dompurify` + `sanitize-html` — Message sanitization

## Code Style

- 4-space indentation, double quotes, semicolons required
- Windows line endings (`\r\n`)
- `husky` + `lint-staged` runs ESLint on commit
- chat-components uses ESLint flat config (`eslint.config.js`); chat-widget uses legacy config (`.eslintrc.json`)

## CI (GitHub Actions)

PR checks run on `windows-2022`:
- **chat-components-pr.yml** (Node 22): unit tests, storybook build, VRT, package build
- **chat-widget-pr.yml** (Node 20): danger JS, unit tests, E2E tests, storybook build, VRT, package build

VRT failure artifacts upload diff screenshots from `__diff_output__/`.

## Related Repositories

| Repo | Purpose |
|------|---------|
| CRM.Omnichannel | Backend microservices |
| CRM.OmniChannel.ConversationControl | Agent UI |
| CRM.OmniChannel.LiveChatWidget | Customer-facing widget (consumes this library) |
| omnichannel-chat-sdk | TypeScript SDK for chat operations |
| omnichannel-amsclient | File upload/download client |

## Breaking Changes

This is a **public npm package** — API changes affect external customers. Use semantic versioning. Deprecate props for 2 release cycles before removal. Coordinate with LiveChatWidget team.
