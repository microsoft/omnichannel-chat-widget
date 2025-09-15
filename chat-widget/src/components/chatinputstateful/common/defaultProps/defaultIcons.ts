import React from "react";

const DEFAULT_ICON_COLOR = "#616161"; 

export const createSendIcon = () =>
    React.createElement(
        "svg",
        {
            className: "webchat__send-icon",
            height: 28,
            viewBox: "0 0 45.7 33.8",
            width: 28,
            role: "presentation",
            "aria-hidden": "true",
            focusable: "false"
        },
        React.createElement("path", {
            clipRule: "evenodd",
            d: "M8.55 25.25l21.67-7.25H11zm2.41-9.47h19.26l-21.67-7.23zm-6 13l4-11.9L5 5l35.7 11.9z",
            fill: DEFAULT_ICON_COLOR
        })
    );

export const createAttachmentIcon = () => 
    React.createElement(
        "svg",
        {
            width: "28",
            height: "28",
            viewBox: "0 0 25.75 46",
            role: "presentation",
            "aria-hidden": "true",
            focusable: "false"
        },
        React.createElement("path", {
            d: "M20.75 11.75v21.37a7.69 7.69 0 0 1-.62 3.07 7.95 7.95 0 0 1-4.19 4.19 7.89 7.89 0 0 1-6.13 0 7.95 7.95 0 0 1-4.19-4.19 7.69 7.69 0 0 1-.62-3.07v-22.5a5.27 5.27 0 0 1 .45-2.17 5.69 5.69 0 0 1 3-3 5.48 5.48 0 0 1 4.35 0 5.69 5.69 0 0 1 3 3 5.27 5.27 0 0 1 .45 2.17v22.5a3.41 3.41 0 0 1-.26 1.32 3.31 3.31 0 0 1-1.8 1.8 3.46 3.46 0 0 1-2.63 0 3.31 3.31 0 0 1-1.8-1.8 3.41 3.41 0 0 1-.26-1.32V14h2.25v19.12a1.13 1.13 0 1 0 2.25 0v-22.5a3.4 3.4 0 0 0-.26-1.31 3.31 3.31 0 0 0-1.8-1.8 3.46 3.46 0 0 0-2.63 0 3.31 3.31 0 0 0-1.8 1.8 3.4 3.4 0 0 0-.26 1.31v22.5a5.32 5.32 0 0 0 .45 2.18 5.69 5.69 0 0 0 3 3 5.48 5.48 0 0 0 4.35 0 5.69 5.69 0 0 0 3-3 5.32 5.32 0 0 0 .45-2.18v-21.37z",
            fill: DEFAULT_ICON_COLOR
        })
    );
