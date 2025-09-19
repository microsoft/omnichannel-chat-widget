import React, { useMemo } from "react";

import { defaultMiddlewareLocalizedTexts } from "../../../../common/defaultProps/defaultMiddlewareLocalizedTexts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LoadInlineBannerActivity = (props: any) => {
    const localizedTexts = useMemo(() => ({
        ...defaultMiddlewareLocalizedTexts,
        ...props.webChatContainerProps?.localizedTexts
    }), [props.webChatContainerProps?.localizedTexts]);
    
    return (
        <>
            <div 
                id={props.id} 
                style={props.style}
                role="status"
                aria-live="polite"
                aria-label={localizedTexts.PREVIOUS_MESSAGES_LOADING}
                aria-busy="true"
            >
                <span aria-hidden="true"> {localizedTexts.PREVIOUS_MESSAGES_LOADING} </span>
                
            </div>
        </>
    );
};

export default LoadInlineBannerActivity;