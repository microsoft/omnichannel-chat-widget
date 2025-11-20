import { createRoot } from 'react-dom/client';
import App from './App';
import { Button } from '@fluentui/react-components';
import { SimpleSubject } from "./SimpleSubject";

import { ChatInput} from '@fluentui-copilot/react-copilot';
import { getNextSeqId, persistentChatInput2, persistentChatInput3 } from './data/annotation';
import { FlightMessageSubject } from './flightMessageSubject';
import { ChatSDKMessage, ACSMessageLocal, ACSMessagePartial, OmnichannelMessage, AttachmentUpdateMessage, OmnichannelMessageOptional } from './types';
import { constructOutboundPlainTextMessage } from './data/messageHandler';
//import { App } from 'copilot-lcw';
import { getBlobUrl } from './blobUtil';
import { AttachmentMessageSubject } from './attachmentMessageSubject';
import CopilotChatWidgetApp from './copilotChatWidgetApp';
// import createAdapter from '@microsoft/botframework-webchat-adapter-azure-communication-chat'
import { ChatSdkClientMock } from "./chatSdkClientMock";
import { EventSubscription } from './eventSubscription';


const root = createRoot(document.getElementById('root') as HTMLElement);

// const ingressMessageSubject = new SimpleSubject<ACSMessageLocal[]>();
// const flightMessageSubject = new FlightMessageSubject<ChatSDKMessage>();
// const attachmentMessageSubject = new AttachmentMessageSubject<AttachmentUpdateMessage>();
let widgetReady = false;
const eventSubscription = new EventSubscription();




//simulate service new message notification
const onNewMessage = (val) => {
  const msg = constructMockServiceTextMessageForAgent(val);
  persistentChatInput3.push(msg);
  getMessages();
}

//simulate chat sdk list all messages
const getMessages = () => {
  eventSubscription.ingressMessageSubject.next(persistentChatInput3 as OmnichannelMessage[])
}

const simulateLoadAttachment = () => {
    const lastMessages = persistentChatInput3.filter(val => val.fileMetadata?.id &&  val.fileMetadata?.name );

  setTimeout(async () => {
    for (const msg of lastMessages) {
      const blobUrl = await getBlobUrl(msg.fileMetadata);
      // const attachmentMsg = {
      //   ...lastMessage,
      //   blobUrl
      // } as ACSMessageLocal;
      console.log("debugging: sending message with attachment url: ", blobUrl)
      // ingressMessageSubject.next([attachmentMsg]);
      eventSubscription.attachmentMessageSubject.sendUpdate({
        id: msg.id,
        blobUrl
      })
    }
  }, 5 * 1000);
}

const eventHandler = (e: {
  eventType: string,
  payload: any
}) => {
  console.log("debugging: event message received: ", e);
  switch(e.eventType) {
    case "widget_state_update":
      if (e.payload?.value === "ready") widgetReady = true;
    default:
      console.log("No matching event handler found: ", e);
  }

}

const constructMockServiceTextMessageForAgent = (val: string) => {
  const ts = "" + Date.now();
  const tsIso = new Date().toISOString();
  const seqId = "" + getNextSeqId();
  const clientId = `mockclientid:${ts}`
  return {
        "liveChatVersion": 2,
        "id": ts,
        "properties": {
            "tags": "public,client_activity_id:"+clientId,
            "originalMessageId": ts
        },
        "content": val,
        "tags": [
            "public",
            "client_activity_id:"+clientId
        ],
        "timestamp": new Date(),
        "messageType": "UserMessage",
        "sender": {
            "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278",
            "displayName": "# Aurora User",
            "type": 2
        },
        "role": "agent"
    } as OmnichannelMessageOptional;
}

const constructMockServiceTextMessageForUser = (val: ChatSDKMessage) => {
  const ts = "" + Date.now();
  const tsIso = new Date().toISOString();
  const seqId = "" + getNextSeqId();
  const clientId = val.metadata.clientActivityId ?? `mockclientid:${ts}`
  return {
        "liveChatVersion": 2,
        "id": ts,
        "properties": {
            "tags": "ChannlId-lcw,FromCustomer,client_activity_id:mock1759363745322",
            "originalMessageId": ts
        },
        "content": val.content,
        "tags": [
            "ChannlId-lcw",
            "FromCustomer",
            "client_activity_id:" + clientId
        ],
        "timestamp": new Date(),
        "messageType": "UserMessage",
        "sender": {
            "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_0000002a-410e-6f11-85f4-343a0d00b6b4",
            "displayName": "Customer",
            "type": 2
        },
        "role": "user"
    } as OmnichannelMessageOptional;
}

const sendFlightMessage = (val: ChatSDKMessage) => {
  if (widgetReady) eventSubscription.flightMessageSubject.sendFlightMessage(val);
  else {
    console.log("Widget is NOT ready");
  }
}

setTimeout(() => {
  console.log("debugging: simulate get all messages from service");
  getMessages();
}, 2 * 1000);


simulateLoadAttachment();

setInterval(() => {
  console.log("debugging: polled raw messages");
  getMessages();
}, 20 * 1000);

const chatSdkMock = new ChatSdkClientMock();
const acsAdapter = chatSdkMock.getAcsAdapter();
(window as any).testAdapter = acsAdapter;
console.log("debugging: acs adapter: ", acsAdapter);

acsAdapter.activities()//.subscribe((events) => console.log(events));

root.render(
  <>
    {
      <App 
        eventSubscription={eventSubscription}
        eventHandler={eventHandler}
        debuggingMode={true}
      />
    }
    <Button appearance="primary" onClick={() => onNewMessage(`message generated at ${Date.now()}`)} style={{ margin: '16px' }}>
      append Random Inbound Message
    </Button>
    <ChatInput
      charactersRemainingMessage={(characterRemaining: number) => {
        return `You have ${characterRemaining} characters left.`
      }}
      maxLength={4000}
      placeholderValue={"Input message here: " + new Date(Date.now()).toISOString()}
      onSubmit={(_e, data) => {
        // const outboundMessage = constructOutboundPlainTextMessage(data.value);
        // const inAirMessage = addLocalMessage(outboundMessage, reloadMessage);
        // addInAirMessageToUI(inAirMessage);
        const outboundMessage = constructOutboundPlainTextMessage(data.value ?? `Random message generated at: ${Date.now()}`);
        sendFlightMessage(outboundMessage);
        const mockRawMessage = constructMockServiceTextMessageForUser(outboundMessage);
        persistentChatInput3.push(mockRawMessage);
        // sendTextMessage(threadVal, acsToken, outboundMessage)
        // pollMessages();
      }}
    />
  </>

);


