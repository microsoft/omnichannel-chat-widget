import { IIconStyles, IImageProps, ILabelStyles, ISpinnerStyles, IStackStyles, Icon, Label, Spinner, Stack } from "@fluentui/react";

import { ILoadingPaneProps } from "./interfaces/ILoadingPaneProps";
import React from "react";
import { decodeComponentString } from "../../common/decodeComponentString";
import { defaultLoadingPaneControlProps } from "./common/defaultProps/defaultLoadingPaneControlProps";
import { defaultLoadingPaneGeneralStyles } from "./common/defaultProps/defaultStyles/defaultLoadingPaneGeneralStyles";
import { defaultLoadingPaneIconImageProps } from "./common/defaultProps/defaultStyles/defaultLoadingPaneIconImageProps";
import { defaultLoadingPaneIconStyles } from "./common/defaultProps/defaultStyles/defaultLoadingPaneIconStyles";
import { defaultLoadingPaneSpinnerStyles } from "./common/defaultProps/defaultStyles/defaultLoadingPaneSpinnerStyles";
import { defaultLoadingPaneSpinnerTextStyles } from "./common/defaultProps/defaultStyles/defaultLoadingPaneSpinnerTextStyles";
import { defaultLoadingPaneSubtitleStyles } from "./common/defaultProps/defaultStyles/defaultLoadingPaneSubtitleStyles";
import { defaultLoadingPaneTitleStyles } from "./common/defaultProps/defaultStyles/defaultLoadingPaneTitleStyles";

function LoadingPane(props: ILoadingPaneProps) {

    const elementId = props.controlProps?.id ?? defaultLoadingPaneControlProps.id;

    const containerStyles: IStackStyles = {
        root: Object.assign({}, defaultLoadingPaneGeneralStyles, props.styleProps?.generalStyleProps)
    };

    const iconStyles: IIconStyles = {
        root: Object.assign({}, defaultLoadingPaneIconStyles, props.styleProps?.iconStyleProps)
    };

    const iconImageProps: IImageProps = Object.assign({}, defaultLoadingPaneIconImageProps, props.styleProps?.iconImageProps);

    const titleStyles: ILabelStyles = {
        root: Object.assign({}, defaultLoadingPaneTitleStyles, props.styleProps?.titleStyleProps)
    };

    const subtitleStyles: ILabelStyles = {
        root: Object.assign({}, defaultLoadingPaneSubtitleStyles, props.styleProps?.subtitleStyleProps)
    };

    const spinnerStyles: ISpinnerStyles = {
        root: Object.assign({}, defaultLoadingPaneSpinnerStyles, props.styleProps?.spinnerStyleProps)
    };

    const spinnerTextStyles: ILabelStyles = {
        root: Object.assign({}, defaultLoadingPaneSpinnerTextStyles, props.styleProps?.spinnerTextStyleProps)
    };
    
    const showInSmallWindow: boolean =  props.windowHeight ? props.windowHeight > 375 : true;

    return (
        <>
            {!props.controlProps?.hideLoadingPane &&
                <Stack
                    id={elementId}
                    tabIndex={-1}
                    styles={containerStyles}
                    role={props.controlProps?.role}
                    dir={props.controlProps?.dir ?? defaultLoadingPaneControlProps.dir}>

                    {!props.controlProps?.hideIcon && showInSmallWindow && (decodeComponentString(props.componentOverrides?.icon) ||
                        <Icon
                            className={props.styleProps?.classNames?.iconClassName}
                            styles={iconStyles}
                            imageProps={iconImageProps}
                            tabIndex={-1}
                            id={elementId + "-icon"}>
                        </Icon>)}

                    {!props.controlProps?.hideTitle && (decodeComponentString(props.componentOverrides?.title) ||
                        <Label
                            className={props.styleProps?.classNames?.titleClassName}
                            styles={titleStyles}
                            tabIndex={-1}
                            id={elementId + "-title"}>
                            {props.controlProps?.titleText ?? defaultLoadingPaneControlProps.titleText}
                        </Label>)}

                    {!props.controlProps?.hideSubtitle && (decodeComponentString(props.componentOverrides?.subtitle) ||
                        <Label
                            className={props.styleProps?.classNames?.subtitleClassName}
                            styles={subtitleStyles}
                            tabIndex={-1}
                            id={elementId + "-subtitle"}>
                            {props.controlProps?.subtitleText ?? defaultLoadingPaneControlProps.subtitleText}
                        </Label>)}

                    {!props.controlProps?.hideSpinner && (decodeComponentString(props.componentOverrides?.spinner) ||
                        <Spinner
                            className={props.styleProps?.classNames?.spinnerClassName}
                            styles={spinnerStyles}
                            size={props.controlProps?.spinnerSize}
                            tabIndex={-1}
                            id={elementId + "-spinner"}>
                        </Spinner>)}

                    {!props.controlProps?.hideSpinnerText && (decodeComponentString(props.componentOverrides?.spinnerText) ||
                        <Label
                            className={props.styleProps?.classNames?.spinnerTextClassName}
                            styles={spinnerTextStyles}
                            tabIndex={-1}
                            id={elementId + "-spinner-text"}>
                            {props.controlProps?.spinnerText ?? defaultLoadingPaneControlProps.spinnerText}
                        </Label>)}

                </Stack>
            }
        </>
    );
}

export default LoadingPane;