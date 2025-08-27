# Microsoft Omnichannel Chat Widget Development Guide

**ALWAYS follow these instructions first and only search for additional information if these instructions are incomplete or incorrect.**

## Overview

Microsoft Omnichannel Chat Widget is a React-based UI component library that allows you to build custom live chat widget experiences using the Omnichannel Chat SDK. This is a monorepo containing two main packages:

- **`chat-components`** - Stateless UI components library (@microsoft/omnichannel-chat-components)
- **`chat-widget`** - Main chat widget implementation (@microsoft/omnichannel-chat-widget)

## Working Effectively

### Bootstrap and Installation (NEVER CANCEL - Set 10+ minute timeouts)
Always install dependencies for both packages to work effectively:

```bash
# Install chat-components dependencies (~5 minutes)
cd chat-components && yarn install --network-timeout 1000000

# Install chat-widget dependencies (~1.5 minutes) 
cd ../chat-widget && yarn install --network-timeout 1000000

# Install automation test dependencies if working with E2E tests
cd automation_tests && yarn install --network-timeout 1000000
```

**CRITICAL TIMING**: Dependency installation takes 5+ minutes total. NEVER CANCEL installation commands. Set timeouts to 600+ seconds.

### Building the Code (NEVER CANCEL - Set 30+ minute timeouts)

**Build chat-components:**
```bash
cd chat-components
# Complete build with linting (~8 minutes total)
yarn build

# OR build individual steps for faster iteration:
yarn build:esm    # ~2 seconds - ES modules
yarn build:cjs    # ~2 seconds - CommonJS modules  
tsc              # ~4 seconds - TypeScript definitions
```

**Build chat-widget:**
```bash
cd chat-widget
# Complete build with linting (~15 minutes total)
yarn build

# OR build individual steps for faster iteration:
yarn build:esm    # ~2.5 seconds - ES modules
yarn build:cjs    # ~3 seconds - CommonJS modules
tsc              # ~5 seconds - TypeScript definitions
```

**Build sample applications:**
```bash
cd chat-widget
# Build JavaScript sample (~1.5 minutes) - NEVER CANCEL
yarn build-sample

# Build TypeScript sample
cd samples/typescript-sample
yarn install --network-timeout 1000000  # ~2 minutes
yarn build                               # ~13 seconds
```

**CRITICAL**: Build processes take 5-20 minutes depending on scope. NEVER CANCEL builds. Set timeouts to 1800+ seconds (30+ minutes).

### Testing (NEVER CANCEL - Set 30+ minute timeouts)

**Unit Tests:**
```bash
cd chat-components
yarn test:unit    # ~22 seconds - 67 tests

cd ../chat-widget  
yarn test:unit    # ~1 minute - 332 tests
```

**Visual Regression Tests:**
```bash
cd chat-widget
yarn pretest:visual  # Install playwright browsers first
yarn test:visual     # Visual regression testing
```

**E2E Tests:**
```bash
cd chat-widget/automation_tests
yarn test           # Playwright E2E tests
```

**CRITICAL**: Test suites take 1-3+ minutes each. Unit tests in chat-widget can take up to 5 minutes. NEVER CANCEL test commands.

### Development Workflow

**Running Development Servers:**
```bash
# TypeScript sample with hot reload
cd chat-widget/samples/typescript-sample
yarn start  # Runs on http://localhost:8080

# Storybook component documentation
cd chat-widget
yarn storybook  # Runs on http://localhost:6006
```

**Building Storybook (~3 minutes - NEVER CANCEL):**
```bash
cd chat-widget
yarn build-storybook  # Takes ~3 minutes, produces storybook-static/
```

## Validation and Quality Checks

**ALWAYS run these validation steps before committing:**

```bash
# Lint code (may have line-ending warnings on Linux)
cd chat-widget
yarn eslint . --max-warnings=0 --fix

cd ../chat-components  
yarn eslint . --fix

# Run all tests
yarn test:unit && yarn test:visual
```

**CRITICAL**: Line ending issues are common on Linux environments due to Windows CRLF enforcement in eslint config. Use `--fix` to auto-correct when possible.

## Manual Validation Requirements

**ALWAYS test functionality after making changes:**

1. **Component Changes**: Test in Storybook
   - Run `yarn storybook` 
   - Verify component renders correctly
   - Test interactive features

2. **Widget Changes**: Test sample applications
   - Build and run TypeScript sample: `yarn start`
   - Verify chat functionality works
   - Test responsive design and interactions

3. **SDK Integration**: Test with mock data
   - Use sample applications with dummy configuration
   - Verify initialization and basic chat flows

## Common Build Issues and Workarounds

**Line Ending Issues (Linux/Mac):**
- ESLint enforces Windows line endings (CRLF)
- Workaround: Use `yarn eslint . --fix` to auto-correct
- Alternative: Build without linting using individual build steps

**Playwright Installation Failures:**
- Chromium download may fail in restricted environments
- Use `npx playwright install` manually if needed
- E2E tests may be skipped if browsers unavailable

**Large Bundle Warnings:**
- Sample builds produce 20+ MB bundles (expected)
- Storybook builds are 20+ MB (expected) 
- Production builds are optimized and smaller

**React Native Warnings:**
- Expected warnings about 'react-native' module not found
- These warnings are harmless for web applications
- Related to chat SDK telemetry components

## Key Repository Structure

```
/chat-components/          # UI components library
  src/components/          # Individual UI components
  package.json            # Component library dependencies
  
/chat-widget/             # Main chat widget
  src/components/         # Stateful widget components  
  samples/               # Working examples
    javascript-sample/   # Vanilla JS implementation
    typescript-sample/   # TypeScript/Webpack implementation
  automation_tests/      # E2E test suites
  package.json          # Widget dependencies

/docs/                   # Documentation
  customizations/        # Component customization guides
  BuildingUsingWebpack5.md  # TypeScript setup guide
  Features.md           # Widget capabilities
```

## Package Dependencies and Versions

**Node.js**: v20.x (required)
**Package Manager**: Yarn v1.22+ (required)
**Key Dependencies**:
- React 18.3.1
- TypeScript 5.8.3  
- Webpack 5.x (samples)
- Jest 27.x (testing)
- Playwright 1.x (E2E testing)
- Storybook 6.x (component docs)

## Frequent Tasks and Shortcuts

**Quick component iteration:**
```bash
cd chat-components
yarn build:esm:watch  # Watch mode for ES modules
yarn build:cjs:watch  # Watch mode for CommonJS
```

**Sample development:**
```bash
cd chat-widget
yarn dev  # Concurrent ESM watch + webpack watch
```

**Debugging CI failures:**
```bash
# Run same commands as GitHub Actions
yarn test:unit
yarn test:visual  
yarn build-storybook
yarn build
```

## CI/CD Integration

The repository uses GitHub Actions with these key workflows:
- **chat-widget-pr.yml**: Runs on Windows 2022, Node 20.x
- **chat-components-pr.yml**: Component-specific builds
- Includes unit tests, E2E tests, visual regression, and builds

**CRITICAL**: Always update CHANGE_LOG.md when making changes (required by DangerJS).

## Troubleshooting Common Issues

**Build failures**: Usually related to line endings or missing dependencies
**Test failures**: May be related to async operations or browser compatibility
**Sample issues**: Check bundle sizes and webpack configuration
**Storybook issues**: Usually resolved by rebuilding with `yarn build-storybook`

**Performance Notes:**
- First-time builds are significantly slower due to dependency compilation
- Subsequent builds are faster due to caching
- Watch modes provide fastest iteration for active development