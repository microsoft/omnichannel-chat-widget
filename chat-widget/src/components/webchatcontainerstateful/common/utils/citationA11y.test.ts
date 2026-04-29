/**
 * @jest-environment jsdom
 */

import { patchCitationAnchorsForA11y } from "./citationA11y";

const buildCitationAnchor = (identifier: string, text: string, href = "cite:1"): HTMLAnchorElement => {
    const anchor = document.createElement("a");
    anchor.className = "webchat__link-definitions__list-item-box webchat__link-definitions__list-item-box--as-link";
    anchor.setAttribute("href", href);

    const body = document.createElement("div");
    body.className = "webchat__link-definitions__list-item-body";

    const badge = document.createElement("div");
    badge.className = "webchat__link-definitions__badge";
    badge.textContent = identifier;

    const mainBody = document.createElement("div");
    mainBody.className = "webchat__link-definitions__list-item-body-main";

    const mainText = document.createElement("div");
    mainText.className = "webchat__link-definitions__list-item-main-text";

    const textDiv = document.createElement("div");
    textDiv.className = "webchat__link-definitions__list-item-text";
    textDiv.setAttribute("title", text);
    textDiv.textContent = text;

    mainText.appendChild(textDiv);
    mainBody.appendChild(mainText);
    body.appendChild(badge);
    body.appendChild(mainBody);
    anchor.appendChild(body);

    return anchor;
};

