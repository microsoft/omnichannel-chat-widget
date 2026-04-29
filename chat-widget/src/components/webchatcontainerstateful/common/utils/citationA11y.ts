// Accessibility helper: Merges WebChat's citation card number badge and link
// text into a single focusable element.
//
// WebChat's LinkDefinitionItem renders an <a> containing a badge <div> (number)
// and a text <div> (title). On iOS VoiceOver, these block-level descendants are
// announced as two separate focusable links (e.g. "1, link" and
// "Assessment of eligibility..., link"). Setting a combined aria-label on the
// anchor and hiding inner descendants from the accessibility tree ensures the
// whole card is announced as one link.

const CITATION_ANCHOR_SELECTOR =
    "a.webchat__link-definitions__list-item-box, a[href^=\"cite:\"]";

const PATCHED_MARKER = "ocwCitationA11yPatched";

const STYLE_TAG_ID = "ocw-citation-a11y-styles";

// Global CSS injected once per document. Neutralizes iOS Safari's per-inner-
// element tap highlight / selection / focus rectangles that otherwise make
// the "1" badge and the link text appear as separate selectable areas even
// though they are inside a single <a>.
// Strategy:
//  - Make the anchor a block-level positioning parent.
//  - Add a transparent ::after pseudo-element that covers the entire anchor.
//    iOS Safari hit-tests that overlay as a SINGLE region, so the tap
//    highlight / selection rectangle always covers the whole card instead
//    of just the "1" badge or just the link text.
//  - Make every descendant fully transparent to pointer / selection / focus,
//    so they can never become a standalone tap target.
const STYLE_RULES = `
a.webchat__link-definitions__list-item-box,
a[href^="cite:"] {
    position: relative !important;
    display: block !important;
    isolation: isolate !important;
    -webkit-tap-highlight-color: rgba(0, 120, 212, 0.15) !important;
    -webkit-touch-callout: none !important;
    -webkit-user-select: none !important;
    user-select: none !important;
    cursor: pointer !important;
}
a.webchat__link-definitions__list-item-box::after,
a[href^="cite:"]::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 2;
    background: transparent;
    pointer-events: auto;
    -webkit-tap-highlight-color: rgba(0, 120, 212, 0.15);
}
a.webchat__link-definitions__list-item-box *,
a[href^="cite:"] * {
    pointer-events: none !important;
    -webkit-tap-highlight-color: transparent !important;
    -webkit-touch-callout: none !important;
    -webkit-user-select: none !important;
    user-select: none !important;
    outline: none !important;
    text-decoration: inherit !important;
    cursor: inherit !important;
}
`;

const ensureStyleInjected = (doc: Document): void => {
    if (!doc || typeof doc.getElementById !== "function" || doc.getElementById(STYLE_TAG_ID)) {
        return;
    }
    const style = doc.createElement("style");
    style.id = STYLE_TAG_ID;
    style.textContent = STYLE_RULES;
    (doc.head || doc.documentElement).appendChild(style);
};

