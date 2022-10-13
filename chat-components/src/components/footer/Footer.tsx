import * as React from "react";

import { IStackStyles, Stack, initializeIcons } from "@fluentui/react";

import AudioNotificationButton from "./subcomponents/AudioNotificationButton";
import DownloadTranscriptButton from "./subcomponents/DownloadTranscriptButton";
import EmailTranscriptButton from "./subcomponents/EmailTranscriptButton";
import { IFooterProps } from "./interfaces/IFooterProps";
import { decodeComponentString } from "../../common/decodeComponentString";
import { defaultFooterProps } from "./common/defaultProps/defaultFooterProps";
import { processCustomComponents } from "../../common/utils";

initializeIcons();

function Footer(props: IFooterProps) {

    const footerId = props.controlProps?.id ?? defaultFooterProps.controlProps?.id;

    const stackStyles: Partial<IStackStyles> = {
        root: Object.assign({}, defaultFooterProps.styleProps?.generalStyleProps, props.styleProps?.generalStyleProps)
    };

    const downloadTranscriptButtonProps = Object.assign({}, defaultFooterProps.controlProps?.downloadTranscriptButtonProps,
        props.controlProps?.downloadTranscriptButtonProps);

    const emailTranscriptButtonProps = Object.assign({}, defaultFooterProps.controlProps?.emailTranscriptButtonProps,
        props.controlProps?.emailTranscriptButtonProps);

    const audioNotificationButtonProps = Object.assign({}, defaultFooterProps.controlProps?.audioNotificationButtonProps,
        props.controlProps?.audioNotificationButtonProps);

    const downloadTranscriptButtonStyles = Object.assign({}, defaultFooterProps.styleProps?.downloadTranscriptButtonStyleProps,
        props.styleProps?.downloadTranscriptButtonStyleProps);

    const downloadTranscriptButtonHoverStyles = Object.assign({}, defaultFooterProps.styleProps?.downloadTranscriptButtonHoverStyleProps,
        props.styleProps?.downloadTranscriptButtonHoverStyleProps);

    const emailTranscriptButtonStyles = Object.assign({}, defaultFooterProps.styleProps?.emailTranscriptButtonStyleProps,
        props.styleProps?.emailTranscriptButtonStyleProps);

    const emailTranscriptButtonHoverStyles = Object.assign({}, defaultFooterProps.styleProps?.emailTranscriptButtonHoverStyleProps,
        props.styleProps?.emailTranscriptButtonHoverStyleProps);

    const audioNotificationButtonStyles = Object.assign({}, defaultFooterProps.styleProps?.audioNotificationButtonStyleProps,
        props.styleProps?.audioNotificationButtonStyleProps);

    const audioNotificationButtonHoverStyles = Object.assign({}, defaultFooterProps.styleProps?.audioNotificationButtonHoverStyleProps,
        props.styleProps?.audioNotificationButtonHoverStyleProps);

    const footerItemFocusStyles = Object.assign({}, defaultFooterProps.styleProps?.footerItemFocusStyleProps,
        props.styleProps?.footerItemFocusStyleProps);

    return (

        <Stack id={footerId} horizontal className={props.className} horizontalAlign="space-between"
            styles={stackStyles}
            dir={props.controlProps?.dir ?? "ltr"} role="region">
            <Stack horizontal id="footerLeftGroup" verticalAlign="center">
                <Stack horizontal verticalAlign="center">
                    {!props.controlProps?.hideDownloadTranscriptButton && (decodeComponentString(props.componentOverrides?.DownloadTranscriptButton) ||
                        <DownloadTranscriptButton
                            {...downloadTranscriptButtonProps}
                            onClick={props.controlProps?.onDownloadTranscriptClick}
                            styles={downloadTranscriptButtonStyles}
                            hoverStyles={downloadTranscriptButtonHoverStyles}
                            focusStyles={footerItemFocusStyles} />)
                    }
                    {!props.controlProps?.hideEmailTranscriptButton && (decodeComponentString(props.componentOverrides?.EmailTranscriptButton) ||
                        <EmailTranscriptButton
                            {...emailTranscriptButtonProps}
                            onClick={props.controlProps?.onEmailTranscriptClick}
                            styles={emailTranscriptButtonStyles}
                            hoverStyles={emailTranscriptButtonHoverStyles}
                            focusStyles={footerItemFocusStyles} />)
                    }
                    {processCustomComponents(props.controlProps?.leftGroup?.children)}
                </Stack>
            </Stack>
            <Stack horizontal id="footerMiddleGroup">
                <Stack horizontal verticalAlign="start">
                    <Stack.Item align="start">
                        {processCustomComponents(props.controlProps?.middleGroup?.children)}
                    </Stack.Item>
                </Stack>
            </Stack>
            <Stack horizontal id="footerRightGroup" verticalAlign="start">
                <Stack horizontal verticalAlign="center">
                    {processCustomComponents(props.controlProps?.rightGroup?.children)}
                    {!props.controlProps?.hideAudioNotificationButton && (decodeComponentString(props.componentOverrides?.AudioNotificationButton) ||
                        <AudioNotificationButton
                            {...audioNotificationButtonProps}
                            onClick={props.controlProps?.onAudioNotificationClick}
                            styles={audioNotificationButtonStyles}
                            hoverStyles={audioNotificationButtonHoverStyles}
                            focusStyles={footerItemFocusStyles} />)
                    }
                </Stack>
            </Stack>
        </Stack>
    );
}

export default Footer;