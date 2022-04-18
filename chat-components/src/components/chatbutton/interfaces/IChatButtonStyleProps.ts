import { IChatButtonClassNames } from "./IChatButtonClassNames";
import { IStyle } from "@fluentui/merge-styles";

export interface IChatButtonStyleProps {
    generalStyleProps?: IStyle;
    chatButtonHoveredStyleProps?: IStyle;

    // Icon
    iconStyleProps?: IStyle;

    //Notification Bubble
    notificationBubbleStyleProps?: IStyle;
        
    //Text Container having title and subtitle
    textContainerStyleProps?: IStyle;
    titleStyleProps?: IStyle;
    subtitleStyleProps?: IStyle;

    classNames?: IChatButtonClassNames;
}