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
                hideCloseButton: true,
                hideTopCloseButton: true
            }
        };

        render(<CitationPane {...citationPanePropsHideCloseButton} />);

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("hides only bottom close button when hideCloseButton is true", () => {
        const citationPanePropsHideBottomCloseButton: ICitationPaneProps = {
            ...defaultCitationPaneProps,
            controlProps: {
                ...defaultCitationPaneProps.controlProps,
                hideCloseButton: true
            }
        };

        render(<CitationPane {...citationPanePropsHideBottomCloseButton} />);

        // Should still have the top close button
        const buttons = screen.getAllByRole("button");
        expect(buttons).toHaveLength(1);
        expect(buttons[0]).toHaveAttribute("id", "ocw-citation-pane-top-close");
        // But should not have the bottom close button with text
        expect(screen.queryByText("Close")).not.toBeInTheDocument();
    });

    it("hides only top close button when hideTopCloseButton is true", () => {
        const citationPanePropsHideTopCloseButton: ICitationPaneProps = {
            ...defaultCitationPaneProps,
            controlProps: {
                ...defaultCitationPaneProps.controlProps,
                hideTopCloseButton: true
            }
        };

        render(<CitationPane {...citationPanePropsHideTopCloseButton} />);

        // Should only have the bottom close button
        const buttons = screen.getAllByRole("button");
        expect(buttons).toHaveLength(1);
        expect(buttons[0]).toHaveTextContent("Close");
    });

    it("renders both top and bottom close buttons by default", () => {
        const controlProps = {
            id: "test-citation",
            titleText: "Test Citation",
            contentHtml: "<p>Test content</p>",
            onClose: jest.fn()
        };

        const { container } = render(<CitationPane controlProps={controlProps} />);

        const buttons = screen.getAllByRole("button");
        expect(buttons).toHaveLength(2);
        
        // Find buttons by their IDs directly
        const topCloseButton = container.querySelector("#test-citation-top-close");
        expect(topCloseButton).toBeInTheDocument();
        
        const bottomCloseButton = container.querySelector("#test-citation-close");
        expect(bottomCloseButton).toBeInTheDocument();
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

        const closeButton = screen.getByText("Close");
        fireEvent.click(closeButton);

        expect(handleClose).toHaveBeenCalledTimes(1);
        expect(BroadcastService.postMessage).toHaveBeenCalledWith({
            elementType: "CitationPaneCloseButton",
            elementId: "test-citation-close",
            eventName: "OnClick"
        });
    });

    it("clicking top close button calls onClose and posts broadcast", () => {
        const { BroadcastService } = require("../../services/BroadcastService");
        const handleClose = jest.fn();

        const controlProps = {
            id: "test-citation",
            titleText: "Test Citation",
            contentHtml: "<p>Test content</p>",
            onClose: handleClose
        };

        const { container } = render(<CitationPane controlProps={controlProps} />);

        const topCloseButton = container.querySelector("#test-citation-top-close");
        fireEvent.click(topCloseButton);

        expect(handleClose).toHaveBeenCalledTimes(1);
        expect(BroadcastService.postMessage).toHaveBeenCalledWith({
            elementType: "CitationPaneCloseButton",
            elementId: "test-citation-top-close",
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
        const customTopCloseButton = <button>Custom Top Close</button>;

        const citationPanePropsWithOverrides: ICitationPaneProps = {
            ...defaultCitationPaneProps,
            componentOverrides: {
                title: customTitle,
                closeButton: customCloseButton,
                topCloseButton: customTopCloseButton
            }
        };

        render(<CitationPane {...citationPanePropsWithOverrides} />);

        expect(screen.getByText("Custom Title Component")).toBeInTheDocument();
        expect(screen.getByText("Custom Close")).toBeInTheDocument();
        expect(screen.getByText("Custom Top Close")).toBeInTheDocument();
    });

    it("positions top close button on the left when topCloseButtonPosition is topLeft", () => {
        const controlProps = {
            id: "test-citation",
            titleText: "Test Citation",
            contentHtml: "<p>Test content</p>",
            topCloseButtonPosition: "topLeft" as const,
            onClose: jest.fn()
        };

        const { container } = render(<CitationPane controlProps={controlProps} />);
        
        const topCloseButton = container.querySelector("#test-citation-top-close");
        expect(topCloseButton).toBeInTheDocument();
    });

    it("applies custom class names", () => {
        const customClassNames = {
            containerClassName: "custom-container",
            titleClassName: "custom-title",
            contentClassName: "custom-content",
            closeButtonClassName: "custom-close-button",
            topCloseButtonClassName: "custom-top-close-button"
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
        expect(container.querySelector(".custom-top-close-button")).toBeInTheDocument();
    });

    it("handles missing onClose prop gracefully", () => {
        const controlProps = {
            id: "test-citation",
            titleText: "Test Citation",
            contentHtml: "<p>Test content</p>"
            // onClose is not provided
        };

        render(<CitationPane controlProps={controlProps} />);

        const closeButton = screen.getByText("Close");
        
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
it("renders with default props", () => {
    const { container } = render(<CitationPane {...defaultCitationPaneProps} />);
    expect(container).toBeInTheDocument();
});

it("renders with custom title and content", () => {
    const controlProps = {
        id: "custom-citation",
        titleText: "Custom Title",
        contentHtml: "<p>Custom Content</p>",
    };

    render(<CitationPane controlProps={controlProps} />);

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Custom Content")).toBeInTheDocument();
});

it("renders with custom direction (RTL)", () => {
    const controlProps = {
        dir: "rtl",
        titleText: "عنوان",
        contentHtml: "<p>محتوى</p>",
    };

    const { container } = render(<CitationPane controlProps={controlProps} />);
    expect(container.firstChild).toHaveAttribute("dir", "rtl");
});

it("renders top close button on the left when topCloseButtonPosition is 'topLeft'", () => {
    const controlProps = {
        topCloseButtonPosition: "topLeft",
    };

    const { container } = render(<CitationPane controlProps={controlProps} />);
    const topCloseButton = container.querySelector("button#default-top-close");
    expect(topCloseButton).toHaveStyle("left: 8px");
});

it("does not render top close button when hideTopCloseButton is true", () => {
    const controlProps = {
        hideTopCloseButton: true,
    };

    const { container } = render(<CitationPane controlProps={controlProps} />);
    const topCloseButton = container.querySelector("button#default-top-close");
    expect(topCloseButton).not.toBeInTheDocument();
});

it("does not render bottom close button when hideCloseButton is true", () => {
    const controlProps = {
        hideCloseButton: true,
    };

    const { container } = render(<CitationPane controlProps={controlProps} />);
    const bottomCloseButton = container.querySelector("button#default-close");
    expect(bottomCloseButton).not.toBeInTheDocument();
});

it("calls onClose when bottom close button is clicked", () => {
    const handleClose = jest.fn();
    const controlProps = {
        onClose: handleClose,
    };

    render(<CitationPane controlProps={controlProps} />);
    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
});

it("calls onClose when top close button is clicked", () => {
    const handleClose = jest.fn();
    const controlProps = {
        onClose: handleClose,
    };

    const { container } = render(<CitationPane controlProps={controlProps} />);
    const topCloseButton = container.querySelector("button#default-top-close");
    fireEvent.click(topCloseButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
});

it("renders with custom styles", () => {
    const styleProps = {
        generalStyleProps: { backgroundColor: "blue" },
        titleStyleProps: { color: "white" },
    };

    const { container } = render(<CitationPane styleProps={styleProps} />);
    const citationPane = container.firstChild as HTMLElement;

    expect(citationPane).toHaveStyle("background-color: blue");
    expect(screen.getByText("Default Title")).toHaveStyle("color: white");
});

it("renders with custom class names", () => {
    const classNames = {
        containerClassName: "custom-container",
        titleClassName: "custom-title",
    };

    const { container } = render(
        <CitationPane styleProps={{ classNames }} />
    );

    expect(container.querySelector(".custom-container")).toBeInTheDocument();
    expect(container.querySelector(".custom-title")).toBeInTheDocument();
});

it("renders dangerous HTML content safely", () => {
    const controlProps = {
        contentHtml: "<p><strong>Bold</strong> and <em>Italic</em></p>",
    };

    render(<CitationPane controlProps={controlProps} />);

    expect(screen.getByText("Bold")).toBeInTheDocument();
    expect(screen.getByText("Italic")).toBeInTheDocument();
});