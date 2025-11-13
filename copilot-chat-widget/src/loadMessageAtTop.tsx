import * as React from "react";
import { makeStyles, Spinner } from "@fluentui/react-components";
import { tokens } from "@fluentui-copilot/tokens";
import type { CopilotChatProps } from "@fluentui-copilot/react-copilot-chat";
import {
  CopilotChat,
  CopilotMessage,
  Timestamp,
  UserMessage
} from "@fluentui-copilot/react-copilot-chat";

// import { ScrollManager, useScrollManager } from "./../node_modules/@fluentui-copilot/react-copilot-chat/stories/ScrollDownButton/ScrollManager";
import { useScrollToBottom } from "./useScrollToBottomLocal";
import { ScrollManager, useScrollManager } from "./scrollManagerLocal";
import { SystemMessage } from "@fluentui-copilot/react-copilot";

import { StackItemShim, StackShim } from "@fluentui/react-migration-v8-v9";
import { ACSMessageLocal } from "./types";
import { AppContext } from "./App";
import { InitialsAvatar } from "./InitialsAvatar";
//import { ChatWarningFilled } from "@fluentui/react-icons";
import { extractClientActivityId, isAdaptiveCardMessage } from "./utils";
import { AdaptiveCardComponent } from "./adaptiveCardHandler";
import { getFailedStatusIconWithFill } from "./data/icons";

const MarkdownComponent = React.lazy(() => {
  return import("./markdownComponent")
})

const useStyles = makeStyles({
  chat: {
    height: "430px",
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL} ${tokens.spacingVerticalL} ${tokens.spacingHorizontalL}`,
    overflowY: "auto"
  },
  inputContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  provider: {
    backgroundColor: tokens.colorNeutralBackground3,
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL}`,
    borderRadius: tokens.borderRadiusXLarge,
    display: "flex",
    rowGap: "16px",
    flexDirection: "column",
  },
  scrollDownButton: {
    position: "absolute",
    bottom: "10%",
    left: "40%",
  },
  addMessage: {
    marginTop: "20px",
  },
  userMessageStack: {
    width: "fit-content"
  }
});



// export const ChatScrollToBottom = (props: CopilotChatProps) => {
//   const [isSending, setIsSending] = React.useState(false);
//   const [messages, setMessages] = React.useState<Message[]>([
//     { type: "user", value: STORY_TEXT.substring(0, 50) },
//     { type: "copilot", value: STORY_TEXT.substring(0, 100) },

//   ]);
//   const { isAtBottom, sentinel } = useScrollToBottom({});
//   const scrollDiv = React.useRef<HTMLDivElement>(null);
//   const scrollViewRef = React.useRef<ScrollManager<HTMLDivElement>>(
//     new ScrollManager(scrollDiv)
//   );
//   const { scrollToBottom, autoScroll } = useScrollManager(scrollViewRef);


//   React.useEffect(() => {
//     if (!isAtBottom && isSending) {
//       autoScroll();
//     }
//   }, [isAtBottom, isSending, autoScroll]);

//   const renderMessage = React.useCallback(
//     (message: Message, index: number) => {
//       if (message.type === "copilot") {
//         return (
//           <CopilotMessage
//             avatar={
//               <Image
//                 src="https://res-2-sdf.cdn.office.net/files/fabric-cdn-prod_20240411.001/assets/brand-icons/product/svg/copilot_24x1.svg"
//                 alt=""
//               />
//             }
//             name="Copilot"
//             announcement="searching for references"
//             key={index}
//           >
//             {message.value}
//           </CopilotMessage>
//         );
//       }
//       return (
//         <UserMessage
//           ref={(_) => {
//             scrollToBottom();
//           }}
//           timestamp="5/21, 9:00 AM"
//           key={index}
//         >
//           {message.value}
//         </UserMessage>
//       );
//     },
//     [scrollToBottom]
//   );

//   const addMessage = async () => {
//     setIsSending(true);

//     // add user message
//     setMessages((i) => [
//       ...i,
//       { type: "user", value: STORY_TEXT.substring(0, 50) },
//     ]);

//     // start streaming response
//     await timeout(1000);
//     setMessages((i) => [...i, { type: "copilot", value: STORY_TEXT }]);
//     await timeout(2000);

//     setIsSending(false);
//   };

//   const styles = useStyles();

//   const renderedMessages = React.useMemo(() => {
//     return messages.map(renderMessage);
//   }, [messages, renderMessage]);

