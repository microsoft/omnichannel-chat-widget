import { BroadcastServiceInitialize } from "../../services/BroadcastService";
import CitationPane from "./CitationPane";
import { ICitationPaneProps } from "./interfaces/ICitationPaneProps";
import { Meta } from "@storybook/react/types-6-0";
import React from "react";
import { Story } from "@storybook/react";
import { defaultCitationPaneProps } from "./common/defaultProps/defaultCitationPaneProps";
import { encodeComponentString } from "../../common/encodeComponentString";
import { useArgs } from "@storybook/client-api";

export default {
    title: "Stateless Components/Citation Pane",
    component: CitationPane,
} as Meta;

BroadcastServiceInitialize("testChannel");

// Common styling for top close button to ensure proper positioning and X display - using fixed px units for visual test consistency
const commonTopCloseButtonStyles = {
    position: "absolute" as const,
    top: "8px", // Fixed positioning for visual tests
    right: "8px", // Fixed positioning for visual tests
    backgroundColor: "#ffffff",
    border: "1px solid #d2d0ce",
    borderRadius: "50%",
    width: "28px", // Fixed width for visual tests
    height: "28px", // Fixed height for visual tests
    cursor: "pointer",
    fontSize: "16px", // Fixed font size for visual tests
    fontWeight: "bold" as const,
    color: "#605e5c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)", // Fixed shadow for visual tests
    zIndex: 1000,
    ":hover": {
        backgroundColor: "#f3f2f1",
        color: "#323130"
    }
};

// Standard top close button style props for stories - using fixed px units for visual test consistency
const standardTopCloseButtonStyleProps = {
    position: "absolute" as const,
    top: "8px", // Fixed positioning for visual tests
    right: "8px", // Fixed positioning for visual tests
    backgroundColor: "#ffffff",
    border: "1px solid #d2d0ce",
    borderRadius: "50%",
    width: "28px", // Fixed width for visual tests
    height: "28px", // Fixed height for visual tests
    fontSize: "16px", // Fixed font size for visual tests
    fontWeight: "bold" as const,
    color: "#605e5c",
    zIndex: 1000,
    ":hover": {
        backgroundColor: "#f3f2f1",
        color: "#323130"
    }
};

// Custom top close button component that guarantees X display
const customTopCloseButton = encodeComponentString(
    <button
        style={commonTopCloseButtonStyles}
        onClick={() => console.log("Top close clicked")}
        aria-label="Close citation"
    >
        ×
    </button>
);

const CitationPaneTemplate: Story<ICitationPaneProps> = (args) => <CitationPane {...args}></CitationPane>;

/*
    1. Pure Default Citation Pane (No Customizations)
*/
export const PureDefault = CitationPaneTemplate.bind({});
PureDefault.args = {
    ...defaultCitationPaneProps,
    controlProps: {
        ...defaultCitationPaneProps.controlProps,
        contentHtml: `
            <div>
                <p>This is a default citation pane using only the component's default props and styling.</p>
                <p><strong>Source:</strong> Default Content Example</p>
                <p>No custom styling or component overrides applied.</p>
            </div>
        `
    }
};

/*
    2. Default Citation Pane (Enhanced for Storybook)
*/
export const Default = CitationPaneTemplate.bind({});
Default.args = {
    ...defaultCitationPaneProps,
    controlProps: {
        ...defaultCitationPaneProps.controlProps,
        contentHtml: `
            <div>
                <p>This is the default citation pane demonstrating basic functionality.</p>
                <p><strong>Source:</strong> Documentation Example</p>
                <p><strong>Reference:</strong> CitationPane Component Guide</p>
            </div>
        `
    },
    styleProps: {
        ...defaultCitationPaneProps.styleProps,
        generalStyleProps: {
            ...(typeof defaultCitationPaneProps.styleProps?.generalStyleProps === "object" 
                ? defaultCitationPaneProps.styleProps.generalStyleProps 
                : {})
        }
    },
    componentOverrides: {
        topCloseButton: customTopCloseButton
    }
};

