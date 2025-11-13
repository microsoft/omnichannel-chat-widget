import { CopilotChatProps } from "@fluentui-copilot/react-copilot-chat";
import { ScrollManager } from "./scrollManagerLocal";

export type Message = {
  id?: string;
  type: string;
  value: string;
  attachment?: string;
};

export type ACSMessagePartial = Partial<ACSMessage>;
export type ACSMessage = {
    "id": string,
    "type": "text"|'participantRemoved'|'participantAdded'|'topicUpdated',
    "sequenceId"?: string,
    "version"?: string,
    "content": {
        "topic"?: string,
        "message"?: string,
        "attachments"?: string[],
        "participants"?: any[],
        "initiatorCommunicationIdentifier"?: any
    },
    "senderDisplayName": string,
    "createdOn": string,
    "senderCommunicationIdentifier"?: {
        "rawId": string,
        "communicationUser": {
            "id": string
        }
    },
    "metadata"?: {
        "adaptiveCardText"?: string,
        "deliveryMode"?: "bridged",
        "widgetId"?: string,
        "clientActivityId"?: string,
        "tags": string,
        "isBridged"?: string
        "amsReferences"?: string,
        "amsMetadata"?: string,
        "amsreferences"?: string,
        "microsoft.azure.communication.chat.bot.contenttype"?: string
    }
}

export type ACSMessageLocal = OmnichannelMessageOptional & {
  sendingStatus?: "sending" | "failed";
  blobUrl?: string;
  clientActivityId?: string;
}

declare enum LiveChatVersion {
    V1 = 1,
    V2 = 2
}

export declare class MessageContentType {
    static readonly RichText = "RichText";
    static readonly Text = "Text";
}
export declare class DeliveryMode {
    static readonly Bridged = "bridged";
    static readonly Unbridged = "unbridged";
}
export declare class MessageType {
    static readonly UserMessage = "UserMessage";
    static readonly SwiftCard = "SwiftCard";
    static readonly Typing = "Control/Typing";
    static readonly ClearTyping = "Control/ClearTyping";
    static readonly LiveState = "Control/LiveState";
}
export declare enum PersonType {
    Unknown = 0,
    User = 1,
    Bot = 2
}
export declare enum Role {
    Bot = "bot",
    Agent = "agent",
    System = "system",
    User = "user",
    Unknown = "unknown"
}
export interface IPerson {
    displayName: string;
    id: string;
    type: PersonType;
}
export interface IMessageProperties {
    OriginalMessageId?: string;
    [id: string]: string | undefined;
}
export declare enum FileSharingProtocolType {
    AmsBasedFileSharing = 0
}
export interface IFileMetadata {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    fileSharingProtocolType?: FileSharingProtocolType;
}
export declare class ResourceType {
    static readonly NewMessage = "NewMessage";
    static readonly MessageUpdate = "MessageUpdate";
    static readonly UserPresence = "UserPresence";
    static readonly ConversationUpdate = "ConversationUpdate";
    static readonly ThreadUpdate = "ThreadUpdate";
}

export type OmnichannelMessageOptional = Partial<OmnichannelMessage>;

export interface OmnichannelMessage {
    id: string;
    liveChatVersion: LiveChatVersion;
    clientmessageid?: string;
    messageid?: string;
    content: string;
    contentType: string;
    deliveryMode: DeliveryMode | undefined;
    messageType: MessageType;
    sender: IPerson;
    timestamp: Date;
    properties?: IMessageProperties;
    tags?: string[];
    fileMetadata?: IFileMetadata;
    resourceType?: ResourceType;
    role?: string;
    customEvent?: {
        isCustomEvent: boolean;
        customEventName: string;
        customEventValue: string;
    };
}


// export type ACSOutBoundMessage = {
//     "content":  string,
//     "createdOn": string,
//     "metadata": {
//         "deliveryMode": "bridged",
//         "tags": string,
//         "clientActivityId": string
//     }
// }

export interface ChatSDKMessage {
    content: string;
    tags?: string[];
    timestamp?: Date;
    metadata?: any;
}

export interface AttachmentUpdateMessage {
    id?: string;
    clientActivityId?: string;
    blobUrl: string;
}



export interface OmnichannelChatToken {
    chatId: string;
    expiresIn?: string;
    region?: string;
    regionGTMS?: Record<string, string>;
    token: string;
    visitorId?: string;
    voiceVideoCallToken?: string;
    amsEndpoint?: string;
}

export interface GetLiveChatConfigOptionalParams {
    sendCacheHeaders?: boolean;
    useRuntimeCache?: boolean;
}

export interface InitializeOptionalParams {
    getLiveChatConfigOptionalParams?: GetLiveChatConfigOptionalParams;
    useParallelLoad?: boolean;
}

export interface ChatConfig {
    ChatWidgetLanguage: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    DataMaskingInfo: unknown;
    LiveChatConfigAuthSettings: unknown;
    LiveChatVersion: number;
    LiveWSAndLiveChatEngJoin: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    allowedFileExtensions: string;
    maxUploadFileSize: string;
    msdyn_enablemarkdown?: string;
}


export type TwoWaySerializablePrimitive = boolean | null | number | string | undefined;

export type TwoWaySerializableComplex = {
  [key: string]:
    | TwoWaySerializableComplex
    | TwoWaySerializableComplex[]
    | TwoWaySerializablePrimitive
    | TwoWaySerializablePrimitive[];
};

export type SerializableValue = TwoWaySerializablePrimitive | TwoWaySerializableComplex;


export type LocalCopilotChatProps = CopilotChatProps & {
    scrollViewRef: React.MutableRefObject<ScrollManager<HTMLDivElement>>
}

