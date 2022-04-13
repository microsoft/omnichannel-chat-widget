import { IImageProps, IStyle } from "@fluentui/react";

import { ILoadingPaneClassNames } from "./ILoadingPaneClassNames";

export interface ILoadingPaneStyleProps {
    generalStyleProps?: IStyle;
    titleStyleProps?: IStyle;
    subtitleStyleProps?: IStyle;
    iconStyleProps?: IStyle;
    iconImageProps?: IImageProps;
    spinnerStyleProps?: IStyle;
    spinnerTextStyleProps?: IStyle;
    classNames?: ILoadingPaneClassNames;
}