/*
    2. Research Citation Style
*/
export const ResearchCitation = CitationPaneTemplate.bind({});
ResearchCitation.args = {
    ...defaultCitationPaneProps,
    controlProps: {
        ...defaultCitationPaneProps.controlProps,
        id: "research-citation",
        titleText: "Research Citation",
        contentHtml: `
            <div>
                <blockquote style="border-left: 0.1875em solid #0078d4; padding-left: 0.9375em; margin: 0.9375em 0; font-style: italic;">
                    "Artificial Intelligence has revolutionized how we approach complex problem-solving in modern software development."
                </blockquote>
                <div style="background-color: #f3f2f1; padding: 0.625em; border-radius: 0.25em; margin: 0.625em 0;">
                    <strong>Citation Details:</strong><br/>
                    Author: Dr. Sarah Johnson<br/>
                    Journal: AI Development Quarterly<br/>
                    Year: 2024<br/>
                    DOI: 10.1000/aidq.2024.567890
                </div>
            </div>
        `
    },
    styleProps: {
        ...defaultCitationPaneProps.styleProps,
        generalStyleProps: {
            ...(typeof defaultCitationPaneProps.styleProps?.generalStyleProps === "object" 
                ? defaultCitationPaneProps.styleProps.generalStyleProps 
                : {}),
            backgroundColor: "#ffffff",
            border: "1px solid #e1dfdd",
            borderRadius: "0.5em", // Scalable border radius
            boxShadow: "0px 0.25em 1em rgba(0, 0, 0, 0.1)", // Scalable shadow
            padding: "1.25em", // Scalable padding
            paddingTop: "2.8em", // Scalable top padding
            position: "relative"
        },
        titleStyleProps: {
            ...(typeof defaultCitationPaneProps.styleProps?.titleStyleProps === "object" 
                ? defaultCitationPaneProps.styleProps.titleStyleProps 
                : {}),
            fontSize: "1.125em", // Scalable font size (18px equivalent)
            fontWeight: "600",
            color: "#0078d4",
            borderBottom: "1px solid #edebe9",
            paddingBottom: "0.5em", // Scalable padding
            marginBottom: "1em" // Scalable margin
        },
        contentStyleProps: {
            ...(typeof defaultCitationPaneProps.styleProps?.contentStyleProps === "object" 
                ? defaultCitationPaneProps.styleProps.contentStyleProps 
                : {}),
            lineHeight: "1.6",
            marginBottom: "1.25em" // Scalable margin
        }
    },
    componentOverrides: {
        topCloseButton: customTopCloseButton
    }
};

/*
    3. Compact Citation
*/
export const CompactCitation = CitationPaneTemplate.bind({});
CompactCitation.args = {
    ...defaultCitationPaneProps,
    controlProps: {
        ...defaultCitationPaneProps.controlProps,
        id: "compact-citation",
        titleText: "Quick Reference",
        contentHtml: "<p><strong>Source:</strong> User Guide Section 4.2 - Best Practices</p>"
    },
    styleProps: {
        ...defaultCitationPaneProps.styleProps,
        generalStyleProps: {
            ...(typeof defaultCitationPaneProps.styleProps?.generalStyleProps === "object" 
                ? defaultCitationPaneProps.styleProps.generalStyleProps 
                : {}),
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "0.375em", // Scalable border radius
            padding: "1em", // Scalable padding
            paddingTop: "2.2em", // Scalable top padding
            position: "relative"
        },
        titleStyleProps: {
            ...(typeof defaultCitationPaneProps.styleProps?.titleStyleProps === "object" 
                ? defaultCitationPaneProps.styleProps.titleStyleProps 
                : {}),
            fontSize: "0.875em", // Scalable font size (14px equivalent)
            fontWeight: "500",
            color: "#495057",
            marginBottom: "0.5em" // Scalable margin
        },
        contentStyleProps: {
            ...(typeof defaultCitationPaneProps.styleProps?.contentStyleProps === "object" 
                ? defaultCitationPaneProps.styleProps.contentStyleProps 
                : {}),
            fontSize: "0.8125em", // Scalable font size (13px equivalent)
            marginBottom: "0.75em" // Scalable margin
        }
    },
    componentOverrides: {
        topCloseButton: customTopCloseButton
    }
};

