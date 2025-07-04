import * as OcChatComponentPackageInfo from "@microsoft/omnichannel-chat-components/package.json";
import * as OcChatSdkPackageinfo from "@microsoft/omnichannel-chat-sdk/package.json";
import * as OcChatWidgetPackageInfo from "@microsoft/omnichannel-chat-widget/package.json";

import React, { useEffect, useState } from "react";

import { LiveChatWidget } from "@microsoft/omnichannel-chat-widget";
import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import ReactDOM from "react-dom";
import { defaultProps } from "../src/common/defaultProps";

// Suppress React development warnings for known issues in the chat widget
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
    if (args[0] && args[0].includes && args[0].includes('Cannot update a component')) {
        return; // Suppress this specific warning
    }
    originalConsoleWarn(...args);
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Chat Widget Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <div>Something went wrong with the chat widget.</div>;
        }

        return this.props.children;
    }
}

const getOmnichannelChatConfig = () => {
    // add your own OC setting, hard-coded just for sample, should be replaced with a better handling
    const omnichannelConfig = {
        orgId: "",
        orgUrl: "",
        widgetId: ""
    };
    return omnichannelConfig;
};

const App = () => {
    // To avoid webpack 5 warning and soon obsolete code, rename the packageinfo variable
    const OcSdkPkginfo = OcChatSdkPackageinfo;
    const OcChatWidgetPkgInfo = OcChatWidgetPackageInfo;
    const OcChatComponentPkgInfo = OcChatComponentPackageInfo;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [liveChatWidgetProps, setLiveChatWidgetProps] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const omnichannelConfig = getOmnichannelChatConfig();

    useEffect(() => {
        const init = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
                await chatSDK.initialize();
                const chatConfig = await chatSDK.getLiveChatConfig();

                const liveChatWidgetProps = {
                    ...defaultProps,

                    headerProps: { // example: default header is being overriden with a new background color style
                        styleProps: {
                            generalStyleProps: {
                                background: "#c5ecc5"
                            }
                        }
                    },
                    loadingPaneProps: { // example: loading pane customization overrides
                        styleProps: {
                            generalStyleProps: {
                                backgroundColor: "#c5ecc5"
                            }
                        },
                        titleStyleProps: {
                            fontFamily: "Garamond"
                        },
                        subtitleStyleProps: {
                            fontFamily: "Garamond"
                        },
                        spinnerTextStyleProps: {
                            fontFamily: "Garamond"
                        }
                    },
                    webChatContainerProps: { // example: web chat customization overrides
                        webChatStyles: {
                            bubbleBackground: "white",
                            bubbleFromUserBackground: "#c5ecc5",
                            bubbleFromUserTextColor: "#051005",
                            bubbleTextColor: "#051005",
                            primaryFont: "Garamond"
                        },
                        disableMarkdownMessageFormatting: true, // setting the default to true for a known issue with markdown
                    },
                    styleProps: { // example: adjusting sizing and placement of the chat widget
                        generalStyles: {
                            width: "50%",
                            height: "800px",
                            bottom: "30px",
                            right: "30px"
                        }
                    },
                    chatSDK, // mandatory
                    chatConfig, // mandatory
                    telemetryConfig: { // mandatory for telemetry
                        chatWidgetVersion: OcChatWidgetPkgInfo.version,
                        chatComponentVersion: OcChatComponentPkgInfo.version,
                        OCChatSDKVersion: OcSdkPkginfo.version
                    }
                };

                setLiveChatWidgetProps(liveChatWidgetProps);
            } catch (err) {
                console.error('Failed to initialize chat widget:', err);
                setError(err.message || 'Failed to initialize chat widget');
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, []);

    if (isLoading) {
        return <div>Loading chat widget...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            {liveChatWidgetProps && (
                <ErrorBoundary>
                    <LiveChatWidget {...liveChatWidgetProps} />
                </ErrorBoundary>
            )}
        </div>
    );
};

ReactDOM.render(
    <App />,
    document.getElementById("root")
);