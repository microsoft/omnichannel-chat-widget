import "@testing-library/jest-dom";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { BroadcastServiceInitialize } from "../../services/BroadcastService";
import CitationPane from "./CitationPane";
import { ICitationPaneProps } from "./interfaces/ICitationPaneProps";
import React from "react";
import { defaultCitationPaneProps } from "./common/defaultProps/defaultCitationPaneProps";

// Mock BroadcastService
jest.mock("../../services/BroadcastService", () => ({
    BroadcastService: {
        postMessage: jest.fn()
    },
    BroadcastServiceInitialize: jest.fn()
}));

beforeAll(() => {
    BroadcastServiceInitialize("testChannel");
});

describe("Citation Pane component", () => {

    afterEach(() => {
        cleanup();
        jest.resetAllMocks();
    });

    it("renders citation pane with default props", () => {
        const { container } = render(
            <CitationPane {...defaultCitationPaneProps} />);

        expect(container.childElementCount).toBe(1);
    });

    it("renders title and contentHtml", () => {
        const controlProps = {
            id: "test-citation",
            titleText: "Test Citation",
            contentHtml: "<p>Test content</p>",
            onClose: jest.fn()
        };

        render(<CitationPane controlProps={controlProps} />);

        expect(screen.getByText("Test Citation")).toBeInTheDocument();
        expect(screen.getByText("Test content")).toBeInTheDocument();
    });

    it("hides title when hideTitle is true", () => {
        const citationPanePropsHideTitle: ICitationPaneProps = {
            ...defaultCitationPaneProps,
            controlProps: {
                ...defaultCitationPaneProps.controlProps,
                hideTitle: true,
                titleText: "Hidden Title"
            }
        };

        render(<CitationPane {...citationPanePropsHideTitle} />);

        expect(screen.queryByText("Hidden Title")).not.toBeInTheDocument();
    });

    it("hides close button when hideCloseButton is true", () => {
        const citationPanePropsHideCloseButton: ICitationPaneProps = {
            ...defaultCitationPaneProps,
            controlProps: {
                ...defaultCitationPaneProps.controlProps,
                hideCloseButton: true
            }
        };

        render(<CitationPane {...citationPanePropsHideCloseButton} />);

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("clicking close button calls onClose and posts broadcast", () => {
        const { BroadcastService } = require("../../services/BroadcastService");
        const handleClose = jest.fn();

        const controlProps = {
            id: "test-citation",
            titleText: "Test Citation",
            contentHtml: "<p>Test content</p>",
            onClose: handleClose
        };

        render(<CitationPane controlProps={controlProps} />);

        const closeButton = screen.getByRole("button", { name: /Close citation/i });
        fireEvent.click(closeButton);

        expect(handleClose).toHaveBeenCalledTimes(1);
        expect(BroadcastService.postMessage).toHaveBeenCalledWith({
            elementType: "CitationPaneCloseButton",
            elementId: "test-citation-close",
            eventName: "OnClick"
        });
    });

    it("renders with custom close button text", () => {
        const controlProps = {
            id: "test-citation",
            titleText: "Test Citation",
            contentHtml: "<p>Test content</p>",
            closeButtonText: "Dismiss",
            closeButtonAriaLabel: "Dismiss citation",
            onClose: jest.fn()
        };

        render(<CitationPane controlProps={controlProps} />);

        expect(screen.getByRole("button", { name: /Dismiss citation/i })).toBeInTheDocument();
        expect(screen.getByText("Dismiss")).toBeInTheDocument();
    });

    it("applies custom styles", () => {
        const customStyleProps = {
            generalStyleProps: {
                backgroundColor: "red",
                width: "500px"
            },
            titleStyleProps: {
                color: "blue",
                fontSize: "20px"
            }
        };

        const citationPanePropsWithCustomStyles: ICitationPaneProps = {
            ...defaultCitationPaneProps,
            styleProps: customStyleProps
        };

        const { container } = render(<CitationPane {...citationPanePropsWithCustomStyles} />);
        const citationPaneElement = container.firstChild as HTMLElement;

        expect(citationPaneElement).toHaveStyle("background-color: red");
        expect(citationPaneElement).toHaveStyle("width: 500px");
    });

    it("renders with RTL direction", () => {
        const citationPanePropsRTL: ICitationPaneProps = {
            ...defaultCitationPaneProps,
            controlProps: {
                ...defaultCitationPaneProps.controlProps,
                dir: "rtl",
                titleText: "عنوان الاقتباس",
                contentHtml: "<p>محتوى الاقتباس</p>"
            }
        };

        const { container } = render(<CitationPane {...citationPanePropsRTL} />);
        const citationPaneElement = container.firstChild as HTMLElement;

        expect(citationPaneElement).toHaveAttribute("dir", "rtl");
    });

    it("renders custom component overrides", () => {
        const customTitle = <h2>Custom Title Component</h2>;
        const customCloseButton = <button>Custom Close</button>;

        const citationPanePropsWithOverrides: ICitationPaneProps = {
            ...defaultCitationPaneProps,
            componentOverrides: {
                title: customTitle,
                closeButton: customCloseButton
            }
        };

        render(<CitationPane {...citationPanePropsWithOverrides} />);

        expect(screen.getByText("Custom Title Component")).toBeInTheDocument();
        expect(screen.getByText("Custom Close")).toBeInTheDocument();
    });

    it("applies custom class names", () => {
        const customClassNames = {
            containerClassName: "custom-container",
            titleClassName: "custom-title",
            contentClassName: "custom-content",
            closeButtonClassName: "custom-close-button"
        };

        const citationPanePropsWithClassNames: ICitationPaneProps = {
            ...defaultCitationPaneProps,
            styleProps: {
                ...defaultCitationPaneProps.styleProps,
                classNames: customClassNames
            }
        };

        const { container } = render(<CitationPane {...citationPanePropsWithClassNames} />);

        expect(container.querySelector(".custom-container")).toBeInTheDocument();
        expect(container.querySelector(".custom-title")).toBeInTheDocument();
        expect(container.querySelector(".custom-content")).toBeInTheDocument();
        expect(container.querySelector(".custom-close-button")).toBeInTheDocument();
    });

    it("handles missing onClose prop gracefully", () => {
        const controlProps = {
            id: "test-citation",
            titleText: "Test Citation",
            contentHtml: "<p>Test content</p>"
            // onClose is not provided
        };

        render(<CitationPane controlProps={controlProps} />);

        const closeButton = screen.getByRole("button");
        
        // Should not throw an error when clicking
        expect(() => {
            fireEvent.click(closeButton);
        }).not.toThrow();
    });

    it("renders with dangerous HTML content", () => {
        const controlProps = {
            id: "test-citation",
            titleText: "Test Citation",
            contentHtml: "<p><strong>Bold text</strong> and <em>italic text</em></p><ul><li>Item 1</li><li>Item 2</li></ul>",
            onClose: jest.fn()
        };

        render(<CitationPane controlProps={controlProps} />);

        expect(screen.getByText("Bold text")).toBeInTheDocument();
        expect(screen.getByText("italic text")).toBeInTheDocument();
        expect(screen.getByText("Item 1")).toBeInTheDocument();
        expect(screen.getByText("Item 2")).toBeInTheDocument();
    });
});