/*
    4. Top Close Button Positions
*/
export const TopClosePositions: Story<ICitationPaneProps> = (args) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, updateArgs] = useArgs();

    const togglePosition = () => {
        const currentPosition = args.controlProps?.topCloseButtonPosition || "topRight";
        const newPosition = currentPosition === "topRight" ? "topLeft" : "topRight";
        
        updateArgs({
            ...args,
            controlProps: {
                ...args.controlProps,
                topCloseButtonPosition: newPosition,
                titleText: `Top Close Button (${newPosition === "topRight" ? "Right" : "Left"} Position)`
            }
        });
    };

    args.controlProps = {
        ...args.controlProps,
        onClose: togglePosition
    };

    return <CitationPane {...args} />;
};

TopClosePositions.args = {
    controlProps: {
        id: "top-close-positions",
        titleText: "Top Close Button (Right Position)",
        contentHtml: `
            <div>
                <p>This demo shows the top close button positioning options.</p>
                <p><strong>Current position:</strong> Top Right (default)</p>
                <p>Click "Toggle Position" to switch between top-right and top-left positions.</p>
            </div>
        `,
        topCloseButtonPosition: "topRight"
    },
    styleProps: {
        generalStyleProps: {
            backgroundColor: "#e3f2fd",
            border: "2px solid #2196f3",
            borderRadius: "0.5em", // Scalable border radius
            padding: "1.25em", // Scalable padding
            paddingTop: "2.5em", // Scalable top padding
            position: "relative"
        },
        titleStyleProps: {
            color: "#1976d2",
            fontSize: "1em", // Scalable font size
            fontWeight: "600",
            marginBottom: "0.75em" // Scalable margin
        }
    },
    componentOverrides: {
        topCloseButton: customTopCloseButton
    }
};

/*
    5. Hidden Close Button Options
*/
export const HiddenCloseOptions = CitationPaneTemplate.bind({});
HiddenCloseOptions.args = {
    ...defaultCitationPaneProps,
    controlProps: {
        ...defaultCitationPaneProps.controlProps,
        id: "hidden-close-options",
        titleText: "Only Bottom Close Button",
        contentHtml: `
            <div>
                <p>This citation has the top close button hidden.</p>
                <p><strong>Use cases:</strong></p>
                <ul>
                    <li>Forced acknowledgment scenarios</li>
                    <li>Simplified UI with single close action</li>
                    <li>Mobile-optimized layouts</li>
                </ul>
            </div>
        `,
        hideTopCloseButton: true
    },
    styleProps: {
        ...defaultCitationPaneProps.styleProps,
        generalStyleProps: {
            ...(typeof defaultCitationPaneProps.styleProps?.generalStyleProps === "object" 
                ? defaultCitationPaneProps.styleProps.generalStyleProps 
                : {}),
            backgroundColor: "#fff3e0",
            border: "2px solid #ff9800",
            borderRadius: "0.5em", // Scalable border radius
            padding: "1.25em" // Scalable padding
        },
        titleStyleProps: {
            ...(typeof defaultCitationPaneProps.styleProps?.titleStyleProps === "object" 
                ? defaultCitationPaneProps.styleProps.titleStyleProps 
                : {}),
            color: "#f57c00",
            fontSize: "1em", // Scalable font size
            fontWeight: "600",
            marginBottom: "0.75em" // Scalable margin
        }
    }
};

/*
    6. Custom Component Overrides
*/
const customTitle = (
    <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "0.75em", // Scalable padding
        borderRadius: "0.375em", // Scalable border radius
        textAlign: "center",
        fontWeight: "bold",
        marginBottom: "1em" // Scalable margin
    }}>
        📚 Custom Citation Header
    </div>
);

export const CustomComponents = CitationPaneTemplate.bind({});
CustomComponents.args = {
    ...defaultCitationPaneProps,
    controlProps: {
        ...defaultCitationPaneProps.controlProps,
        id: "custom-components",
        contentHtml: `
            <div style="text-align: center; padding: 0.625em;">
                <p>This citation demonstrates custom component overrides.</p>
                <div style="background: #f8f9fa; padding: 0.75em; border-radius: 0.375em; margin: 0.75em 0;">
                    <strong>Custom Elements:</strong>
                    <ul style="text-align: left; margin-top: 0.5em;">
                        <li>Gradient title header</li>
                        <li>Styled close button</li>
                        <li>Custom top close button</li>
                    </ul>
                </div>
            </div>
        `
    },
    styleProps: {
        ...defaultCitationPaneProps.styleProps,
        generalStyleProps: {
            ...(typeof defaultCitationPaneProps.styleProps?.generalStyleProps === "object" 
                ? defaultCitationPaneProps.styleProps.generalStyleProps 
                : {}),
            backgroundColor: "#ffffff",
            border: "2px solid #e2e8f0",
            borderRadius: "0.75em", // Scalable border radius
            padding: "1.25em", // Scalable padding
            paddingTop: "2.5em", // Scalable top padding
            position: "relative"
        }
    },
    componentOverrides: {
        title: customTitle,
        topCloseButton: customTopCloseButton
    }
};

