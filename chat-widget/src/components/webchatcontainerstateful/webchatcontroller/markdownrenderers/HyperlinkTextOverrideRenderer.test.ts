import "@testing-library/jest-dom/extend-expect";

import { act, cleanup } from "@testing-library/react";
import HyperlinkTextOverrideRenderer from "./HyperlinkTextOverrideRenderer";

describe("HyperlinkTextOverrideRenderer unit tests", () => {
    afterEach(() => {
        cleanup();
        jest.resetAllMocks();
    });

    act(() => {
        it("HyperlinkTextOverrideRenderer() with hyperlinkTextOverride set to 'false' should not override the hyperlink text", () => {
            const data = {
                href: "https://microsoft.com/",
                text: "https://bing.com/"
            };

            const renderer = new HyperlinkTextOverrideRenderer(false);
            const input = `<a href="${data.href}">${data.text}</a>`;
            const expected = input;
            const result = renderer.render(input);

            expect(result).toBe(expected);
        });

        it("HyperlinkTextOverrideRenderer() with hyperlinkTextOverride set to 'true' should override the hyperlink text", () => {
            const data = {
                href: "https://microsoft.com/",
                text: "https://bing.com/"
            };

            const renderer = new HyperlinkTextOverrideRenderer(true);
            const input = `<a href="${data.href}">${data.text}</a>`;
            const expected = `<a href="${data.href}">${data.href}</a>`;
            const result = renderer.render(input);

            expect(result).toBe(expected);
        });
    });

});