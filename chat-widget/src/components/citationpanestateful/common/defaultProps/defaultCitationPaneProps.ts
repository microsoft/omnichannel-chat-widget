export const defaultCitationPaneStyles = {
    pane: {
        position: "fixed",
        left: "50%",
        top: "18%",
        transform: "translateX(-50%)",
        background: "#fff",
        width: "85%",
        height: "85%",
        overflowY: "auto",
        overflowX: "hidden",
        padding: 16,
        borderRadius: 6,
        zIndex: 10001,
        boxSizing: "border-box"
    } as React.CSSProperties
};

export const defaultCitationContentCSS = (controlId: string) => `
    #${controlId} .citation-content {
        flex: 1;
        min-height: 0; /* allow flex child to scroll */
        overflow-y: auto;
        overflow-x: auto;
        margin-bottom: 12px;
        white-space: normal; /* wrap normal text */
        word-break: break-word;
        -webkit-overflow-scrolling: touch;
    }

    #${controlId} .citation-content pre,
    #${controlId} .citation-content code {
        white-space: pre; /* preserve formatting */
    }

    #${controlId} .citation-content table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 12px;
        table-layout: auto;
        overflow-x: auto;
        display: block;
    }

    #${controlId} .citation-content table th,
    #${controlId} .citation-content table td {
        padding: 8px 12px;
        border: 1px solid rgba(0,0,0,0.08);
        text-align: left;
        vertical-align: top;
        word-break: break-word;
    }

    #${controlId} .citation-content img {
        max-width: 100%;
        height: auto;
    }
`;

export default {
    defaultCitationPaneStyles,
    defaultCitationContentCSS
};
