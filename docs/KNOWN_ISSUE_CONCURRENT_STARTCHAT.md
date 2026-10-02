# Known issue: duplicate conversations with Chat SDK versions before 1.11.6

## Summary

The Chat Widget calls `startChat()` on the `OmnichannelChatSDK` instance that your application passes in the `chatSDK` prop. In Chat SDK versions before `1.11.6`, `startChat()` has no lock. If the widget or your application calls `startChat()` again before the previous call is complete, each call can start a separate conversation on the service.

Only one of these conversations goes to the queue and to an agent. The customer can stay on a different conversation. In that case, the customer sends messages, but no agent ever receives them.

Chat SDK `1.11.6` corrects this error. For the Chat SDK details, see the [Chat SDK release notes for 1.11.6](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.11.6), [Chat SDK pull request #506](https://github.com/microsoft/omnichannel-chat-sdk/pull/506), and the [Chat SDK known-issue document](https://github.com/microsoft/omnichannel-chat-sdk/blob/main/docs/KNOWN_ISSUE_CONCURRENT_STARTCHAT.md).

## Which version decides

The Chat SDK version that is installed in your application decides if you have this issue. The Chat Widget version controls which Chat SDK versions npm can install:

| Chat Widget version | Chat SDK dependency | Result |
| -- | -- | -- |
| `1.6.2` and earlier | Exact version, `1.4.4` to `1.6.2` | Affected. These Chat SDK versions have no lock. |
| `1.6.3` to `1.8.1` | Caret range, `^1.7.2` to `^1.11.2` | Affected if your lockfile resolves the Chat SDK to a version earlier than `1.11.6`. |
| `1.8.2` and later 1.x | `^1.11.6` or later | Not affected. |
| `2.0.0` | `2.0.0` | Not affected. |

Your application creates the `OmnichannelChatSDK` instance from its own `@microsoft/omnichannel-chat-sdk` dependency. Make sure that this dependency is `1.11.6` or later, independently of the Chat Widget version.

Chat Widget versions earlier than `1.8.3` are also past their end-of-support date. Official versions receive support for 12 months after the release date. See the [Releases](../README.md#releases) section of the README.

## Symptoms

The application sees one of these symptoms:

- A customer starts a chat, but no agent joins it. The customer sends messages, and the chat stays without an agent until the customer leaves.
- The same chat session creates two or more conversations in Dynamics 365 Contact Center.
- The service reports more conversations than the number of chats that customers started.

## How to correct the error

1. Find the installed versions. In the folder of your application, run:

   ```powershell
   npm ls @microsoft/omnichannel-chat-widget @microsoft/omnichannel-chat-sdk
   ```

2. If any installed `@microsoft/omnichannel-chat-sdk` is earlier than `1.11.6`, upgrade the packages.

   For the latest 1.x releases:

   ```powershell
   npm install @microsoft/omnichannel-chat-widget@1.8.7 @microsoft/omnichannel-chat-sdk@1.11.8 --save-exact
   ```

   For version 2.0.0, read the [Chat SDK 2.0 migration guide](https://github.com/microsoft/omnichannel-chat-sdk/blob/main/docs/MIGRATION_2.0.md) first. Version `2.0.0` requires Node.js `>=22.12.0`.

   ```powershell
   npm install @microsoft/omnichannel-chat-widget@2.0.0 @microsoft/omnichannel-chat-sdk@2.0.0 --save-exact
   ```

3. Regenerate the lockfile of the application.
4. Run `npm ls @microsoft/omnichannel-chat-sdk` again. Make sure that every installed copy is `1.11.6` or later.
5. Build and test the application.

## Notes

The Chat SDK lock applies to one `OmnichannelChatSDK` instance. Create one instance for each chat, and pass the same instance to the widget.
