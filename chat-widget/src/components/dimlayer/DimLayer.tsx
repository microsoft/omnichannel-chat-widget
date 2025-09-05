import React from "react";

interface DimLayerInterface {
    brightness: string;
    onClick?: () => void;
}

export const DimLayer = ({ brightness, onClick }: DimLayerInterface) => {
    const color = "rgba(0, 0, 0, " + brightness + ")";
    const defaultDimLayerStyles: React.CSSProperties = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 10000,
        backgroundColor: color,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none"
    };

    const handleKeyDown = (ev: React.KeyboardEvent<HTMLDivElement>) => {
        if (!onClick) return;
        if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            onClick();
        }
    };

    return (
        <div
            id="oc-lcw-dim-layer"
            role={onClick ? "button" : undefined}
            aria-label={onClick ? "Close overlay" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            style={defaultDimLayerStyles}
        />
    );
};