/*
    7. RTL (Right-to-Left) Support
*/
export const RTLSupport = CitationPaneTemplate.bind({});
RTLSupport.args = {
    ...defaultCitationPaneProps,
    controlProps: {
        ...defaultCitationPaneProps.controlProps,
        id: "rtl-support",
        dir: "rtl",
        titleText: "مرجع الاقتباس",
        contentHtml: `
            <div dir="rtl" style="text-align: right;">
                <p>هذا مثال على جزء الاقتباس مع دعم اللغة العربية.</p>
                <p><strong>المصدر:</strong> دليل المطور - الإصدار 2024</p>
                <p><strong>القسم:</strong> واجهات المستخدم المتعددة اللغات</p>
            </div>
        `,
        topCloseButtonPosition: "topLeft"
    },
    styleProps: {
        ...defaultCitationPaneProps.styleProps,
        generalStyleProps: {
            ...(typeof defaultCitationPaneProps.styleProps?.generalStyleProps === "object" 
                ? defaultCitationPaneProps.styleProps.generalStyleProps 
                : {}),
            backgroundColor: "#ffffff",
            border: "1px solid #d2d0ce",
            borderRadius: "0.5em", // Scalable border radius
            padding: "1.25em", // Scalable padding
            paddingTop: "2.5em", // Scalable top padding
            position: "relative",
            fontFamily: "Tahoma, Arial, sans-serif"
        },
        titleStyleProps: {
            ...(typeof defaultCitationPaneProps.styleProps?.titleStyleProps === "object" 
                ? defaultCitationPaneProps.styleProps.titleStyleProps 
                : {}),
            fontSize: "1em", // Scalable font size
            fontWeight: "600",
            textAlign: "right",
            marginBottom: "0.75em" // Scalable margin
        },
        contentStyleProps: {
            ...(typeof defaultCitationPaneProps.styleProps?.contentStyleProps === "object" 
                ? defaultCitationPaneProps.styleProps.contentStyleProps 
                : {}),
            lineHeight: "1.6",
            marginBottom: "1em" // Scalable margin
        }
    },
    componentOverrides: {
        topCloseButton: encodeComponentString(
            <button
                style={{
                    position: "absolute",
                    top: "8px", // Fixed positioning for visual tests
                    left: "8px", // Fixed left position for RTL visual tests
                    backgroundColor: "#ffffff",
                    border: "1px solid #d2d0ce",
                    borderRadius: "50%",
                    width: "28px", // Fixed width for visual tests
                    height: "28px", // Fixed height for visual tests
                    cursor: "pointer",
                    fontSize: "16px", // Fixed font size for visual tests
                    fontWeight: "bold",
                    color: "#605e5c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)", // Fixed shadow for visual tests
                    zIndex: 1000
                }}
                onClick={() => console.log("RTL top close clicked")}
                aria-label="إغلاق الاقتباس"
            >
                ×
            </button>
        )
    }
};

