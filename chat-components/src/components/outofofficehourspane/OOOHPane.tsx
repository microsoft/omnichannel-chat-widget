import { ILabelStyles, IStackStyles, Label, Stack } from "@fluentui/react";

import { IOOOHPaneProps } from "./interfaces/IOOOHPaneProps";
import React from "react";
import { decodeComponentString } from "../../common/decodeComponentString";
import { defaultOOOHPaneControlProps } from "./common/defaultProps/defaultOOOHPaneControlProps";
import { defaultOOOHPaneGeneralStyles } from "./common/defaultProps/defaultStyles/defaultOOOHPaneGeneralStyles";
import { defaultOOOHPaneTitleStyles } from "./common/defaultProps/defaultStyles/defaultOOOHPaneTitleStyles";

function OOOHPane(props: IOOOHPaneProps) {

    const elementId = props.controlProps?.id ?? defaultOOOHPaneControlProps.id;

    const containerStyles: IStackStyles = {
        root: Object.assign({}, defaultOOOHPaneGeneralStyles, props.styleProps?.generalStyleProps)
    };

    const titleStyles: ILabelStyles = {
        root: Object.assign({}, defaultOOOHPaneTitleStyles, props.styleProps?.titleStyleProps)
    };

    return (
        <>
            {!props.controlProps?.hideOOOHPane &&
                <Stack
                    id={elementId}
                    tabIndex={-1}
                    styles={containerStyles}
                    role="alert"
                    className={props.styleProps?.classNames?.containerClassName}
                    dir={props.controlProps?.dir ?? defaultOOOHPaneControlProps.dir}>

                    {!props.controlProps?.hideTitle && (decodeComponentString(props.componentOverrides?.title) ||
                        <Label
                            className={props.styleProps?.classNames?.titleClassName}
                            styles={titleStyles}
                            tabIndex={1}
                            id={elementId + "-title"}>
                            {props.controlProps?.titleText ?? defaultOOOHPaneControlProps.titleText}
                        </Label>)}

                </Stack>
            }
        </>
    );
}

export default OOOHPane;