//   console.log("debugging: isAboveMessages: ", isAtBottom);
//   return (
//     <div className={styles.provider}>
//       <div className={styles.inputContainer}>
//         <CopilotChat className={styles.chat} ref={scrollDiv}>
//           {renderedMessages}
//           {sentinel}
//           {!isAtBottom && (
//             <ScrollDownButton
//               isGenerating={isSending}
//               style={{ position: "absolute", bottom: "10%", left: "40%" }}
//               onClick={() => {
//                 scrollToBottom();
//               }}
//             />
//           )}
//         </CopilotChat>
//       </div>
//       <Button
//         disabledFocusable={isSending}
//         onClick={addMessage}
//         className={styles.addMessage}
//       >
//         Add new message
//       </Button>
//     </div>
//   );
// };




export const ChatLoadingMoreWhenScrollToTop = (_props: CopilotChatProps) => {
  const appContext = React.useContext(AppContext);

  const { isAtBottom, sentinel } = useScrollToBottom({});
  const [maxVisibleMessages, setMaxVisibleMessages] = React.useState<number>(5);
  const isAtTop = isAtBottom;
  const scrollDiv = React.useRef<HTMLDivElement>(null);
  const scrollViewRef = React.useRef<ScrollManager<HTMLDivElement>>(
    new ScrollManager(scrollDiv)
  );
  const { scrollToBottom, scrollToTopArea} = useScrollManager(scrollViewRef);

  // getBlobUrl().then(res => {
  //   console.log("result received: ", res);
  // })

//   React.useEffect(() => {
//     if (!isAtBottom && isSending) {
//       autoScroll();
//     }
//   }, [isAtBottom, isSending, autoScroll]);
// function ImageWithDownload({ blobUrl }: { blobUrl: string }) {
//   const imageElement = React.useMemo(
//     () => <img src={blobUrl} alt="Preview" style={{ maxWidth: '100%', height: 'auto' }} />,
//     [blobUrl]
//   );

//   const downloadButton = React.useMemo(
//     () => (
//       <a href={blobUrl} download="image">
//         <button type="button">Download Image</button>
//       </a>
//     ),
//     [blobUrl]
//   );

//   return (
//     <div>
//       {imageElement}
//       {downloadButton}
//     </div>
//   );
// }



  const nonSystemMessageRenderingRouter = (message: ACSMessageLocal): JSX.Element=> {
    let [isAdaptiveCard, payload] = isAdaptiveCardMessage(message);
    if (isAdaptiveCard && payload) {
      console.log("debugging: adaptive card payload: ", payload, " message: ", message);

      let adaptiveCardInstance = appContext.getAdaptiveCardRender();
      if (adaptiveCardInstance) {
        return (
          <AdaptiveCardComponent 
            content={payload} 
            adaptiveCardInstance={adaptiveCardInstance}
            clientActivityId={extractClientActivityId(message.tags ?? []) ?? message.id}
          />
        )
      }
    }

    if (message.fileMetadata?.id) {
      if (message.blobUrl) {
        // Parse metadata to get contentType and filename if available
        let contentType = '';
        let fileName = 'attachment';
        try {
          // const metas = JSON.parse(message.metadata.amsMetadata as string);
          // const meta = Array.isArray(metas) ? metas[0] : metas;
          contentType = message.fileMetadata.type ?? '';
          fileName = message.fileMetadata?.name ?? fileName;
        } catch (e) {
          // ignore parse errors
        }

        // Render preview depending on content type, with a download link
        if (contentType.startsWith('image/')) {
          return (
            <div>
              <img src={message.blobUrl} alt={fileName} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
              <a href={message.blobUrl} download={fileName} style={{ display: 'inline-block', marginTop: 8 }}>Download</a>
            </div>
          );
        }

        if (contentType.startsWith('video/')) {
          return (
            <div>
              <video controls src={message.blobUrl} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
              <a href={message.blobUrl} download={fileName} style={{ display: 'inline-block', marginTop: 8 }}>Download</a>
            </div>
          );
        }

        if (contentType === 'application/pdf') {
          return (
            <div>
              {/* <iframe src={message.blobUrl} title={fileName} style={{ width: '100%', height: 400, border: 'none' }} /> */}
              <div>{message.fileMetadata.name}</div>
              <a href={message.blobUrl} download={fileName} style={{ display: 'inline-block', marginTop: 8 }}>Download</a>
            </div>
          );
        }

        // Generic fallback: show link and attempt to preview via object/embed where possible
        return (
          <div>
            <a href={message.blobUrl} target="_blank" rel="noreferrer">Open attachment</a>
            <a href={message.blobUrl} download={fileName} style={{ display: 'inline-block', marginLeft: 8 }}>Download</a>
          </div>
        );
      } else {
        return (<span>loading...</span>)
      }
    }
    console.log("debugging: about to render: ",  message?.content);
    return (
      appContext.getConfigurations()["isMarkdownEnabled"] ? (
                  <React.Suspense fallback={<span>Loading Markdown...</span>}>
                    <MarkdownComponent content={message?.content ?? ""} />
                  </React.Suspense>
                ) : 
                <>
                  {message?.content}
                </>
    )
  }





  // const renderMessage = React.useCallback(
  //   (message: ACSMessageLocal, index: number) => {
  //     if (!message?.content?.message) return;
  //     console.log("debugging: re-rdner triggered: ", message.id);
  //     //console.log("debugging: message: ", message.content.message,  " tag: ", message.metadata?.tags);
  //     if (message.metadata?.tags.includes("system")) {
  //       return (
  //         <>{message.createdOn && <Timestamp>{message.createdOn}</Timestamp>}
  //           <SystemMessage>{message.content.message}</SystemMessage>
  //         </>
  //       )
  //     }
  //     if (message.senderDisplayName !== "Customer") {
  //       return (
  //         <>{message.createdOn && <Timestamp>{message.createdOn}</Timestamp>}
  //           <CopilotMessage
  //             avatar={
  //               // <Image
  //               //   src="https://res-2-sdf.cdn.office.net/files/fabric-cdn-prod_20240411.001/assets/brand-icons/product/svg/copilot_24x1.svg"
  //               //   alt=""
  //               // />
  //               <InitialsAvatar name={message.senderDisplayName ?? ""} />
  //             }
  //             name={<span>{message.senderDisplayName}</span>}
  //             //announcement="searching for references"
  //             key={index}
  //             disclaimer={""}
  //           >
  //             {nonSystemMessageRenderingRouter(message)}
  //           </CopilotMessage>
  //         </>
  //       );
  //     }

  //     if (message.content.attachments && message.content.attachments[0]) {
  //       return (
  //         <UserMessage
  //           timestamp={new Date().toISOString()}
  //           key={index}
  //           message={
  //             <div>
  //               <img src={message.content.attachments[0]} alt="Preview" style={{ maxWidth: '100%', height: 'auto' }} />
  //               <a href={message.content.attachments[0]} download="image">
  //                 <button type="button">Download Image</button>
  //               </a>
  //             </div>
  //           }
  //         />
  //       )
  //     }
  //     return (
  //       <UserMessage
  //         ref={(_) => {
  //           scrollToBottom();
  //         }}
  //         timestamp={message.createdOn}
  //         key={index}
  //       >

  //         <div>
  //           <StackShim horizontal={true}>
  //             <StackItemShim>
  //               {nonSystemMessageRenderingRouter(message)}
  //             </StackItemShim>
  //             {message.sendingStatus === "sending" && <StackItemShim align="end">
  //               <Spinner as="span" size={"tiny"}/>
  //               {/* {getSendingIconWithFill("currentColor")} */}
  //             </StackItemShim>}
  //             {message.sendingStatus === "failed" && <StackItemShim align="end">
  //               {getFailedStatusIconWithFill("red")}
  //             </StackItemShim>}
  //           </StackShim>
  //         </div>
  //       </UserMessage>
  //     );
  //   },
  //   [scrollToBottom]
  // );


  const renderMessageChatSDKFormat = React.useCallback(
    (message: ACSMessageLocal, index: number) => {
      if (!message) return;
      console.log("debugging: re-rdner triggered: ", message.id);
      //console.log("debugging: message: ", message.content.message,  " tag: ", message.metadata?.tags);
      if (message.role === "system" && message.tags?.includes("system")) {
        return (
          <>{message.timestamp && <Timestamp>{message.timestamp.toISOString()}</Timestamp>}
            <SystemMessage>{message.content}</SystemMessage>
          </>
        )
      }
      if (message.role === "agent") {
        return (
          <>{message.timestamp && <Timestamp>{message.timestamp.toISOString()}</Timestamp>}
            <CopilotMessage
              avatar={
                // <Image
                //   src="https://res-2-sdf.cdn.office.net/files/fabric-cdn-prod_20240411.001/assets/brand-icons/product/svg/copilot_24x1.svg"
                //   alt=""
                // />
                <InitialsAvatar name={message.sender?.displayName ?? ""} />
              }
              name={<span>{message.sender?.displayName}</span>}
              //announcement="searching for references"
              key={index}
              disclaimer={""}
            >
              {nonSystemMessageRenderingRouter(message)}
            </CopilotMessage>
          </>
        );
      }

      if (message.fileMetadata?.id && message.blobUrl) {
        return (
          <UserMessage
            timestamp={new Date().toISOString()}
            key={index}
            message={
              <div>
                <img src={message.blobUrl} alt="Preview" style={{ maxWidth: '100%', height: 'auto' }} />
                <a href={message.blobUrl} download="image">
                  <button type="button">Download Image</button>
                </a>
              </div>
            }
          />
        )
      }
      return (
        <UserMessage
          ref={(_) => {
            //scrollToBottom();
          }}
          timestamp={message.timestamp?.toISOString()}
          key={index}
        >

          <div>
            <StackShim horizontal={true}>
              <StackItemShim className={styles.userMessageStack}>
                {nonSystemMessageRenderingRouter(message)}
              </StackItemShim>
              {message.sendingStatus === "sending" && <StackItemShim align="end">
                <Spinner as="span" size={"tiny"}/>
                {/* {getSendingIconWithFill("currentColor")} */}
              </StackItemShim>}
              {message.sendingStatus === "failed" && <StackItemShim align="end">
                {getFailedStatusIconWithFill("red")}
              </StackItemShim>}
            </StackShim>
          </div>
        </UserMessage>
      );
    },
    [scrollToBottom]
  );

  

  // const addMessageAtTop = async () => {
  //   setIsSending(true);

  //   const getTwoRandomIntegers = (max: number): [number, number] => {
  //     if (max <= 1) throw new Error("Input must be greater than 1");
  //     const first = Math.floor(Math.random() * (max - 1));
  //     const second = Math.floor(Math.random() * (max - first - 1)) + first + 1;
  //     return [first, second];
  //   }

  //   const [v1, v2] = getTwoRandomIntegers(STORY_TEXT.length);

  //   //await timeout(1000);
  //   // add user message
  //   setMessages((i) => [
  //     { type: "user", value: "Insert at Top: " + `${i.length - 1}` + " " + STORY_TEXT.substring(v1, v2) },
  //     { type: "user", value: "Insert at Top: " + `${i.length}` + " " + STORY_TEXT.substring(v1, v2) },
  //     ...i,
  //   ]);

  //   // start streaming response
  //   // 
  //   // setMessages((i) => [...i, { type: "copilot", value: STORY_TEXT }]);
  //   // await timeout(2000);

  //   setIsSending(false);
  // };

  const styles = useStyles();

  // React.useEffect(() => {
  //   if (isAtTop) {
  //       console.log("debugging: triggered to add a message");
  //       addMessageAtTop();
  //   }
  // }, [isAtTop]);


  const renderedMessages = React.useMemo(() => {
    const elements = appContext.messages.slice(-maxVisibleMessages).map(renderMessageChatSDKFormat);
    //console.log("debugging: elements before rendering: ", elements);
    return elements;
  }, [appContext.messages, renderMessageChatSDKFormat, maxVisibleMessages]);

  React.useEffect(() => {
    if (isAtTop) {
      console.log("debugging: at top: ", appContext.messages.length, " max visible: ", maxVisibleMessages)
        if (appContext.messages.length > maxVisibleMessages) {
          console.log("debugging: triggered to load more messages");
          setMaxVisibleMessages(prev=>prev+2);
        }
        // scrollToTopArea()
    }
  }, [isAtTop, setMaxVisibleMessages, scrollToTopArea]);


  //console.log("debugging: isAboveMessages: ", isAtTop);
  return (
    <div className={styles.provider}>
      <div className={styles.inputContainer}>
        <CopilotChat className={styles.chat} ref={scrollDiv}>
          {sentinel}
          {renderedMessages}
        </CopilotChat>
      </div>
      {/* <Button
        disabledFocusable={isSending}
        onClick={addMessage}
        className={styles.addMessage}
      >
        Add new message
      </Button> */}
    </div>
  );
};