/*
    8. Large Content with Scrolling
*/
export const LargeContent = CitationPaneTemplate.bind({});
LargeContent.args = {
    ...defaultCitationPaneProps,
    controlProps: {
        ...defaultCitationPaneProps.controlProps,
        id: "large-content",
        titleText: "Extended Research Paper",
        contentHtml: `
            <div>
                <h4>Abstract</h4>
                <p>This comprehensive study examines the impact of modern web technologies on user experience design patterns and implementation strategies across diverse digital platforms.</p>
                
                <h4>Introduction</h4>
                <p>The evolution of web technologies has fundamentally transformed how developers approach user interface design. From simple HTML forms to complex interactive applications, the landscape has become increasingly sophisticated.</p>
                
                <h4>Methodology</h4>
                <p>Our research methodology involved analyzing over 1,000 websites across various industries, conducting user interviews, and performing A/B testing on different design patterns.</p>
                
                <h4>Key Findings</h4>
                <ul>
                    <li>Responsive design adoption has reached 94% among leading websites</li>
                    <li>Accessibility considerations significantly impact user satisfaction</li>
                    <li>Performance optimization directly correlates with user engagement</li>
                    <li>Mobile-first approaches yield better cross-platform experiences</li>
                </ul>
                
                <h4>Conclusion</h4>
                <p>Modern web development requires a holistic approach that prioritizes user experience, accessibility, and performance optimization from the initial design phase through implementation and maintenance.</p>
                
                <h4>References</h4>
                <ol>
                    <li>Johnson, M. (2024). "Responsive Design Best Practices". Web Dev Journal.</li>
                    <li>Smith, A. (2024). "Accessibility in Modern Web Apps". UX Research Quarterly.</li>
                    <li>Brown, L. (2023). "Performance Optimization Strategies". Tech Implementation Review.</li>
                </ol>
            </div>
        `
    },
    styleProps: {
        ...defaultCitationPaneProps.styleProps,
        generalStyleProps: {
            ...(typeof defaultCitationPaneProps.styleProps?.generalStyleProps === "object" 
                ? defaultCitationPaneProps.styleProps.generalStyleProps 
                : {}),
            backgroundColor: "#ffffff",
            border: "1px solid #d2d0ce",
            borderRadius: "0.5em", // Scalable border radius
            boxShadow: "0px 0.25em 1em rgba(0, 0, 0, 0.1)", // Scalable shadow
            padding: "1.25em", // Scalable padding
            paddingTop: "2.8em", // Scalable top padding
            maxHeight: "37.5em", // Scalable max height (600px equivalent at 16px base)
            position: "relative",
            display: "flex",
            flexDirection: "column"
        },
        titleStyleProps: {
            ...(typeof defaultCitationPaneProps.styleProps?.titleStyleProps === "object" 
                ? defaultCitationPaneProps.styleProps.titleStyleProps 
                : {}),
            fontSize: "1.125em", // Scalable font size (18px equivalent)
            fontWeight: "600",
            color: "#323130",
            borderBottom: "1px solid #edebe9",
            paddingBottom: "0.5em", // Scalable padding
            marginBottom: "1em" // Scalable margin
        },
        contentStyleProps: {
            ...(typeof defaultCitationPaneProps.styleProps?.contentStyleProps === "object" 
                ? defaultCitationPaneProps.styleProps.contentStyleProps 
                : {}),
            fontSize: "0.875em", // Scalable font size (14px equivalent)
            lineHeight: "1.6",
            overflow: "auto",
            marginBottom: "1em", // Scalable margin
            flex: "1"
        }
    },
    componentOverrides: {
        topCloseButton: customTopCloseButton
    }
};

