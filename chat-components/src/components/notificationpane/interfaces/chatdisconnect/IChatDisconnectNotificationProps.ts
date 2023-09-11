import { INotificationPaneComponentOverrides } from "../common/INotificationPaneComponentOverrides";
import { IChatDisconnectStyleProps } from "./IChatDisconnectStyleProps";
import { IChatDisconnectControlProps } from "./IChatDisconnectControlProps";

/**
 * This interface will have all required control/style/overrides props for chat disconnect scenario
 */
export interface IChatDisconnectNotificationProps {
    componentOverrides?: INotificationPaneComponentOverrides;
    controlProps?: IChatDisconnectControlProps;
    styleProps?: IChatDisconnectStyleProps;
}