describe("patchCitationAnchorsForA11y", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("merges citation number and link text into a single accessible label", () => {
        const anchor = buildCitationAnchor("1", "Assessment of eligibility for disabled person's pass");
        document.body.appendChild(anchor);

        patchCitationAnchorsForA11y(document);

        expect(anchor.getAttribute("aria-label")).toBe(
            "1, Assessment of eligibility for disabled person's pass"
        );
    });

    it("hides inner descendants from the accessibility tree", () => {
        const anchor = buildCitationAnchor("1", "Example title");
        document.body.appendChild(anchor);

        patchCitationAnchorsForA11y(document);

        const badge = anchor.querySelector(".webchat__link-definitions__badge");
        const body = anchor.querySelector(".webchat__link-definitions__list-item-body");
        const mainBody = anchor.querySelector(".webchat__link-definitions__list-item-body-main");
        const mainText = anchor.querySelector(".webchat__link-definitions__list-item-main-text");
        const textEl = anchor.querySelector(".webchat__link-definitions__list-item-text");

        expect(badge?.getAttribute("aria-hidden")).toBe("true");
        expect(body?.getAttribute("aria-hidden")).toBe("true");
        expect(mainBody?.getAttribute("aria-hidden")).toBe("true");
        expect(mainText?.getAttribute("aria-hidden")).toBe("true");
        expect(textEl?.getAttribute("aria-hidden")).toBe("true");

        // Defensive: inner descendants also get role="presentation", inert, and
        // tabindex="-1" so iOS VoiceOver cannot treat them as independently
        // selectable elements.
        expect(badge?.getAttribute("role")).toBe("presentation");
        expect(body?.getAttribute("role")).toBe("presentation");
        expect(mainBody?.getAttribute("role")).toBe("presentation");
        expect(mainText?.getAttribute("role")).toBe("presentation");
        expect(textEl?.getAttribute("role")).toBe("presentation");

        expect(badge?.hasAttribute("inert")).toBe(true);
        expect(textEl?.hasAttribute("inert")).toBe(true);
        expect(badge?.getAttribute("tabindex")).toBe("-1");
        expect(textEl?.getAttribute("tabindex")).toBe("-1");
    });

    it("injects a single global style tag to neutralize iOS Safari tap highlights on inner elements", () => {
        const anchor = buildCitationAnchor("1", "Example title");
        document.body.appendChild(anchor);

        patchCitationAnchorsForA11y(document);

        const style = document.getElementById("ocw-citation-a11y-styles");
        expect(style).not.toBeNull();
        expect(style?.textContent).toContain("pointer-events: none");
        expect(style?.textContent).toContain("-webkit-tap-highlight-color: transparent");
        expect(style?.textContent).toContain("user-select: none");

        // Re-running should not add a second <style> tag.
        patchCitationAnchorsForA11y(document);
        const allStyles = document.querySelectorAll("#ocw-citation-a11y-styles");
        expect(allStyles.length).toBe(1);

        // The anchor itself is explicitly role="link" so iOS VO sees ONE link.
        expect(anchor.getAttribute("role")).toBe("link");
    });

    it("does not overwrite an existing aria-label", () => {
        const anchor = buildCitationAnchor("2", "Another citation");
        anchor.setAttribute("aria-label", "Custom label");
        document.body.appendChild(anchor);

        patchCitationAnchorsForA11y(document);

        expect(anchor.getAttribute("aria-label")).toBe("Custom label");
    });

    it("marks anchors as patched and preserves a manually-set aria-label", () => {
        const anchor = buildCitationAnchor("1", "Citation text");
        document.body.appendChild(anchor);

        patchCitationAnchorsForA11y(document);
        expect(anchor.dataset.ocwCitationA11yPatched).toBe("true");

        // A manually-assigned aria-label must not be overwritten on subsequent
        // passes, even though the patch is otherwise re-runnable.
        anchor.setAttribute("aria-label", "Manually overridden");
        patchCitationAnchorsForA11y(document);
        expect(anchor.getAttribute("aria-label")).toBe("Manually overridden");
    });

    it("handles bare cite: anchors without badge/text structure", () => {
        const anchor = document.createElement("a");
        anchor.setAttribute("href", "cite:abc");
        anchor.setAttribute("title", "Fallback title");
        anchor.textContent = "[1]";
        document.body.appendChild(anchor);

        patchCitationAnchorsForA11y(document);

        // Prefers title over textContent for plain cite: anchors
        expect(anchor.getAttribute("aria-label")).toBe("Fallback title");
        expect(anchor.dataset.ocwCitationA11yPatched).toBe("true");
    });

    it("uses just the identifier when no text is present", () => {
        const anchor = document.createElement("a");
        anchor.className = "webchat__link-definitions__list-item-box";
        anchor.setAttribute("href", "cite:1");

        const badge = document.createElement("div");
        badge.className = "webchat__link-definitions__badge";
        badge.textContent = "5";
        anchor.appendChild(badge);

        document.body.appendChild(anchor);

        patchCitationAnchorsForA11y(document);

        expect(anchor.getAttribute("aria-label")).toBe("5");
    });

    it("skips anchors with no identifier and no text", () => {
        const anchor = document.createElement("a");
        anchor.className = "webchat__link-definitions__list-item-box";
        anchor.setAttribute("href", "cite:empty");
        document.body.appendChild(anchor);

        patchCitationAnchorsForA11y(document);

        expect(anchor.getAttribute("aria-label")).toBeNull();
        expect(anchor.dataset.ocwCitationA11yPatched).toBeUndefined();
    });

    it("is a no-op when root has no querySelectorAll", () => {
        expect(() => patchCitationAnchorsForA11y(null as unknown as ParentNode)).not.toThrow();
    });

    // WebChat re-renders the anchor's children (e.g. mounting OpenInNewWindowIcon
    // after the initial render). A second pass must hide the new descendants so
    // VoiceOver/TalkBack do not pick them up as separate focusable items.
    it("re-hides descendants added to an already-patched anchor", () => {
        const anchor = buildCitationAnchor("1", "Citation text");
        document.body.appendChild(anchor);

        patchCitationAnchorsForA11y(document);

        const lateChild = document.createElement("svg");
        lateChild.setAttribute("class", "webchat__link-definitions__open-in-new-window-icon");
        anchor.appendChild(lateChild);

        // Calling on the anchor directly (mirrors the MutationObserver path
        // that walks up to the closest matching ancestor anchor).
        patchCitationAnchorsForA11y(anchor);

        expect(lateChild.getAttribute("aria-hidden")).toBe("true");
        expect(lateChild.getAttribute("role")).toBe("presentation");
        expect(lateChild.hasAttribute("inert")).toBe(true);
        expect(lateChild.getAttribute("tabindex")).toBe("-1");
    });

    // If React re-renders strip our aria-hidden/role/tabindex, a second pass
    // must restore them. The patch is now idempotent rather than guarded by
    // a one-shot dataset marker.
    it("re-applies aria-hidden when stripped by an external re-render", () => {
        const anchor = buildCitationAnchor("1", "Citation text");
        document.body.appendChild(anchor);

        patchCitationAnchorsForA11y(document);

        const badge = anchor.querySelector(".webchat__link-definitions__badge");
        if (!badge) {
            throw new Error("Test setup did not produce a badge element");
        }
        badge.removeAttribute("aria-hidden");
        badge.removeAttribute("inert");

        patchCitationAnchorsForA11y(document);

        expect(badge.getAttribute("aria-hidden")).toBe("true");
        expect(badge.hasAttribute("inert")).toBe(true);
    });

    // The MutationObserver passes the anchor element itself as the root when
    // walking up via closest(). querySelectorAll alone would not match it.
    it("patches the root element when the root itself is a citation anchor", () => {
        const anchor = buildCitationAnchor("3", "Title");
        document.body.appendChild(anchor);

        patchCitationAnchorsForA11y(anchor);

        expect(anchor.getAttribute("aria-label")).toBe("3, Title");
    });

    // iOS VoiceOver in WKWebView surfaces elements with a `title` attribute
    // as separately swipeable items even when aria-hidden="true" is set, so
    // the patch removes title from descendants and stashes the original on
    // a data-* attribute for non-a11y consumers.
    it("strips title attribute from descendants and preserves it on a data-* attribute", () => {
        const anchor = buildCitationAnchor("1", "Manage a ticket | Transport for West Midlands");
        document.body.appendChild(anchor);

        patchCitationAnchorsForA11y(document);

        const textEl = anchor.querySelector(".webchat__link-definitions__list-item-text") as HTMLElement;
        expect(textEl.hasAttribute("title")).toBe(false);
        expect(textEl.dataset.ocwOriginalTitle).toBe("Manage a ticket | Transport for West Midlands");
    });

    // Repeated patching must not append additional overlay spans.
    it("does not append duplicate overlays on repeated calls", () => {
        const anchor = buildCitationAnchor("1", "Citation text");
        document.body.appendChild(anchor);

        patchCitationAnchorsForA11y(document);
        patchCitationAnchorsForA11y(document);
        patchCitationAnchorsForA11y(document);

        const overlays = anchor.querySelectorAll("[data-ocw-citation-overlay='true']");
        expect(overlays.length).toBe(1);
    });
});
