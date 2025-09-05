import React from "react";

interface DimLayerInterface {
    brightness: string;
}

export const DimLayer = ({brightness}: DimLayerInterface) => {
    const color = "rgba(0, 0, 0, " + brightness + ")";
    const defaultDimLayerStyles: React.CSSProperties = {
        position: "absolute",
        borderRadius: "inherit",
        width:"100%",
        height:"100%",
        zIndex: 100,
        backgroundColor: color
    };

    return (
        <div id="oc-lcw-dim-layer"
            style={defaultDimLayerStyles}/>
    );
};