import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import ChatInput from "./ChatInput";
import { IChatInputProps } from "./interfaces/IChatInputProps";

const meta: Meta<typeof ChatInput> = {
    title: "Components/ChatInput",
    component: ChatInput,
    parameters: {
        docs: {
            description: {
                component: "A stateless ChatInput component that wraps Fluent UI Copilot ChatInput with customizable props and styling."
            }
        }
    },
    argTypes: {
        controlProps: {
            description: "Control properties for the ChatInput component",
            control: { type: "object" }
        },
        styleProps: {
            description: "Style properties including classNames for the container",
            control: { type: "object" }
        },
        componentOverrides: {
            description: "Component overrides for custom rendering",
            control: { type: "object" }
        }
    }
};

export default meta;
type Story = StoryObj<typeof ChatInput>;

export const Default: Story = {
    args: {
        controlProps: {
            placeholderValue: "Type a message...",
            disabled: false,
            maxLength: 500,
            charactersRemainingMessage: (remaining: number) => `${remaining} characters remaining`
        }
    }
};

export const WithCustomPlaceholder: Story = {
    args: {
        controlProps: {
            placeholderValue: "Ask me anything...",
            disabled: false,
            maxLength: 500,
            charactersRemainingMessage: (remaining: number) => `${remaining} characters remaining`
        }
    }
};

export const Disabled: Story = {
    args: {
        controlProps: {
            placeholderValue: "Type a message...",
            disabled: true,
            maxLength: 500,
            charactersRemainingMessage: (remaining: number) => `${remaining} characters remaining`
        }
    }
};

export const WithCharacterLimit: Story = {
    args: {
        controlProps: {
            placeholderValue: "Type a message...",
            disabled: false,
            maxLength: 100,
            charactersRemainingMessage: (remaining: number) => 
                remaining > 0 ? `${remaining} characters left` : "Character limit reached"
        }
    }
};

export const WithCustomStyling: Story = {
    args: {
        controlProps: {
            placeholderValue: "Type a message...",
            disabled: false,
            maxLength: 500,
            charactersRemainingMessage: (remaining: number) => `${remaining} characters remaining`
        },
        styleProps: {
            containerStyleProps: {
                backgroundColor: "#f0f0f0",
                borderRadius: "20px",
                padding: "10px"
            },
            inputFieldStyleProps: {
                fontSize: "16px",
                color: "#333"
            }
        }
    }
};

export const RightToLeft: Story = {
    args: {
        controlProps: {
            placeholderValue: "اكتب رسالة...",
            disabled: false,
            maxLength: 500,
            charactersRemainingMessage: (remaining: number) => `${remaining} characters remaining`,
            dir: "rtl"
        }
    }
};

export const WithAttachmentButton: Story = {
    args: {
        controlProps: {
            placeholderValue: "Type a message...",
            disabled: false,
            maxLength: 500,
            charactersRemainingMessage: (remaining: number) => `${remaining} characters remaining`,
            attachmentProps: {
                showAttachButton: true,
                attachmentButtonAriaLabel: "Attach files",
                attachmentAccept: "image/*,.pdf,.doc,.docx",
                attachmentMultiple: true
            }
        }
    }
};

export const WithAttachments: Story = {
    args: {
        controlProps: {
            placeholderValue: "Type a message...",
            disabled: false,
            maxLength: 500,
            charactersRemainingMessage: (remaining: number) => `${remaining} characters remaining`,
            attachmentProps: {
                attachmentPreviewItems: [
                    { id: "1", text: "document.pdf" },
                    { id: "2", text: "image.png", progress: 75 },
                    { id: "3", text: "presentation.pptx" }
                ],
                maxVisibleAttachments: 2,
                overflowMenuAriaLabel: "View more attachments"
            }
        }
    }
};

export const WithCustomSendIcon: Story = {
    args: {
        controlProps: {
            placeholder: "Type a message...",
            disabled: false,
            maxLength: 500,
            sendButtonProps: {
                sendIcon: {
                    children: React.createElement("svg", 
                        { width: "16", height: "16", viewBox: "0 0 16 16", fill: "currentColor" },
                        React.createElement("path", { d: "M8.5 1a.5.5 0 0 0-1 0v2.5L5.75 5.25a.75.75 0 0 0 0 1.06L7.5 8.06V12a.5.5 0 0 0 1 0V8.06l1.75-1.75a.75.75 0 0 0 0-1.06L8.5 3.5V1Z" }),
                        React.createElement("path", { d: "M3 10.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5Z" })
                    )
                }
            }
        }
    }
};
