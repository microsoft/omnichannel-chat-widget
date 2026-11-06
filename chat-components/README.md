# Microsoft Omnichannel Chat Components

[![npm version](https://img.shields.io/npm/v/@microsoft/omnichannel-chat-components)](https://www.npmjs.com/package/@microsoft/omnichannel-chat-components)
[![npm downloads](https://img.shields.io/npm/dm/@microsoft/omnichannel-chat-components)](https://www.npmjs.com/package/@microsoft/omnichannel-chat-components)
[![npm Release](https://github.com/microsoft/omnichannel-chat-widget/actions/workflows/npm-release.yml/badge.svg)](https://github.com/microsoft/omnichannel-chat-widget/actions/workflows/npm-release.yml)

`@microsoft/omnichannel-chat-components` provides the stateless React controls for a Dynamics 365 customer chat experience.

Use this package when your application owns the chat state and needs the Microsoft user interface controls.

Use [`@microsoft/omnichannel-chat-widget`](https://www.npmjs.com/package/@microsoft/omnichannel-chat-widget) for an integrated widget that connects these controls to the Chat SDK.

## Install

This release builds and tests with React 18. Install React and ReactDOM in the application.

For a production application, pin the exact stable package version:

```bash
npm install --save-exact @microsoft/omnichannel-chat-components@1.2.0 react@18 react-dom@18
```

You can also use Yarn:

```bash
yarn add --exact @microsoft/omnichannel-chat-components@1.2.0 react@18 react-dom@18
```

The package installs Fluent UI version 8 and its other runtime dependencies.

## Basic use

Initialize the broadcast service one time before you render controls that publish events.

```tsx
import * as React from "react";
import { createRoot } from "react-dom/client";
import {
    BroadcastServiceInitialize,
    ChatButton
} from "@microsoft/omnichannel-chat-components";

BroadcastServiceInitialize("customer-chat");

function App(): React.ReactElement {
    return (
        <ChatButton
            controlProps={{
                ariaLabel: "Start a chat",
                titleText: "Chat with us",
                subtitleText: "We are online",
                onClick: () => {
                    console.log("Start the chat");
                }
            }}
        />
    );
}

createRoot(document.getElementById("root")!).render(<App />);
```

The controls do not start or manage a chat session. Connect their callbacks and broadcast events to your application state.

## Exported API

The package exports these control groups:

| Group | Exports |
| --- | --- |
| Chat shell | `Header`, `Footer`, `ChatButton`, `NotificationPane` |
| Status and forms | `ConfirmationPane`, `InputValidationPane`, `LoadingPane`, `OutOfOfficeHoursPane` |
| Surveys and proactive chat | `PreChatSurveyPane`, `PostChatSurveyPane`, `ProactiveChatPane`, `ReconnectChatPane` |
| Calling | `CallingContainer`, `CurrentCall`, `IncomingCall`, `Timer` |
| Services and utilities | `BroadcastService`, `BroadcastServiceInitialize`, `ElementType`, `encodeComponentString`, `decodeComponentString` |
| Assets | The package exports the default chat, calling, notification, transcript, and status icons. |

Read the [component guide](https://github.com/microsoft/omnichannel-chat-widget/blob/main/docs/customizations/getstarted.md) for control properties and style examples.

The root [component table](https://github.com/microsoft/omnichannel-chat-widget#stateless-ui-components) links each control to its TypeScript interface.

Run Storybook locally to examine the available states:

```bash
yarn install --frozen-lockfile
yarn storybook
```

## Package formats

The npm package contains these outputs:

| Consumer | Entry |
| --- | --- |
| ECMAScript modules | `lib/esm/index.js` |
| CommonJS | `lib/cjs/index.js` |
| TypeScript declarations | `lib/types/index.d.ts` |

Use the package root import. The `exports` map selects the correct JavaScript entry.

## Accessibility

The controls use semantic HTML, ARIA attributes, focus management, and screen-reader announcements.

The repository includes unit, visual, axe, and Microsoft Accessibility Insights coverage. Automated scans do not replace manual assistive-technology tests.

## Development

The repository uses the Node.js version in [`.nvmrc`](https://github.com/microsoft/omnichannel-chat-widget/blob/main/.nvmrc) and Yarn 1.

Run these commands from `chat-components`:

```bash
yarn install --frozen-lockfile
yarn build
yarn test:unit
yarn test:cjs
yarn build-storybook
yarn test:visual --forceExit
```

## Releases

- Read the [Chat Components changelog](https://github.com/microsoft/omnichannel-chat-widget/blob/main/CHANGE_LOG.md#chat-components).
- Read the [official release procedure](https://github.com/microsoft/omnichannel-chat-widget/blob/main/docs/RELEASING.md).
- Find published packages on [npm](https://www.npmjs.com/package/@microsoft/omnichannel-chat-components).
- Find official tags and release assets on [GitHub Releases](https://github.com/microsoft/omnichannel-chat-widget/releases).

Official Chat Components tags use `c-v<version>`. Starting with `c-v1.2.0`, each tag publishes the same tarball to npm and GitHub.

`1.2.0` was released on 2026-08-18. Official support ends on 2027-08-18. See the [root support table](https://github.com/microsoft/omnichannel-chat-widget#chat-components).

## Support and security

- Use [GitHub Issues](https://github.com/microsoft/omnichannel-chat-widget/issues) for reproducible product defects.
- Read [SUPPORT.md](https://github.com/microsoft/omnichannel-chat-widget/blob/main/SUPPORT.md) before you request product help.
- Report vulnerabilities through [SECURITY.md](https://github.com/microsoft/omnichannel-chat-widget/blob/main/SECURITY.md).
- Obey the [Microsoft Open Source Code of Conduct](https://github.com/microsoft/omnichannel-chat-widget/blob/main/CODE_OF_CONDUCT.md).

This project uses the [MIT License](https://github.com/microsoft/omnichannel-chat-widget/blob/main/LICENSE).