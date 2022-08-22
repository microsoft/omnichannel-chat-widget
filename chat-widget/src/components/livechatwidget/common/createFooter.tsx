// import FooterStateful from "../../footerstateful/FooterStateful";
import { IFooterProps } from "@microsoft/omnichannel-chat-components/lib/types/components/footer/interfaces/IFooterProps";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import React from "react";
import { decodeComponentString } from "@microsoft/omnichannel-chat-components";
import { shouldShowFooter } from "../../../controller/componentController";
const FooterStateful = React.lazy(() => import(/* webpackChunkName: "FooterStateful" */ "../../footerstateful/FooterStateful"));

export const createFooter = (props: ILiveChatWidgetProps, state: ILiveChatWidgetContext) => {
    const footerPropsHidden: IFooterProps = {
        ...props.footerProps,
        controlProps: {
            ...props.footerProps?.controlProps,
            hideDownloadTranscriptButton: true,
            hideEmailTranscriptButton: true,
            hideAudioNotificationButton: true
        }
    };

    const footer = (!props.controlProps?.hideFooter && shouldShowFooter(state)) ?
        (decodeComponentString(props.componentOverrides?.footer) || <FooterStateful footerProps={props.footerProps} downloadTranscriptProps={props.downloadTranscriptProps} audioNotificationProps={props.audioNotificationProps} hideFooterDisplay={false}/>) :
        (decodeComponentString(props.componentOverrides?.footer) || <FooterStateful footerProps={footerPropsHidden} downloadTranscriptProps={props.downloadTranscriptProps} audioNotificationProps={props.audioNotificationProps} hideFooterDisplay={true}/>);

    return footer;
};
