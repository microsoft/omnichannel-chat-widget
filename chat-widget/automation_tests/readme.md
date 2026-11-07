# Omnichannel Live Chat Widget UI Components Test Cases Automation
Omnichannel Live Chat Widget test cases automation using playwright and jest.
omnichannel-chat-widget\chat-widget\automation_tests contains automated test cases for Live chat widget components

# Installation
    
```powershell
npm install
```

or

```powershell
yarn
```

# Build and Test
## Chat token recovery regression coverage

The widget's `yarn test:unit` command includes environment-independent checks of
the installed SDK's recovery policy, renewal safeguards, and ACS client wiring.
These run in the existing PR unit-test job with controlled backend responses and
transport; no org or credentials are required.

## Real chat token recovery

These are manual, opt-in live tests, not part of the PR pipeline. Supply the
current test-environment settings for each run; do not commit org configuration.
Build the sample with `yarn build-sample` from `chat-widget`, then run
`yarn test:token-recovery` from `chat-widget/automation_tests`.
Set `LCW_RECOVERY_ORG_ID`, `LCW_RECOVERY_WIDGET_ID`, and `LCW_RECOVERY_ORG_URL`
for a nonproduction anonymous-chat widget with token renewal enabled.
Optionally set `LCW_RECOVERY_BROWSER_CHANNEL=msedge` to use installed Edge.

The six cases cover rejection recovery and exactly-once delivery, proactive
renewal, accelerated client expiry, rejected replacements, renewal outages and
cooldown, and disabled renewal. Enabled cases require the actual configuration
to enable renewal; the disabled case overrides only the browser's configuration
response. Each case requires successful real conversation cleanup.
Rejection uses a modified outbound signature and a real service 401, not
administrative key revocation. Client-clock acceleration is not server expiry.

The dedicated command fails on missing settings/builds and disables automatic
screenshots and credential-bearing artifacts. The normal automation suite excludes these live cases; only the dedicated
command runs them. Excluded or skipped cases are not validation evidence.

To run the automation test cases, follow below steps
1. Run all test cases with build the sample live chat widget script 
    
```powershell
npm run test:build
```

or

```powershell
yarn build:build
```

2. Run all test cases without build the sample live chat widget script 
    
```powershell
npm run test
```

or

```powershell
yarn test
```

3. Run a single test by specifing its name. eg: chatButton.spec.ts

```powershell
npm run test chatButton.spec.ts
```

or

```powershell
yarn test chatButton.spec.ts
```

4. Run tests in a specific folder. eg: e2e/areas/general

```powershell
npm run test e2e/areas/general
```

or

```powershell
yarn test e2e/areas/general
```
