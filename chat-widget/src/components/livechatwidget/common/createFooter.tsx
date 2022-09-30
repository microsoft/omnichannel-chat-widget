import FooterStateful from "../../footerstateful/FooterStateful";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import React from "react";
import { decodeComponentString } from "@microsoft/omnichannel-chat-components";
import { shouldShowFooter } from "../../../controller/componentController";

export const createFooter = (props: ILiveChatWidgetProps, state: ILiveChatWidgetContext) => {
    const hideFooterDisplay = (!props.controlProps?.hideFooter && shouldShowFooter(state)) ? false : true;
    const footer = (decodeComponentString(props.componentOverrides?.footer) || <FooterStateful footerProps={props.footerProps} downloadTranscriptProps={props.downloadTranscriptProps} audioNotificationProps={props.audioNotificationProps} hideFooterDisplay={hideFooterDisplay}/>);

    return footer;
};
