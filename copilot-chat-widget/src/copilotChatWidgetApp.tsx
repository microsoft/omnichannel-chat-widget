
import { CopilotProvider, CopilotTheme} from '@fluentui-copilot/react-copilot';
import { webLightTheme, webDarkTheme, makeStyles } from '@fluentui/react-components';
import React, { useEffect, useState } from 'react';
import { Button } from '@fluentui/react-components';
import { ChatLoadingMoreWhenScrollToTop as Chat } from './loadMessageAtTop';
import { ChatSDKMessage, ACSMessageLocal, AttachmentUpdateMessage } from './types';
import { processInputMsgArr } from './utils';
import { addLocalMessage, mergePolledMessagesWithOutboundMap, processInboundMessages, mergePolledMessagesWithAttachmentMapForLoadingMessages, mergeArrayUniqueBasedOnMessageId, updateAttachmentBlobURL } from './data/messageHandler';
import { TypingIndicator } from './TypingIndicator';
import * as AdaptiveCards from "adaptivecards";
import { getAdaptiveCardRender } from './adaptiveCardHandler';
import { StackItemShim, StackShim } from '@fluentui/react-migration-v8-v9';
import { SimpleSubject } from './SimpleSubject';
import { FlightMessageSubject } from './flightMessageSubject';
import { AttachmentMessageSubject } from './attachmentMessageSubject';

export interface CopilotChatWidgetAppProps {
  messageSubject?: SimpleSubject<ACSMessageLocal[]>,
  flightMessageSubject?: FlightMessageSubject<ChatSDKMessage>,
  attachmentMessageSubject?: AttachmentMessageSubject<AttachmentUpdateMessage>,
  debuggingMode?: boolean,
  eventHandler: (event: {
    eventType: string, payload: any
  }) => void
}

export const AppContext = React.createContext<{
  theme: typeof webLightTheme;
  messages: ACSMessageLocal[],
  getConfigurations: () => {[key: string]: unknown},
  getAdaptiveCardRender: () => AdaptiveCards.AdaptiveCard | undefined,
}>(
  {
    theme: webLightTheme,
    messages: [],
    getConfigurations: () => {
      return {}
    },
    getAdaptiveCardRender: () => undefined,
  }
);

  // const useStyles = makeStyles({
  //   root: {
  //     // Stack the label above the field
  //     display: "flex",
  //     flexDirection: "column",
  //     // Use 2px gap below the label (per the design system)
  //     gap: "2px",
  //     // Prevent the example from taking the full width of the page (optional)
  //     maxWidth: "360px",
  //   },
  // });

// let messageIdTrack = {
//   messageId: 100000
// };




const toolColumnStyles = makeStyles({
    root: {
      width: "300px"
    },
    stackItem: {
      "max-width": "360px"
    }
  })

const chatPanelStyles = makeStyles({
  root: {
    width: "360px"
  }
})
  //const replaySubject = new ReplaySubject(100);


