export const defaultSystemMessageStyles = {
    maxWidth: "100%",
    color: "#605E5C",
    background: "transparent",
    fontSize: "12px",
    borderRadius: 0,
    minHeight: "auto",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    lineHeight: "1.4",
    padding: "0px 10px 0 10px",
    // iOS Safari: position underlines below all glyphs so they do not
    // intersect numbers. Also enforce lining figures for consistent baselines.
    WebkitTextUnderlinePosition: "under" as const,
    textUnderlinePosition: "under" as const,
    fontVariantNumeric: "lining-nums" as const
};