export const patchCitationAnchorsForA11y = (root: ParentNode): void => {
    if (!root || typeof root.querySelectorAll !== "function") {
        return;
    }

    // Inject global CSS once per document. This covers every citation anchor
    // regardless of whether our per-node patch has run on it yet.
    const rootNode = root as unknown as Node & { ownerDocument?: Document | null };
    const doc: Document | null =
        rootNode.ownerDocument
        ?? ((root as unknown) as Document).defaultView?.document
        ?? ((root as unknown) as Document)
        ?? (typeof document !== "undefined" ? document : null);
    if (doc && typeof doc.createElement === "function") {
        ensureStyleInjected(doc);
    }

    // Also include the root itself when it matches — calls from MutationObserver
    // pass the anchor element directly, which querySelectorAll wouldn't return.
    const matched = new Set<HTMLAnchorElement>();
    if (typeof (root as Element).matches === "function"
        && (root as Element).matches(CITATION_ANCHOR_SELECTOR)) {
        matched.add(root as unknown as HTMLAnchorElement);
    }
    root.querySelectorAll(CITATION_ANCHOR_SELECTOR).forEach((n) => {
        matched.add(n as HTMLAnchorElement);
    });

    matched.forEach((anchor) => {
        const badge = anchor.querySelector(".webchat__link-definitions__badge");
        const textEl = anchor.querySelector(".webchat__link-definitions__list-item-text");

        const identifier = badge?.textContent?.trim() ?? "";
        // Prefer the explicit text element. For plain (non-card) citation anchors
        // (no badge), fall back to the title or the anchor's own text. When a
        // badge is present but no text element, avoid using anchor.textContent
        // since it would duplicate the identifier.
        let text = textEl?.textContent?.trim() ?? "";
        if (!text && !badge) {
            text = anchor.getAttribute("title")?.trim()
                || anchor.textContent?.trim()
                || "";
        }

        if (!identifier && !text) {
            return;
        }

        const combinedLabel = identifier && text
            ? `${identifier}, ${text}`
            : (identifier || text);

        // Always (re-)apply aria-label if absent. Setting it again with the same
        // value when it already matches is a no-op for the DOM; this keeps the
        // patch idempotent so React re-renders that strip the attribute heal.
        const existingLabel = anchor.getAttribute("aria-label");
        if (!existingLabel) {
            anchor.setAttribute("aria-label", combinedLabel);
        }

        // Explicitly mark the anchor as a single link so iOS VoiceOver treats
        // the whole card as one element.
        if (!anchor.getAttribute("role")) {
            anchor.setAttribute("role", "link");
        }

        // Nuclear a11y lockdown of EVERY descendant of the anchor (not just
        // known class names, because WebChat can render additional nodes).
        // iOS VoiceOver is known to split focus on block-level descendants
        // inside an <a>. Applying all four of the following guarantees only
        // the outer <a> is a selectable a11y / focus target:
        //   - aria-hidden="true"      removes element from the a11y tree
        //   - role="presentation"     strips any implicit semantic role
        //   - inert                   removes element from focus + interaction
        //   - tabindex="-1"           defensive (covers browsers without inert)
        anchor.querySelectorAll("*").forEach((el) => {
            const inner = el as HTMLElement;
            inner.setAttribute("aria-hidden", "true");
            inner.setAttribute("role", "presentation");
            inner.setAttribute("tabindex", "-1");
            // "inert" is a boolean attribute — presence alone is enough.
            if (!inner.hasAttribute("inert")) {
                inner.setAttribute("inert", "");
            }
            // pointer-events: none forwards clicks/taps/hover directly to the
            // outer <a>, so the entire card behaves as one selectable area
            // with a single focus/hover state (instead of "1" and the link
            // text highlighting independently).
            inner.style.pointerEvents = "none";
        });

        // DOM-level full-bleed overlay. Inline styles are used so this works
        // even when the widget renders inside a shadow DOM (where an
        // injected <style> tag in document.head cannot reach). The overlay
        // becomes the ONLY visible hit-test target for iOS Safari, so tapping
        // anywhere on the card highlights the entire card instead of just the
        // "1" badge or just the link text.
        const anchorStyle = anchor.style;
        if (!anchorStyle.position) {
            anchorStyle.position = "relative";
        }
        if (!anchorStyle.display || anchorStyle.display === "inline") {
            anchorStyle.display = "block";
        }
        const ownerDoc = anchor.ownerDocument;
        const existingOverlay = anchor.querySelector(":scope > [data-ocw-citation-overlay='true']");
        if (!existingOverlay && ownerDoc && typeof ownerDoc.createElement === "function") {
            const overlay = ownerDoc.createElement("span");
            overlay.setAttribute("aria-hidden", "true");
            overlay.setAttribute("data-ocw-citation-overlay", "true");
            overlay.style.cssText = [
                "position:absolute",
                "top:0",
                "left:0",
                "right:0",
                "bottom:0",
                "z-index:2",
                "background:transparent",
                "pointer-events:auto",
                "-webkit-tap-highlight-color:rgba(0,120,212,0.15)",
                "-webkit-touch-callout:none",
                "-webkit-user-select:none",
                "user-select:none",
                "cursor:pointer"
            ].join(";");
            anchor.appendChild(overlay);
        }

        anchor.dataset[PATCHED_MARKER] = "true";
    });
};
