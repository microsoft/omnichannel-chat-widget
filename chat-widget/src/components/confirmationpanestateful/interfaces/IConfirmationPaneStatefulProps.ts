import { IConfirmationPaneLocalizedTexts } from "./IConfirmationPaneLocalizedTexts";
import { IConfirmationPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/confirmationpane/interfaces/IConfirmationPaneProps";

export interface IConfirmationPaneStatefulProps extends IConfirmationPaneProps {
    /**
     * confirmationPaneLocalizedTexts: Internal Prop injected for setting localized texts
     */
    confirmationPaneLocalizedTexts?: IConfirmationPaneLocalizedTexts
}