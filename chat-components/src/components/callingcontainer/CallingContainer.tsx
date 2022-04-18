import * as React from "react";

import { IStackStyles, Stack } from "@fluentui/react";

import CurrentCall from "./subcomponents/CurrentCall/CurrentCall";
import { ICallingContainerProps } from "./interfaces/ICallingContainerProps";
import IncomingCall from "./subcomponents/IncomingCall/IncomingCall";
import { defaultCallingContainerProps } from "./common/defaultProps/defaultCallingContainerProps";

function CallingContainer(props: ICallingContainerProps) {
    const callingContainerId = props.controlProps?.id ?? defaultCallingContainerProps.controlProps?.id;

    let stackStyles: Partial<IStackStyles> = {
        root: Object.assign({}, defaultCallingContainerProps.styleProps?.generalStyleProps, props.styleProps?.generalStyleProps)
    };
    const hideCallingContainer = props.controlProps?.hideCallingContainer ?? defaultCallingContainerProps.controlProps?.hideCallingContainer;
    if (hideCallingContainer) {
        stackStyles = {
            root: Object.assign({}, stackStyles.root, { display: "none" })
        };
    }
    return (
        <Stack id={callingContainerId}
            className={props.styleProps?.className} horizontalAlign="space-between"
            dir={props.controlProps?.dir ?? defaultCallingContainerProps.controlProps?.dir}
            styles={stackStyles}>
            {props.controlProps?.isIncomingCall &&
                <IncomingCall controlProps={props.controlProps.incomingCallControlProps}
                    styleProps={props.styleProps?.incomingCallStyleProps} />
            }
            {props.controlProps?.isIncomingCall === false &&
                <CurrentCall controlProps={props.controlProps.currentCallControlProps}
                    styleProps={props.styleProps?.currentCallStyleProps} />
            }
        </Stack>
    );
}

export default CallingContainer;