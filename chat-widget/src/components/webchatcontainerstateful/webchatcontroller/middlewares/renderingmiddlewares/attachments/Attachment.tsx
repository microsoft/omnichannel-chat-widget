import React, { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../../../../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../../../../contexts/common/ILiveChatWidgetContext";
import useChatContextStore from "../../../../../../hooks/useChatContextStore";
import { defaultAttachmentProps } from "../../../../common/defaultProps/defaultAttachmentProps";
import { defaultAttachmentContentStyles } from "../defaultStyles/defaultAttachmentContentStyles";
import { defaultAttachmentDividerStyles } from "../defaultStyles/defaultAttachmentDividerStyles";
import { defaultAttachmentDownloadIconStyles } from "../defaultStyles/defaultAttachmentDownloadIconStyles";
import { defaultAttachmentFileNameStyles } from "../defaultStyles/defaultAttachmentFileNameStyles";
import { defaultAttachmentSizeStyles } from "../defaultStyles/defaultAttachmentSizeStyles";
import { defaultAttachmentIconStyles } from "../defaultStyles/defaultAtttachmentIconStyles";
import { defaultAttachmentStyles } from "../defaultStyles/defaultAtttachmentStyles";
import AttachmentContent from "./AttachmentContent";
import AttachmentIcon from "./AttachmentIcon";

const Attachment = (props: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const { iconData, imageCard, textCard, renderer } = props;
    const [state, ]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const attachmentId = state.domainStates.renderingMiddlewareProps?.attachmentProps?.webChatAttachmentId ?? defaultAttachmentProps.webChatAttachmentId;
    const attachmentDividerStyles = {...defaultAttachmentDividerStyles, ...state.domainStates.renderingMiddlewareProps?.attachmentDividerStyles};
    const attachmentIconStyles = {...defaultAttachmentIconStyles, ...state.domainStates.renderingMiddlewareProps?.attachmentIconStyles};
    const attachmentStyles = {...defaultAttachmentStyles, ...state.domainStates.renderingMiddlewareProps?.attachmentStyles};

    const attachmentSizeStylesString = (
        Object.entries({...defaultAttachmentSizeStyles, ...state.domainStates.renderingMiddlewareProps?.attachmentSizeStyles}).map(([k, v]) => `${k.replace(/[A-Z]/g, (match: string) => `-${match.toLowerCase()}`)}:${v}`).join(";"));
    const attachmentContentStylesString = (
        Object.entries({...defaultAttachmentContentStyles, ...state.domainStates.renderingMiddlewareProps?.attachmentContentStyles}).map(([k, v]) => `${k.replace(/[A-Z]/g, (match: string) => `-${match.toLowerCase()}`)}:${v}`).join(";"));
    const attachmentFileNameStylesString = (
        Object.entries({...defaultAttachmentFileNameStyles, ...state.domainStates.renderingMiddlewareProps?.attachmentFileNameStyles}).map(([k, v]) => `${k.replace(/[A-Z]/g, (match: string) => `-${match.toLowerCase()}`)}:${v}`).join(";"));
    const attachmentDownloadIconStylesString = (
        Object.entries({...defaultAttachmentDownloadIconStyles, ...state.domainStates.renderingMiddlewareProps?.attachmentDownloadIconStyles}).map(([k, v]) => `${k.replace(/[A-Z]/g, (match: string) => `-${match.toLowerCase()}`)}:${v}`).join(";"));

    return (
        <><style>{`
            .webchat__fileContent__size { ${attachmentSizeStylesString} }
            .webchat__fileContent { ${attachmentContentStylesString} }
            .webchat__fileContent__fileName { ${attachmentFileNameStylesString} }
            .webchat__fileContent__downloadIcon { ${attachmentDownloadIconStylesString} }
        `}</style>
        <div dir={state.domainStates.globalDir}>
            {imageCard && renderer(imageCard)}
            {imageCard && <hr id={attachmentId + "-divider"} style={attachmentDividerStyles} />}
            <AttachmentContent attachment={textCard.attachment} id={attachmentId} style={attachmentStyles}>
                <AttachmentIcon src={iconData} id={attachmentId + "-icon"} style={attachmentIconStyles} />
                {textCard && renderer(textCard)}
            </AttachmentContent>
        </div>
        </>
    );
};

export default Attachment;