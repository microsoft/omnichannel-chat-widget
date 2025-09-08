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
const CitationPaneTemplate: Story<ICitationPaneProps> = (args) => <CitationPane {...args}></CitationPane>;

/*
    Default Citation Pane
*/

export const CitationPaneDefault = CitationPaneTemplate.bind({});
CitationPaneDefault.args = defaultCitationPaneProps;

/*
    Citation Pane Preset 1 - Modern Card Style
*/

const citationPanePreset1Props: ICitationPaneProps = {
    controlProps: {
        id: "ocw-citation-pane-preset1",
        titleText: "Research Citation",
        contentHtml: "<p><strong>Title:</strong> Understanding Modern Web Development</p><p><strong>Author:</strong> Jane Doe</p><p><strong>Year:</strong> 2024</p><p><strong>Source:</strong> Tech Journal</p>",
        closeButtonText: "Close"
    },
    styleProps: {
        generalStyleProps: {
            backgroundColor: "white",
            borderColor: "#e1e5e9",
            borderRadius: "8px",
            borderStyle: "solid",
            borderWidth: "1px",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
            color: "#323130",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontSize: "14px",
            height: "auto",
            maxHeight: "400px",
            overflow: "hidden",
            padding: "16px",
            width: "320px"
        },
        titleStyleProps: {
            color: "#106ebe",
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "12px"
        },
        contentStyleProps: {
            fontSize: "14px",
            lineHeight: "1.5",
            marginBottom: "16px",
            maxHeight: "200px",
            overflow: "auto"
        },
        closeButtonStyleProps: {
            backgroundColor: "#f3f2f1",
            borderColor: "#d2d0ce",
            color: "#323130",
            fontSize: "14px",
            height: "32px",
            minWidth: "80px"
        }
    }
};

export const CitationPanePreset1 = CitationPaneTemplate.bind({});
CitationPanePreset1.args = citationPanePreset1Props;

/*
    Citation Pane Preset 2 - Custom Components
*/

const customTitle = (
    <h3 style={{ margin: 0, color: "#d83b01", fontSize: "18px", textAlign: "center" }}>
        📚 Custom Citation Header
    </h3>
);

const customCloseButton = encodeComponentString(
    <button style={{
        backgroundColor: "#d83b01",
        border: "none",
        borderRadius: "4px",
        color: "white",
        cursor: "pointer",
        fontSize: "12px",
        padding: "8px 16px"
    }}>
        ✕ Dismiss
    </button>
);

const citationPanePreset2Props: ICitationPaneProps = {
    componentOverrides: {
        title: customTitle,
        closeButton: customCloseButton
    },
    controlProps: {
        id: "ocw-citation-pane-preset2",
        contentHtml: "<div style='text-align: center; padding: 20px;'><p><em>This citation uses custom components</em></p><p>🎯 Custom styling applied to title and close button</p></div>",
    },
    styleProps: {
        generalStyleProps: {
            backgroundColor: "#fff4f4",
            border: "2px dashed #d83b01",
            borderRadius: "12px",
            padding: "16px",
            width: "350px",
            textAlign: "center"
        },
        contentStyleProps: {
            margin: "16px 0"
        }
    }
};

export const CitationPanePreset2 = CitationPaneTemplate.bind({});
CitationPanePreset2.args = citationPanePreset2Props;

/*
    Citation Pane Preset 3 - Compact Style with Hidden Elements
*/

const citationPanePreset3Props: ICitationPaneProps = {
    controlProps: {
        id: "ocw-citation-pane-preset3",
        hideTitle: true,
        contentHtml: "<p style='margin: 0; font-size: 12px;'><strong>Quick Reference:</strong> This is a compact citation without title.</p>",
        closeButtonText: "×",
        closeButtonAriaLabel: "Close compact citation"
    },
    styleProps: {
        generalStyleProps: {
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            fontSize: "12px",
            padding: "8px",
            width: "250px",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
        },
        contentStyleProps: {
            fontSize: "12px",
            lineHeight: "1.4"
        },
        closeButtonStyleProps: {
            alignSelf: "flex-end",
            backgroundColor: "transparent",
            border: "1px solid #ced4da",
            borderRadius: "50%",
            color: "#6c757d",
            fontSize: "14px",
            height: "24px",
            minWidth: "24px",
            width: "24px",
            padding: "0"
        }
    }
};

export const CitationPanePreset3 = CitationPaneTemplate.bind({});
CitationPanePreset3.args = citationPanePreset3Props;

/*
    Citation Pane Preset 4 - Interactive with State Change
*/

const citationPanePreset4Props: ICitationPaneProps = {
    controlProps: {
        id: "ocw-citation-pane-preset4",
        titleText: "Interactive Citation",
        contentHtml: "<p>Click the button to see different content!</p><p><strong>Current State:</strong> Initial</p>",
        closeButtonText: "Toggle Content"
    },
    styleProps: {
        generalStyleProps: {
            backgroundColor: "#e7f3ff",
            border: "2px solid #106ebe",
            borderRadius: "8px",
            padding: "16px",
            width: "300px"
        },
        titleStyleProps: {
            color: "#106ebe",
            fontSize: "16px",
            fontWeight: "bold",
            marginBottom: "12px"
        },
        closeButtonStyleProps: {
            backgroundColor: "#106ebe",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "8px 16px",
            fontSize: "14px"
        }
    }
};