const CopilotChatWidgetApp: React.FC<CopilotChatWidgetAppProps> = (props: CopilotChatWidgetAppProps) => {
  //const replaySubject = props.messageSubject;
  // if (replaySubject) {
  //   replaySubject.reset();
  // }
  const [attachmentMessageTracker, setAttachmentMessageTracker] = React.useState<Map<string, string>>(new Map());
  const [isDark, setIsDark] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const theme = isDark ? webDarkTheme : webLightTheme;
  // const [isMarkdownEnabled, setIsMarkdownEnabled] = useState(false);
  useEffect(() => {
    if (!props.messageSubject) return;
    if (!props.messageSubject.isStopped()) {
      console.log("debugging: subscribe called");
      try {
        props.messageSubject.subscribe((msgArr) => {
          console.log("debugging: raw messages received: ", msgArr);
          const msgArrLocal = processInputMsgArr(msgArr);
          setRawMessages(prevMsgs => {
            const result = mergeArrayUniqueBasedOnMessageId(prevMsgs, msgArrLocal);
            const merged = result.mergedMessage;
            //const isAttachmentUpdated = result.isAttachmentUpdated;
            return merged;

          });
        });
      } catch (error) {
        console.error("debugging: exception caught when subscribe: ", error);
      }
    } else {
      console.log("debugging: subscribtion stopped already");
    }

  }, [props.messageSubject]);


  useEffect(() => {
    if (props.attachmentMessageSubject) {
      props.attachmentMessageSubject.subscribe((val: AttachmentUpdateMessage) => {
        updateAttachmentBlobURL(val, attachmentMessageTracker);
        reloadMessage();
      })
    }
  }, [props.attachmentMessageSubject])


  const [rawMessages, setRawMessages] = React.useState<ACSMessageLocal[]>([]);

  const [overlayMessages, setOverlayMessages] = React.useState<ACSMessageLocal[]>([]);

// const attachmentMessageTracker: Map<string, string> = new Map();

  React.useEffect(() => {
    document.body.style.background = isDark ? 'black' : 'white';
  }, [isDark]);

  const reloadMessage = () => {
    console.log("debugging: reload message invoked");
    setRawMessages(prev => [...prev]);
    // setOverlayMessages((i)=> [...i])
  }

  const toggleTheme = () => setIsDark((prev) => !prev);

  const [isSending] = React.useState(false);

  // const addRandomMessage = async (toEnd = true) => {
  //   setIsSending(true);


  //   const [first, second] = getTwoRandomIntegers(STORY_TEXT.length);
  //   // start streaming response
  //   await timeout(1000);
  //   let randomMessage = {
  //       id: `${messageIdTrack.messageId++}`,
  //       createdOn: new Date().toISOString(),
  //       senderDisplayName: "Copilot",
  //       type: "text",
  //       content: {
  //         message: STORY_TEXT.substring(first, second),
  //         attachments: []
  //       }
  //     } as ACSMessage;
  //   if (toEnd) {
  //     setOverlayMessages((i: ACSMessageLocal[]) => {
  //       if (i && i.length>0) {
  //         return [...i,       
  //           randomMessage
  //         ]
  //       }
  //       return [randomMessage]
  //     });
  //   } else {
  //     setOverlayMessages((i) => [       
  //       randomMessage,
  //       ...i
  //     ]);
  //   }
  //   //await timeout(2000);

  //   setIsSending(false);
  // };

  // const addInAirMessageToUI = (msg: ACSMessageLocal) => {
  //   setOverlayMessages((i) => [
  //     ...i,
  //     msg
  //   ])
  // }

  useEffect(() => {
    if (!props.flightMessageSubject) return;
    props.flightMessageSubject.subscribe((val: ChatSDKMessage) => {
      // setOverlayMessages((prev) => [
      //   ...prev,
      //   {
      //     id: `${messageIdTrack.messageId++}`,
      //     createdOn: new Date().toISOString(),
      //     senderDisplayName: "Customer",
      //     type: "text",
      //     content: { message: String(val), attachments: [] }
      //   } as ACSMessage
      // ]);
      // const outboundMessage = constructOutboundPlainTextMessage(val);
      addLocalMessage(val, reloadMessage);
      reloadMessage();
      //addInAirMessageToUI(inAirMessage);
    })
  }, [props.flightMessageSubject])

  // const addImgUserMessage = async () => {
  //     setIsSending(true);

  //     const url = await getBlobUrl();
  //     // add user message
  //     setOverlayMessages((i) => [
  //       ...i,
  //       {
  //         id: `${messageIdTrack.messageId++}`,
  //         createdOn: new Date().toISOString(),
  //         senderDisplayName: "Customer",
  //         type: "text",
  //         content: {
  //           message: "",
  //           attachments: [url]
  //         }
  //       },
  //     ]);

  //     // start streaming response
  //     // await timeout(1000);
  //     // setMessages((i) => [...i, { type: "copilot", value: STORY_TEXT }]);
  //     // await timeout(2000);

  //     setIsSending(false);
  // };
  // const [threadVal, setThreadVal] = React.useState("");
  // const [acsToken, setacsToken] = React.useState("");
  const [configurations, setConfigurations] = React.useState<{[key:string]: unknown}>({
    isMarkdownEnabled: false,
    adaptiveCardRenderConfig: {
      //fontFamily: "Segoe UI, Helvetica Neue, sans-serif",
      //supportsInteractivity: false,
      actions: {
        actionsOrientation: "Vertical"
      }
    }
  });

  console.log("debugging: setconfig: ", setConfigurations);

  // const cachedThreadUrl = localStorage.getItem("acsTestThread");
  // const cachedJWTToken = localStorage.getItem("acsTestJWT");
  // useEffect(() => {
  //   if (cachedThreadUrl && cachedThreadUrl !== "") {
  //     setThreadVal(cachedThreadUrl);
  //   }

  //   if (cachedJWTToken && cachedJWTToken !== "") {
  //     setacsToken(cachedJWTToken);
  //   }
  // }, [cachedThreadUrl, cachedJWTToken])


  // const tryInitializeAmsManager = async (threadVal: string, acsToken: string) => {
  //     console.log("debugging: initialize ams client: ", threadVal, " token: ", acsToken);
  //     if (threadVal && acsToken) {
  //       try {          
  //         const chatToken: OmnichannelChatToken = {
  //           chatId: threadVal?.split('/')[5],
  //           token: acsToken
  //         }
  //         setConfigurations({
  //           ...configurations,
  //           chatToken,
  //           supportedImagesMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/heic", "image/webp"]
  //         })
  //       } catch (error) {
  //         console.error("failed to initialize ams manager: ", error);
  //       }
  //     }
  // }

  // const updateThreadUrl = (_ev: ChangeEvent<HTMLTextAreaElement>, data: TextareaOnChangeData) => {
  //   console.log("debugging: threadUpdateEvent: ", data);
  //   localStorage.setItem("acsTestThread", data.value);
  //   setThreadVal(data.value);
  // }
  // const updateJWTToken = (_ev: ChangeEvent<HTMLTextAreaElement>, data: TextareaOnChangeData) => {
  //   console.log("debugging: jwt token event: ", data);
  //   localStorage.setItem("acsTestJWT", data.value);
  //   setacsToken(data.value);
  // }



  useEffect(() => {
    console.log("debugging: message polled: ", rawMessages);
    if (rawMessages) {
      let newMessagesCloneRef = [...rawMessages];
      processInboundMessages(newMessagesCloneRef, attachmentMessageTracker, setAttachmentMessageTracker);
      let mergedResult = mergePolledMessagesWithAttachmentMapForLoadingMessages(newMessagesCloneRef, attachmentMessageTracker);
      console.log("debugging; just before sent to mergePolledMessageWithOutboundMap: ", mergedResult);
      mergedResult = mergePolledMessagesWithOutboundMap(newMessagesCloneRef);
      if (mergedResult) {
        setOverlayMessages(prevMsg => {
          console.log("just before mergedResult: prevMsg: ", prevMsg, " merged message: ", mergedResult);
          return mergedResult;
        });
      }
    }
  }, [rawMessages, mergePolledMessagesWithAttachmentMapForLoadingMessages, mergePolledMessagesWithOutboundMap, attachmentMessageTracker, setAttachmentMessageTracker])

  // const pollMessages = async () => {
  //   await tryInitializeAmsManager(threadVal, acsToken);
  //   await timeout(1000);
  //   console.log("debugging: message poll start: ");
  //   const result = await fetchMessages(threadVal, acsToken);
  //   if (!result) return;
  //   setRawMessages(prevMsgs => {
  //     const map = new Map<string, ACSMessagePartial>();

  //     for (const msg of prevMsgs) {
  //       if (msg.id) map.set(msg.id, msg);
  //     }
  //     for (const msg of result) map.set(msg.id, msg);
  //     return Array.from(map.values())
  //   }
  //   );
  //   //processInboundMessages(result as ACSMessageLocal[], attachmentDownloadCompleteCallback);
    

  // }



  // const loadRandomMessage = async () => {
  //   console.log("debugging: loadRandomMessage called");
  //   addRandomMessage(false);
  // }

  // const loadBulkMessages = (volume: number) => {
  //   const newMessages: ACSMessage[] = [];
  //   for (let i = 0; i < volume; i ++ ) {
  //     const [first, second] = getTwoRandomIntegers(STORY_TEXT.length);
  //     newMessages.push({
  //         id: `${messageIdTrack.messageId++}`,
  //         createdOn: new Date().toISOString(),
  //         senderDisplayName: "Customer",
  //         type: "text",
  //         content: {
  //           message: `${i}: ${STORY_TEXT.substring(first, second)}`,
  //           attachments: []
  //         }
  //       } as ACSMessage);
  //   }
  //   setOverlayMessages((i) => [
  //       ...i,
  //       ...newMessages
  //     ]);
  // }

  const mockTypingIndicator = () => {
    setIsTyping(!isTyping);
  }

  // const inputAcsThreadUrlId = useId("acs_thead_url");
  // const inputAcsJWTTokenId = useId("acs_jwt_token");

  // const styles = useStyles();

  const getConfigurations = () => {
    return configurations;
  }

  const adaptiveCardRenderInstance = getAdaptiveCardRender(configurations.adaptiveCardRenderConfig, (action: any) =>  {
    console.log(action),
    console.log(action.parent.parent.renderedElement)
    console.log((action.parent.parent.renderedElement as HTMLElement).getAttribute("acid"))
  })

  const getAdaptiveCardRenderInstance = () => {
    return adaptiveCardRenderInstance;
  }
  const toolStyles = toolColumnStyles();
  const chatStyles = chatPanelStyles();

  useEffect(() => {
    props.eventHandler({
      eventType: "widget_state_update", payload: {value: "ready"}
    })
  })


  return (
    <AppContext.Provider value = {
      {
        theme,
        messages: overlayMessages,
        //loadMoreMessage: loadRandomMessage,
        getConfigurations:  getConfigurations,
        getAdaptiveCardRender: getAdaptiveCardRenderInstance
      }}>
      <CopilotProvider {...CopilotTheme} theme={theme}>
        { props.debuggingMode &&
          <StackShim horizontalAlign={"end"} horizontal={true}>
            <StackItemShim align='start'>
              <StackShim  className={toolStyles.root}>
                {<Button appearance="primary" onClick={toggleTheme} style={{ margin: '16px' }}>
                    Toggle {isDark ? 'Light' : 'Dark'} Mode
                  </Button>
                  /* 
                  <Button disabledFocusable={isSending} appearance="primary" onClick={() => addRandomMessage()} style={{ margin: '16px' }}>
                    append Random Message
                  </Button>

                  <Button disabledFocusable={isSending} appearance="primary" onClick={()=> addImgUserMessage()} style={{ margin: '16px' }}>
                    append Image Message
                  </Button>

                  <Button disabledFocusable={isSending} appearance="primary" onClick={()=> loadBulkMessages(10)} style={{ margin: '16px' }}>
                    load 10 messages
                  </Button> */}

                  <Button disabledFocusable={isSending} appearance="primary" onClick={()=> mockTypingIndicator()} style={{ margin: '16px' }}>
                    toggle mock typing indicator
                  </Button>

                    {/* <Button disabledFocusable={isSending} appearance="primary" onClick={()=> initializeAMSClient()} style={{ margin: '16px' }}>
                    init ams
                  </Button> */}
                  {/* <Checkbox onChange={(_ev, data) => {
                    console.log("debugging: makrdown enabled: ", data.checked);
                    configurations.isMarkdownEnabled = data.checked as boolean
                    }} label="Markdown" /> */}
                  {/* <div className={styles.root}>
                    <Field label="threadURL">
                      <Textarea id={inputAcsThreadUrlId} onChange={updateThreadUrl} value={threadVal}/>
                    </Field>
                    <Field label="token">
                      <Textarea id={inputAcsJWTTokenId} onChange={updateJWTToken} value={acsToken}/>
                    </Field>
                  </div> */}
                    {/* <Button appearance="primary" onClick={pollMessages}>Poll</Button> */}
                </StackShim>
              </StackItemShim>
            <StackItemShim className={toolStyles.stackItem}>
              <Chat className={chatStyles.root}/>
              <TypingIndicator isTyping={isTyping} />
            </StackItemShim>
          </StackShim>
          ||
          <div className={chatStyles.root}>
            <Chat/>
              <TypingIndicator isTyping={isTyping} />
              {/* <ChatInput
              charactersRemainingMessage={(characterRemaining: number) => {
                return `You have ${characterRemaining} characters left.`
              }}
              maxLength={4000}
              placeholderValue={"Input message here 5:15:55pm"}
              onSubmit={(_e, data) => {
                const outboundMessage = constructOutboundPlainTextMessage(data.value);
                const inAirMessage = addLocalMessage(outboundMessage, reloadMessage);
                addInAirMessageToUI(inAirMessage);
                sendTextMessage(threadVal, acsToken, outboundMessage)
                pollMessages();
              }}
            /> */}
          </div>
        }
        {/* <AdaptiveCardComponent content={card} adaptiveCardInstance={getAdaptiveCardRenderInstance()} /> */}
        {/* <HookDemoComponent /> */}
        {/* <UseMemoDemo /> */}
      </CopilotProvider>
    </AppContext.Provider>
  );
};

export default CopilotChatWidgetApp;
