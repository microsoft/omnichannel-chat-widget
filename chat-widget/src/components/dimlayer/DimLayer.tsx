import React, { useEffect, useState } from "react";

interface DimLayerInterface {
    brightness: string;
    onClick?: () => void;
    /** Optional CSS selector for a container to constrain the dim to */
    containerSelector?: string;
    /** Optional zIndex to allow callers to layer the dim appropriately */
    zIndex?: number;
}

export const DimLayer = ({ brightness, onClick, containerSelector, zIndex }: DimLayerInterface) => {
    const color = "rgba(0, 0, 0, " + brightness + ")";

    const [rectStyle, setRectStyle] = useState<React.CSSProperties | null>(null);

    useEffect(() => {
        const compute = () => {
            if (!containerSelector) {
                setRectStyle(null);
                return;
            }
            try {
                const container = document.querySelector(containerSelector) as HTMLElement | null;
                if (!container) {
                    setRectStyle(null);
                    return;
                }
                const r = container.getBoundingClientRect();
                setRectStyle({
                    position: "fixed",
                    left: `${Math.round(r.left)}px`,
                    top: `${Math.round(r.top)}px`,
                    width: `${Math.round(r.width)}px`,
                    height: `${Math.round(r.height)}px`,
                });
            } catch (e) {
                setRectStyle(null);
            }
        };

        compute();
        window.addEventListener("resize", compute);
        return () => window.removeEventListener("resize", compute);
    }, [containerSelector]);

    const defaultDimLayerStyles: React.CSSProperties = Object.assign({
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: zIndex ?? 10000,
        backgroundColor: color,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none"
    }, rectStyle ?? {});

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