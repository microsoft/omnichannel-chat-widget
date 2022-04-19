import { IConfirmationPaneInputs } from "../../confirmationpanestateful/interfaces/IConfirmationPaneInputs";
import { IConfirmationPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/confirmationpane/interfaces/IConfirmationPaneProps";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { defaultConfirmationPaneLocalizedTexts } from "../../confirmationpanestateful/common/defaultProps/defaultConfirmationPaneLocalizedTexts";

export const initConfirmationPropsComposer = (props: ILiveChatWidgetProps) => {
    const confirmationPanelocalizedTexts = {
        ...defaultConfirmationPaneLocalizedTexts,
        ...props?.confirmationPaneProps?.confirmationPaneLocalizedTexts
    };

    let confirmationPaneInputs: IConfirmationPaneInputs;
    const emailTranscriptDisabled = props.footerProps?.controlProps?.hideEmailTranscriptButton ?? false;
    const downloadTranscriptDisabled = props.footerProps?.controlProps?.hideDownloadTranscriptButton ?? false;

    if (!emailTranscriptDisabled && !downloadTranscriptDisabled) {
        confirmationPaneInputs = {
            title: confirmationPanelocalizedTexts.CLOSE_CONFIRMATION_DIALOG_TITLE_FOR_EMAIL_AND_DOWNLOAD_TRANSCRIPT_ENABLED,
            description: confirmationPanelocalizedTexts.CLOSE_CONFIRMATION_DIALOG_DESCRIPTION_FOR_EMAIL_AND_DOWNLOAD_TRANSCRIPT_ENABLED
        };
    } else if (emailTranscriptDisabled && !downloadTranscriptDisabled) {
        confirmationPaneInputs = {
            title: confirmationPanelocalizedTexts.CLOSE_CONFIRMATION_DIALOG_TITLE_FOR_DOWNLOAD_TRANSCRIPT_ENABLED,
            description: confirmationPanelocalizedTexts.CLOSE_CONFIRMATION_DIALOG_DESCRIPTION_FOR_DOWNLOAD_TRANSCRIPT_ENABLED
        };
    } else if (!emailTranscriptDisabled && downloadTranscriptDisabled) {
        confirmationPaneInputs = {
            title: confirmationPanelocalizedTexts.CLOSE_CONFIRMATION_DIALOG_TITLE_FOR_EMAIL_TRANSCRIPT_ENABLED,
            description: confirmationPanelocalizedTexts.CLOSE_CONFIRMATION_DIALOG_DESCRIPTION_FOR_EMAIL_TRANSCRIPT_ENABLED
        };
    } else {
        confirmationPaneInputs = {
            title: confirmationPanelocalizedTexts.CLOSE_CONFIRMATION_DIALOG_TITLE_DEFAULT,
            description: confirmationPanelocalizedTexts.CLOSE_CONFIRMATION_DIALOG_DESCRIPTION_DEFAULT
        };
    }

    const confirmationPaneProps: IConfirmationPaneProps = {
        ...props.confirmationPaneProps,
        controlProps: {
            titleText: confirmationPaneInputs.title,
            subtitleText: confirmationPaneInputs.description,
            ...props.confirmationPaneProps?.controlProps,
        }
    };

    return confirmationPaneProps;
};