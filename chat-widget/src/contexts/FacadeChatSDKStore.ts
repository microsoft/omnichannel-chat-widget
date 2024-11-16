import { createContext } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
export const FacadeChatSDKStore: any = createContext<[any, (facadeChatSDK: any) => void]>([undefined, (facadeChatSDK: any) => {}]);

//export const FacadeChatSDKStore: any = createContext(undefined);
