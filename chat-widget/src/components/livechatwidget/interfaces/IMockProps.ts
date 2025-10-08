import { Message } from "botframework-directlinejs";

export enum LiveChatWidgetMockType {
    Test = "Test",
    Demo = "Demo",
    Designer = "Designer"
}

export interface IMockProps {
    type: LiveChatWidgetMockType,
    mockMessages?: Message[];
}