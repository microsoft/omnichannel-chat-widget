import { ICallingContainerProps } from "@microsoft/omnichannel-chat-components/lib/types/components/callingcontainer/interfaces/ICallingContainerProps";

export interface ICallingContainerStatefulProps extends ICallingContainerProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    voiceVideoCallingSdk?: any
}