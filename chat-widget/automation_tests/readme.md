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