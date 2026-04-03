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

## Accessibility Requirements

**All components MUST be accessible:**

1. **Semantic HTML:** Use appropriate elements (`<button>`, `<input>`, etc.)
2. **ARIA attributes:** Add `role`, `aria-label`, `aria-describedby` where needed
3. **Keyboard navigation:** All interactive elements keyboard accessible
4. **Focus management:** Logical tab order, visible focus indicators
5. **Screen reader support:** Test with NVDA/JAWS/VoiceOver

**Accessibility checklist:**
- [ ] Component uses semantic HTML
- [ ] All interactive elements keyboard accessible (Tab, Enter, Space)
- [ ] ARIA roles and labels present
- [ ] Color contrast meets WCAG AA standards (4.5:1 for text)
- [ ] Focus indicators visible
- [ ] Tested with screen reader

---

## Integration with Other Repos

**This library integrates with:**
- **omnichannel-chat-sdk** (peer dependency) - For chat operations (send message, etc.)
- **React** (peer dependency) - UI framework

**Consumed by:**
- **CRM.OmniChannel.LiveChatWidget** (npm dependency) - Customer chat widget
- **External customers** (public npm) - Custom widget implementations

**When changing component APIs:**
- This is a **public contract** - breaking changes affect external customers
- Use semantic versioning: major version for breaking changes
- Coordinate with LiveChatWidget team
- Update Storybook stories to reflect API changes
- Provide migration guide in CHANGELOG.md

---

## Pull Request Guidelines

1. **Code standards:** Follow TypeScript best practices, React conventions
2. **Commit messages:** Conventional commit format (feat:, fix:, chore:, etc.)
3. **Testing:** All tests must pass, add tests for new components
4. **Storybook:** Add stories for new components
5. **Accessibility:** Verify all accessibility requirements met
6. **Documentation:** Update README.md if component APIs change
7. **CHANGELOG:** Update CHANGELOG.md under [Unreleased] section

---

## Common Issues & Troubleshooting

**Build Issues:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node --version`
- Ensure both packages build: `npm run build`

**Storybook Issues:**
- Clear Storybook cache: `npm run storybook -- --no-manager-cache`
- Check for circular dependencies
- Verify all stories have valid meta exports

**Peer Dependency Warnings:**
- Ensure React version compatibility (17+ recommended)
- Check chat-sdk peer dependency version in package.json

**Accessibility Issues:**
- Use axe-core for automated testing: `npm run test:a11y` (if configured)
- Manually test with keyboard navigation (Tab, Enter, Space)
- Test with screen reader (NVDA, JAWS, VoiceOver)

---

## Documentation

- **[README.md](README.md)** - Component library usage, examples
- **[CHANGE_LOG.md](CHANGE_LOG.md)** - Release history
- **[docs/](docs/)** - Additional documentation
- **Storybook:** Run `npm run storybook` for interactive component docs

---

## Breaking Change Protocol

**Before making breaking changes to component APIs:**

1. **Identify impact:**
   - LiveChatWidget dependency (check package.json version)
   - External customers (check npm download stats)

2. **Coordination:**
   - Notify LiveChatWidget team
   - Create tracking work item
   - Plan migration timeline (minimum 2 release cycles)

3. **Implementation:**
   - Add new prop/API (backwards-compatible)
   - Mark old prop as deprecated in JSDoc: `@deprecated Use newProp instead`
   - Update Storybook stories with new API examples
   - After 2 releases, remove old prop (major version bump)

4. **Documentation:**
   - Update README.md with new component examples
   - Add migration guide to CHANGE_LOG.md
   - Update TypeScript type definitions

---

**Summary:** This is a public React component library with shared components for chat UIs. Focus on accessibility, theme customization, and Storybook documentation. Coordinate breaking changes with consumers (LiveChatWidget, external customers).
