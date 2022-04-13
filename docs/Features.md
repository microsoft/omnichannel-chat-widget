# Omnichannel Features

### Pop-Out Chat

The chat can be enabled in a pop-out window with the help of the prop "skipChatButtonRendering". When this is turned on, the button will be automatically clicked on widget load. See the below chat widget example:

```js
liveChatWidgetProps = {
    controlProps: {
        skipChatButtonRendering: true
    }
};

ReactDOM.render(
    <LiveChatWidget {...liveChatWidgetProps}/>,
    document.getElementById("my-container")
);
```

### Pre-Chat Survey

The Pre-Chat Survey can be enabled from the admin portal under the Surveys tab and the survey questions and PreChat Survey can be set from there. Pre-Chat Survey Pane integration is included in this widget component by defualt. See below example:

#### Setting in Admin Portal:
![](https://i.imgur.com/q6zbPfN.png)

#### Sample Widget:
![](https://i.imgur.com/TamETPo.png)

### Post-Chat Survey

The Post-Chat Survey can be enabled from the admin portal under the Surveys tab and the Survey link would be a Dynamics 365 Customer Voice survey.

![](https://i.imgur.com/WQC37X6.png)

**PS:** In the ==How should we send the survey?== question there are options to choose from:
* `Insert survey in conversation` - Choosing this option would trigger a separate Post Chat Survey window after conversation end. This will render the Post-Chat Survey Pane. Its integration is also included in this widget component by defualt.

![](https://i.imgur.com/TDHdjjk.png)

* `Send Survey Link to conversation` - Choosing this option would post the Survey link in the deactivated chat window.

### Proactive Chat
The Proactive Chat Pane is a component designed to be a pop-up after a certain time out to alert the user. When the live chat widget loads, a Broadcast service gets subscribed to the "StartProactiveChat" event, and the customer can determine when to release the event.

The "StartProactiveChat" event can be released through implementation of LiveChatWidget SDK method call. Below is an example of how this can be implemented and initiated:
```js
class ProactiveChatNotificationConfig {
    message?: string;
}

class LiveChatWidgetSDK {
    public startProactiveChat(notificationUIConfig: ProactiveChatNotificationConfig, showPrechat: boolean, inNewWindow: boolean) {
        const startProactiveChatEvent: ICustomEvent = {
            eventName: "StartProactiveChat",
            payload: {
                bodyTitle: (notificationUIConfig && notificationUIConfig.message) ? notificationUIConfig.message : "",
                showPrechat: showPrechat,
                inNewWindow: inNewWindow
            }
        };
        BroadcastService.postMessage(startProactiveChatEvent);
    }
```

After implementing and initializing startProactiveChat() method, the customer can pass 3 optional parameters:
1. "bodyTitle": a string value to customize the body text that appears on the proactive chat pane,
2. "showPrechat": a boolean value, whether to show the preChat survey after starting proactive chat,
3. "inNewWindow": a boolean value, whether to start the proactive chat in popout mode. If this value is set to true, then the customer also needs to subscribe to a broadcast event "StartPopoutChat", as this is what will be released if they accept the invitation and start proactive chat.

After the "StartProactiveChat" event gets released by the customer, the proactive chat pane pops up that has a default timeout of 1 minute. This can be overriden by setting "ProactiveChatInviteTimeoutInMs" as part of props interface. After the timeout expires, the proactive chat pane will disappear and be replaced by the chat button.

### Authenticated Chat and Persistent Chat
The widget itself is agnostic of whether the chat is authenticated or not. The only thing needed to turn on auth feature is to pass the `getAuthToken` callback in `chatSDKConfig` inside Chat SDK's constructor. For more details, see [Chat SDK documentation](https://github.com/microsoft/omnichannel-chat-sdk#:~:text=messages%20to%20UI-,Authenticated%20Chat,-//%20add%20if%20using). Same with Persistent Chat feature.

### Reconnect Chat
There are 2 types of chat reconnect:
1. Unauthenticated chat: the customer gets the reconnect link after the chat starts that can be used later to continue the previous conversation, if the customer closes the browser tab. The reconnect link will be valid for the time duration set in the reconnect settings.
2. Authenticated chat: When the customer closes the browser tab after chat has started, they will have the option to continue the previous conversation or start a new conversation. The ```<ReconnectChatPane/>``` will show up in this case.

> :warning: Chat reconnect may not be used if chat has ended.

For more details, see [Chat SDK documentation](https://github.com/microsoft/omnichannel-chat-sdk#:~:text=Chat%20Reconnect%20with%20Authenticated%20User).

### Voice and Video Call

Once this feature is turned on from admin side, the widget will include ```CallingContainerPane``` automatically.
