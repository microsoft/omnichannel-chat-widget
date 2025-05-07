import React from "react";

const Spinner = (props: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const spinnerStyle: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
        boxSizing: "border-box",
        borderRadius: "50%",
        borderWidth: props.borderWidth || 2,
        borderStyle: "solid",
        borderColor: "rgb(0,120,212) rgb(199,224,244) rgb(199,224,244)",
        borderImage: "initial",
        animationName: "spin",
        animationDuration: "1.3s",
        animationIterationCount: "infinite",
        animationTimingFunction: "cubic-bezier(0.53, 0.21, 0.29, 0.67)",
        width: props.size || 20,
        height: props.size || 20,
    };

    return (
        <>
            <style>{`
                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
            <div className="spinner" style={spinnerStyle}></div>
        </>
    );
};

export default Spinner;