export const CitationPanePreset4: Story<ICitationPaneProps> = (args) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, updateArgs] = useArgs();
    
    let isToggled = false;

    const toggleContent = () => {
        isToggled = !isToggled;
        updateArgs({
            ...args,
            controlProps: {
                ...args.controlProps,
                contentHtml: isToggled ? 
                    "<p>Content has been toggled!</p><p><strong>Current State:</strong> Toggled</p><p>🎉 This demonstrates interactive capabilities</p>" :
                    "<p>Click the button to see different content!</p><p><strong>Current State:</strong> Initial</p>",
                titleText: isToggled ? "Citation - Toggled State" : "Interactive Citation"
            }
        });
    };

    args.controlProps.onClose = toggleContent;
    return <CitationPane {...args}></CitationPane>;
};

CitationPanePreset4.args = citationPanePreset4Props;

/*
    Citation Pane Preset 5 - RTL Support
*/

const citationPanePreset5Props: ICitationPaneProps = {
    controlProps: {
        id: "ocw-citation-pane-preset5",
        dir: "rtl",
        titleText: "اقتباس",
        contentHtml: "<p dir='rtl'>هذا مثال على اقتباس باللغة العربية.</p><p dir='rtl'><strong>المؤلف:</strong> محمد أحمد</p><p dir='rtl'><strong>السنة:</strong> ٢٠٢٤</p>",
        closeButtonText: "إغلاق",
        closeButtonAriaLabel: "إغلاق الاقتباس"
    },
    styleProps: {
        generalStyleProps: {
            backgroundColor: "white",
            border: "1px solid #d2d0ce",
            borderRadius: "8px",
            padding: "16px",
            width: "320px",
            fontFamily: "Tahoma, Arial, sans-serif"
        },
        titleStyleProps: {
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "12px",
            textAlign: "right"
        },
        contentStyleProps: {
            fontSize: "14px",
            lineHeight: "1.6",
            textAlign: "right",
            marginBottom: "16px"
        },
        closeButtonStyleProps: {
            backgroundColor: "#0078d4",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "8px 16px",
            fontSize: "14px"
        }
    }
};

export const CitationPanePreset5 = CitationPaneTemplate.bind({});
CitationPanePreset5.args = citationPanePreset5Props;

/*
    Citation Pane Preset 6 - Large Content with Scrolling
*/

const citationPanePreset6Props: ICitationPaneProps = {
    controlProps: {
        id: "ocw-citation-pane-preset6",
        titleText: "Extended Citation",
        contentHtml: `
            <div>
                <p><strong>Abstract:</strong> This is a comprehensive research paper about modern web technologies and their impact on user experience.</p>
                <p><strong>Introduction:</strong> The evolution of web technologies has dramatically changed how we interact with digital content. From simple HTML pages to complex single-page applications, the web has become increasingly sophisticated.</p>
                <p><strong>Methodology:</strong> Our research involved analyzing over 1000 websites across different industries to understand current trends and best practices.</p>
                <p><strong>Results:</strong> Key findings include the importance of responsive design, accessibility considerations, and performance optimization.</p>
                <p><strong>Conclusion:</strong> Modern web development requires a holistic approach that considers user experience, accessibility, and performance from the ground up.</p>
                <p><strong>References:</strong></p>
                <ul>
                    <li>Smith, J. (2023). "Web Accessibility Guidelines"</li>
                    <li>Johnson, M. (2024). "Performance Optimization Strategies"</li>
                    <li>Brown, K. (2024). "Responsive Design Patterns"</li>
                </ul>
            </div>
        `,
        closeButtonText: "Close Citation"
    },
    styleProps: {
        generalStyleProps: {
            backgroundColor: "white",
            border: "1px solid #d2d0ce",
            borderRadius: "8px",
            boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.12)",
            padding: "20px",
            width: "400px",
            maxHeight: "500px",
            display: "flex",
            flexDirection: "column"
        },
        titleStyleProps: {
            color: "#323130",
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "16px",
            borderBottom: "1px solid #edebe9",
            paddingBottom: "8px"
        },
        contentStyleProps: {
            fontSize: "14px",
            lineHeight: "1.6",
            overflow: "auto",
            marginBottom: "16px",
            flex: "1"
        },
        closeButtonStyleProps: {
            backgroundColor: "#0078d4",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "10px 20px",
            fontSize: "14px",
            alignSelf: "flex-end"
        }
    }
};

export const CitationPanePreset6 = CitationPaneTemplate.bind({});
CitationPanePreset6.args = citationPanePreset6Props;

/*
    Citation Pane Preset 7 - Minimal Style
*/

const citationPanePreset7Props: ICitationPaneProps = {
    controlProps: {
        id: "ocw-citation-pane-preset7",
        titleText: "Minimal",
        contentHtml: "<p>Less is more.</p>",
        closeButtonText: "×"
    },
    styleProps: {
        generalStyleProps: {
            backgroundColor: "transparent",
            border: "none",
            padding: "12px",
            width: "200px"
        },
        titleStyleProps: {
            fontSize: "14px",
            fontWeight: "500",
            color: "#605e5c",
            marginBottom: "8px"
        },
        contentStyleProps: {
            fontSize: "13px",
            color: "#605e5c",
            fontStyle: "italic",
            marginBottom: "8px"
        },
        closeButtonStyleProps: {
            backgroundColor: "transparent",
            border: "1px solid #c8c6c4",
            borderRadius: "50%",
            color: "#605e5c",
            fontSize: "12px",
            height: "20px",
            width: "20px",
            padding: "0",
            alignSelf: "flex-end"
        }
    }
};

export const CitationPanePreset7 = CitationPaneTemplate.bind({});
CitationPanePreset7.args = citationPanePreset7Props;
