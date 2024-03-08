import * as React from "react";

import { IImageStyles, ILabelStyles, IStackStyles, Image, Label, Stack, initializeIcons } from "@fluentui/react";

import CloseButton from "../common/subcomponents/CloseButton";
import { IHeaderProps } from "./interfaces/IHeaderProps";
import MinimizeButton from "./subcomponents/MinimizeButton";
import { decodeComponentString } from "../../common/decodeComponentString";
import { defaultHeaderProps } from "./common/defaultProps/defaultHeaderProps";
import { processCustomComponents } from "../../common/utils";
import { Ids } from "../../common/Constants";

initializeIcons();

function Header(props: IHeaderProps) {

    const headerId = props.controlProps?.id ?? defaultHeaderProps.controlProps?.id;

    const stackStyles: Partial<IStackStyles> = {
        root: Object.assign({}, defaultHeaderProps.styleProps?.generalStyleProps,
            props.styleProps?.generalStyleProps)
    };

    const chatIconProps = Object.assign({}, defaultHeaderProps.controlProps?.headerIconProps,
        props.controlProps?.headerIconProps);

    const titleProps = Object.assign({}, defaultHeaderProps.controlProps?.headerTitleProps,
        props.controlProps?.headerTitleProps);

    const minimizeButtonProps = Object.assign({}, defaultHeaderProps.controlProps?.minimizeButtonProps,
        props.controlProps?.minimizeButtonProps);

    const closeButtonProps = Object.assign({}, defaultHeaderProps.controlProps?.closeButtonProps,
        props.controlProps?.closeButtonProps);

    const iconStyles = Object.assign({}, defaultHeaderProps.styleProps?.iconStyleProps,
        props.styleProps?.iconStyleProps);

    const iconImageStyles: IImageStyles = { root: {}, image: iconStyles };

    const titleStyles: ILabelStyles = {
        root: Object.assign({}, defaultHeaderProps.styleProps?.titleStyleProps,
            props.styleProps?.titleStyleProps)
    };

    const closeButtonStyles = Object.assign({}, defaultHeaderProps.styleProps?.closeButtonStyleProps,
        props.styleProps?.closeButtonStyleProps);

    const closeButtonHoverStyles = Object.assign({}, defaultHeaderProps.styleProps?.closeButtonHoverStyleProps,
        props.styleProps?.closeButtonHoverStyleProps);

    const minimizeButtonStyles = Object.assign({}, defaultHeaderProps.styleProps?.minimizeButtonStyleProps,
        props.styleProps?.minimizeButtonStyleProps);

    const minimizeButtonHoverStyles = Object.assign({}, defaultHeaderProps.styleProps?.minimizeButtonHoverStyleProps,
        props.styleProps?.minimizeButtonHoverStyleProps);

    const headerItemFocusStyles = Object.assign({}, defaultHeaderProps.styleProps?.headerItemFocusStyleProps,
        props.styleProps?.headerItemFocusStyleProps);

    return (

        <Stack as="article" id={headerId} horizontal className={props.className} horizontalAlign="space-between"
            styles={stackStyles}
            dir={props.controlProps?.dir ?? "ltr"}>
            <Stack horizontal id={Ids.HeaderLeftGroupId} verticalAlign="center">
                <Stack horizontal verticalAlign="center">
                    {processCustomComponents(props.controlProps?.leftGroup?.children)}
                    {!props.controlProps?.hideIcon && (decodeComponentString(props.componentOverrides?.headerIcon) ||
                        <Image
                            id={chatIconProps.id}
                            src={chatIconProps.src}
                            alt={chatIconProps.alt}
                            tabIndex={-1}
                            styles={iconImageStyles} />)
                    }
                    {!props.controlProps?.hideTitle && (decodeComponentString(props.componentOverrides?.headerTitle) ||
                        <h1>
                            <Label
                                id={titleProps.id}
                                tabIndex={-1}
                                styles={titleStyles}>
                                {titleProps?.text}
                            </Label>
                        </h1>)
                    }
                </Stack>
            </Stack>
            <Stack horizontal id={Ids.HeaderMiddleGroupId}>
                <Stack horizontal verticalAlign="start">
                    <Stack.Item align="start">
                        {processCustomComponents(props.controlProps?.middleGroup?.children)}
                    </Stack.Item>
                </Stack>
            </Stack>
            <Stack horizontal id={Ids.HeaderRightGroupId} verticalAlign="start">
                <Stack horizontal verticalAlign="start">
                    <Stack.Item align="start">
                        {processCustomComponents(props.controlProps?.rightGroup?.children)}
                        {!props.controlProps?.hideMinimizeButton && (decodeComponentString(props.componentOverrides?.headerMinimizeButton) ||
                            <MinimizeButton
                                {...minimizeButtonProps}
                                onClick={props.controlProps?.onMinimizeClick}
                                styles={minimizeButtonStyles}
                                hoverStyles={minimizeButtonHoverStyles}
                                focusStyles={headerItemFocusStyles} />)
                        }
                        {!props.controlProps?.hideCloseButton && (decodeComponentString(props.componentOverrides?.headerCloseButton) ||
                            <CloseButton
                                {...closeButtonProps}
                                onClick={props.controlProps?.onCloseClick}
                                styles={closeButtonStyles}
                                hoverStyles={closeButtonHoverStyles}
                                focusStyles={headerItemFocusStyles} />)
                        }
                    </Stack.Item>
                </Stack>
            </Stack>
        </Stack>
    );
}

export default Header;