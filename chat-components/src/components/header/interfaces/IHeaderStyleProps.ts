import { IStyle } from "@fluentui/react";

/**
 * Header control and chidren style settings with IStyle types.
 * 
 * e.g. { background: "magneta", border: "1px solid red", "border-radius" : "0",...}
 */
export interface IHeaderStyleProps {
    /**
     * header control style settings.
     */
    generalStyleProps?: IStyle;
    /**
     * header icon style props
     */
    iconStyleProps?: IStyle;
    /**
     * header title component props
     */
    titleStyleProps?: IStyle;
    /**
     * header close button style props
     */
    closeButtonStyleProps?: IStyle;
    /**
     * header close button hover style props
     */
    closeButtonHoverStyleProps?: IStyle;
    /**
     * header minimize button style props
     */
    minimizeButtonStyleProps?: IStyle;
    /**
     * header minimize button hover style props
     */
    minimizeButtonHoverStyleProps?: IStyle;
    /**
     * header item button fucus style props
     */
    headerItemFocusStyleProps?: IStyle;
}