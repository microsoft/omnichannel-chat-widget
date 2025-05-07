import { createContext } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
export const ChatAdapterStore = createContext<[any, (adapter: any) => void]>([undefined, (adapter: any) => {}]);
