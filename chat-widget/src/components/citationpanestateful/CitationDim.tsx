import React from "react";
import ReactDOM from "react-dom";
import { DimLayer } from "../dimlayer/DimLayer";

const CONTAINER_SELECTOR = ".webchat__stacked-layout_container";

export const CitationDim: React.FC<{ brightness?: string }> = ({ brightness = "0.2" }) => {
    const container = document.querySelector(CONTAINER_SELECTOR) as HTMLElement | null;
    if (!container) return null;
    return ReactDOM.createPortal(
        <div style={{ position: "absolute", inset: 0 }}>
            <DimLayer brightness={brightness} />
        </div>,
        container
    );
};

export default CitationDim;
