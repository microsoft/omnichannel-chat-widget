import React from "react";
import { defaultMiddlewareLocalizedTexts } from "../../../../common/defaultProps/defaultMiddlewareLocalizedTexts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LoadInlineBannerActivity = (props: any) => {
    return (
        <>
            <div id={props.id} style={props.style}>
                {defaultMiddlewareLocalizedTexts.PREVIOUS_MESSAGES_LOADING}
            </div>
        </>
    );
};

export default LoadInlineBannerActivity;