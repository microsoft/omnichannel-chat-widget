import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import ConversationDividerActivity from "./ConversationDividerActivity";
import React from "react";
import { defaultMiddlewareLocalizedTexts } from "../../../../common/defaultProps/defaultMiddlewareLocalizedTexts";

describe("ConversationDividerActivity", () => {
    it("uses default localized text when no override provided", () => {
        render(<ConversationDividerActivity />);
        const divider = screen.getByRole("separator");
        expect(divider).toHaveAttribute("aria-label", defaultMiddlewareLocalizedTexts.CONVERSATION_DIVIDER_ARIA_LABEL);
    });

    it("prop override wins over default", () => {
        const override = "Custom Divider Label";
        render(<ConversationDividerActivity dividerActivityAriaLabel={override} />);
        const divider = screen.getByRole("separator");
        expect(divider).toHaveAttribute("aria-label", override);
    });
});