/*
    9. Extremely Long Content Test (Fixed Height with Scrolling)
*/
export const ExtremelyLongContent = CitationPaneTemplate.bind({});
ExtremelyLongContent.args = {
    controlProps: {
        id: "extremely-long-content",
        titleText: "Very Long Research Document",
        contentHtml: `
            <div>
                <h4>Executive Summary</h4>
                <p>This is an extremely long document designed to test the scrolling behavior and height constraints of the CitationPane component. The content should be scrollable without breaking the layout or causing the pane to extend beyond reasonable bounds.</p>
                
                <h4>Chapter 1: Introduction</h4>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                
                <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
                
                <h4>Chapter 2: Methodology</h4>
                <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?</p>
                
                <ul>
                    <li>First methodology point with detailed explanation that goes on for quite some time</li>
                    <li>Second methodology point that also contains extensive detail about the research process</li>
                    <li>Third methodology point explaining the data collection and analysis procedures</li>
                    <li>Fourth methodology point covering statistical analysis and validation methods</li>
                    <li>Fifth methodology point discussing ethical considerations and participant consent</li>
                </ul>
                
                <h4>Chapter 3: Results</h4>
                <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.</p>
                
                <p>Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.</p>
                
                <h4>Chapter 4: Analysis</h4>
                <p>Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.</p>
                
                <ol>
                    <li>First analysis point with comprehensive data interpretation and statistical significance testing</li>
                    <li>Second analysis point covering correlation analysis and regression modeling techniques</li>
                    <li>Third analysis point examining outliers and data quality assessment procedures</li>
                    <li>Fourth analysis point discussing limitations and potential sources of bias in the study</li>
                    <li>Fifth analysis point presenting alternative interpretations and future research directions</li>
                </ol>
                
                <h4>Chapter 5: Discussion</h4>
                <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
                
                <p>But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness.</p>
                
                <h4>Chapter 6: Conclusions</h4>
                <p>No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure.</p>
                
                <p>To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?</p>
                
                <h4>References</h4>
                <ol>
                    <li>Smith, J. (2024). "Advanced Research Methodologies in Modern Science". Journal of Scientific Research, 45(3), 123-145.</li>
                    <li>Johnson, M. & Brown, L. (2024). "Statistical Analysis Techniques for Large Datasets". Data Science Quarterly, 12(2), 67-89.</li>
                    <li>Davis, K. (2023). "Ethical Considerations in Contemporary Research". Ethics in Science Review, 8(4), 234-256.</li>
                    <li>Wilson, P. et al. (2024). "Interpretation of Complex Research Results". Academic Review Journal, 56(1), 45-78.</li>
                    <li>Anderson, R. (2024). "Future Directions in Scientific Investigation". Research Horizons, 23(7), 156-189.</li>
                </ol>
                
                <h4>Appendices</h4>
                <p>Additional supplementary material and detailed data tables would typically appear here, extending the document even further to test the absolute limits of the scrolling functionality and ensure proper behavior with extremely long content that might be encountered in real-world usage scenarios.</p>
            </div>
        `
    }
    // Uses default styles to test the new scrolling behavior
};

/*
    Enhanced Styling Demo - Demonstrates button hover, focused, and pressed states
*/
export const EnhancedStyling = CitationPaneTemplate.bind({});
EnhancedStyling.args = {
    controlProps: {
        id: "oc-lcw-citationpane-enhanced",
        titleText: "Enhanced Styling Demo",
        contentHtml: `
            <div>
                <p>This story demonstrates the enhanced styling capabilities including:</p>
                <ul>
                    <li><strong>Button hover states</strong> - Hover over the buttons to see visual feedback</li>
                    <li><strong>Button focused states</strong> - Tab to the buttons to see focus indicators</li>
                    <li><strong>Keyboard support</strong> - Press ESC key to close the pane</li>
                    <li><strong>Consistent IStyle usage</strong> - All styling uses FluentUI IStyle objects</li>
                </ul>
                <p>Try interacting with both the top X button and the bottom Close button to experience the enhanced styling.</p>
                <p><em>Press the ESC key to close this citation pane and test keyboard interaction.</em></p>
            </div>
        `,
        onClose: () => {
            console.log("Enhanced styling demo closed");
        }
    },
    styleProps: {
        generalStyleProps: {
            backgroundColor: "#f8f9fa",
            border: "2px solid #e9ecef",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            maxWidth: "400px",
            margin: "20px"
        },
        titleStyleProps: {
            color: "#495057",
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "15px",
            borderBottom: "2px solid #dee2e6",
            paddingBottom: "8px"
        },
        contentStyleProps: {
            color: "#6c757d",
            fontSize: "14px",
            lineHeight: "1.6"
        },
        // Bottom close button enhanced styling
        closeButtonStyleProps: {
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: "500",
            minHeight: "36px"
        },
        closeButtonHoveredStyleProps: {
            backgroundColor: "#0056b3",
            color: "white",
            transform: "scale(1.02)",
            boxShadow: "0 2px 8px rgba(0, 123, 255, 0.3)"
        },
        closeButtonFocusedStyleProps: {
            border: "3px solid #80bdff",
            outline: "none",
            backgroundColor: "#0056b3"
        },
        // Top close button enhanced styling
        topCloseButtonStyleProps: {
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            fontSize: "18px",
            fontWeight: "bold",
            position: "absolute" as const,
            top: "12px",
            right: "12px",
            zIndex: 1000
        },
        topCloseButtonHoveredStyleProps: {
            backgroundColor: "#495057",
            color: "white",
            transform: "scale(1.1)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)"
        },
        topCloseButtonFocusedStyleProps: {
            border: "3px solid #80bdff",
            outline: "none",
            backgroundColor: "#495057"
        }
    }
};