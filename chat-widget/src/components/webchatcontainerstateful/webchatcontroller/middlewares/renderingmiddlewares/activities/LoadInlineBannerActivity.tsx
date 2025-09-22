import React, { useMemo } from "react";

import { defaultMiddlewareLocalizedTexts } from "../../../../common/defaultProps/defaultMiddlewareLocalizedTexts";
import { ILiveChatWidgetProps } from "../../../../../livechatwidget/interfaces/ILiveChatWidgetProps";
import { defaultInlineBannerStyle } from "../defaultStyles/defaultInLineBannerStyle";
import { mergeStyles } from "@fluentui/merge-styles";

const LoadInlineBannerActivity = ({ webChatContainerProps, persistentChatHistory, id }: { webChatContainerProps?: ILiveChatWidgetProps['webChatContainerProps']; persistentChatHistory?: ILiveChatWidgetProps['persistentChatHistory']; id: string }) => {
    const localizedTexts = useMemo(() => ({
        ...defaultMiddlewareLocalizedTexts,
        ...webChatContainerProps?.localizedTexts
    }), [webChatContainerProps?.localizedTexts]);
    
    const bannerStyle = mergeStyles(
        persistentChatHistory?.bannerStyle,
        defaultInlineBannerStyle
    );

    return (
        <>
            <div 
                id={id} 
                className={bannerStyle}
                role="status"
                aria-live="polite"
                aria-label={localizedTexts.PREVIOUS_MESSAGES_LOADING}
                aria-busy="true"
            >
                {localizedTexts.PREVIOUS_MESSAGES_LOADING}
            </div>
        </>
    );
};

export default LoadInlineBannerActivity;