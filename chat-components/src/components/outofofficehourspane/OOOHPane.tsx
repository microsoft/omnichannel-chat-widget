import { IStackStyles, ITextStyles, Stack, Text } from "@fluentui/react";

import { IOOOHPaneProps } from "./interfaces/IOOOHPaneProps";
import React from "react";
import { decodeComponentString } from "../../common/decodeComponentString";
import { defaultOOOHPaneControlProps } from "./common/defaultProps/defaultOOOHPaneControlProps";
import { defaultOOOHPaneGeneralStyles } from "./common/defaultProps/defaultStyles/defaultOOOHPaneGeneralStyles";
import { defaultOOOHPaneTitleStyles } from "./common/defaultProps/defaultStyles/defaultOOOHPaneTitleStyles";
import { replaceURLWithAnchor } from "../../common/utils";

function OOOHPane(props: IOOOHPaneProps) {

    const elementId = props.controlProps?.id ?? defaultOOOHPaneControlProps.id;

    const containerStyles: IStackStyles = {
        root: Object.assign({}, defaultOOOHPaneGeneralStyles, props.styleProps?.generalStyleProps)
    };

    const titleStyles: ITextStyles = {
        root: Object.assign({}, defaultOOOHPaneTitleStyles, props.styleProps?.titleStyleProps)
    };

    const displayText = replaceURLWithAnchor(props.controlProps?.titleText ?? defaultOOOHPaneControlProps.titleText, 
        props.controlProps?.openLinkInNewTab ?? defaultOOOHPaneControlProps.openLinkInNewTab) ?? "";

    return (
        <>
            {!props.controlProps?.hideOOOHPane &&
                <Stack
                    id={elementId}
                    tabIndex={-1}
                    styles={containerStyles}
                    role={props.controlProps?.role ?? defaultOOOHPaneControlProps.role}
                    className={props.styleProps?.classNames?.containerClassName}
                    dir={props.controlProps?.dir ?? defaultOOOHPaneControlProps.dir}>
                    {!props.controlProps?.hideTitle && (decodeComponentString(props.componentOverrides?.title) ||
                        <Text
                            className={props.styleProps?.classNames?.titleClassName}
                            styles={titleStyles}
                            tabIndex={-1}
                            id={elementId + "-title"}>
                            <div dangerouslySetInnerHTML={{ __html: displayText }}></div>
                        </Text>)}
                </Stack>
            }
        </>
    );
}

export default OOOHPane;