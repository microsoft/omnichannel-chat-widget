import type { Meta, StoryObj } from "@storybook/react";
import ChatInput from "./ChatInput";

const meta: Meta<typeof ChatInput> = {
    title: "Components/ChatInput",
    component: ChatInput,
    parameters: {
        docs: {
            description: {
                component: "A modern ChatInput component with integrated suggestions, RTL support, and file attachments. Wraps Fluent UI Copilot ChatInput with comprehensive customization options."
            }
        }
    },
    argTypes: {
        chatInputProps: {
            description: "Props for the ChatInput component including control, style, and component overrides",
            control: { type: "object" }
        },
        suggestionsProps: {
            description: "Props for the integrated suggestions component",
            control: { type: "object" }
        }
    }
};

export default meta;
type Story = StoryObj<typeof ChatInput>;

// Base props for reusability
const baseControlProps = {
    placeholderValue: "Type a message...",
    disabled: false,
    maxLength: 500,
    charactersRemainingMessage: (remaining: number) => `${remaining} characters remaining`,
    chatInputAriaLabel: "Chat input field"
};

export const Default: Story = {
    args: {
        chatInputProps: {
            controlProps: baseControlProps
        }
    }
};

export const WithCustomPlaceholder: Story = {
    args: {
        chatInputProps: {
            controlProps: {
                ...baseControlProps,
                placeholderValue: "Ask me anything...",
                chatInputAriaLabel: "AI Assistant input"
            }
        }
    }
};

export const Disabled: Story = {
    args: {
        chatInputProps: {
            controlProps: {
                ...baseControlProps,
                disabled: true,
                placeholderValue: "Chat is currently disabled..."
            }
        }
    }
};

export const WithCharacterLimit: Story = {
    args: {
        chatInputProps: {
            controlProps: {
                ...baseControlProps,
                maxLength: 100,
                charactersRemainingMessage: (remaining: number) => 
                    remaining > 0 ? `${remaining} characters left` : "Character limit reached!"
            }
        }
    }
};

export const WithCustomStyling: Story = {
    args: {
        chatInputProps: {
            controlProps: baseControlProps,
            styleProps: {
                containerStyleProps: {
                    backgroundColor: "#f8f9fa",
                    borderRadius: "20px",
                    padding: "12px",
                    border: "2px solid #e9ecef"
                },
                inputContainerStyleProps: {
                    borderRadius: "16px",
                    backgroundColor: "#ffffff"
                },
                inputFieldStyleProps: {
                    fontSize: "16px",
                    color: "#212529",
                    fontFamily: "Segoe UI, system-ui, sans-serif"
                }
            }
        }
    }
};

export const RightToLeft: Story = {
    args: {
        chatInputProps: {
            controlProps: {
                ...baseControlProps,
                placeholderValue: "اكتب رسالة...",
                chatInputAriaLabel: "حقل إدخال الدردشة"
            }
        }
    },
    decorators: [
        (Story) => (
            <div lang="ar" dir="rtl" style={{ textAlign: "right" }}>
                <p>هذا مثال على الدعم التلقائي لاتجاه النص من اليمين إلى اليسار</p>
                <Story />
            </div>
        ),
    ],
};

export const AutoRTLDetection: Story = {
    args: {
        chatInputProps: {
            controlProps: {
                ...baseControlProps,
                placeholderValue: "أدخل رسالتك هنا...",
                charactersRemainingMessage: (remaining: number) => `${remaining} حرف متبقي`
            }
        }
    },
    decorators: [
        (Story) => (
            <div lang="ar">
                <p>This demonstrates automatic RTL detection based on language</p>
                <Story />
            </div>
        ),
    ],
};

export const WithAttachmentButton: Story = {
    args: {
        chatInputProps: {
            controlProps: {
                ...baseControlProps,
                attachmentProps: {
                    showAttachButton: true,
                    attachmentButtonAriaLabel: "Attach files",
                    attachmentAccept: "image/*,.pdf,.doc,.docx,.txt",
                    attachmentMultiple: true,
                    onFilesChange: (files: File[]) => console.log("Files selected:", files),
                    onAttachmentClick: () => console.log("Attachment button clicked")
                }
            }
        }
    }
};

export const WithAttachments: Story = {
    args: {
        chatInputProps: {
            controlProps: {
                ...baseControlProps,
                attachmentProps: {
                    attachmentPreviewItems: [
                        { id: "1", text: "presentation.pdf", progress: 100 },
                        { id: "2", text: "image-large.png", progress: 75 },
                        { id: "3", text: "document.docx", progress: 100 },
                        { id: "4", text: "spreadsheet.xlsx", progress: 100 }
                    ],
                    maxVisibleAttachments: 3,
                    overflowMenuAriaLabel: "View more attachments",
                    onAttachmentRemove: (index: number) => console.log("Remove attachment:", index)
                }
            }
        }
    }
};

export const WithSuggestions: Story = {
    args: {
        chatInputProps: {
            controlProps: baseControlProps
        },
        suggestionsProps: {
            controlProps: {
                suggestions: [
                    { id: "1", text: "How can I help you today?", value: "How can I help you today?" },
                    { id: "2", text: "What's the weather like?", value: "What's the weather like?" },
                    { id: "3", text: "Tell me a joke", value: "Tell me a joke" },
                    { id: "4", text: "Explain quantum computing", value: "Explain quantum computing" }
                ],
                onSuggestionClick: (suggestion) => console.log("Suggestion clicked:", suggestion),
                ariaLabel: "Message suggestions",
                autoHide: true
            },
            styleProps: {
                containerStyleProps: {
                    marginTop: "8px"
                }
            }
        }
    }
};

export const WithCustomSendButton: Story = {
    args: {
        chatInputProps: {
            controlProps: {
                ...baseControlProps,
                sendButtonProps: {
                    "aria-label": "Send message",
                    disabled: false
                }
            }
        }
    }
};

export const CompleteExample: Story = {
    args: {
        chatInputProps: {
            controlProps: {
                ...baseControlProps,
                placeholderValue: "Type your message here...",
                maxLength: 2000,
                onSubmitText: (text: string, attachments: any[]) => {
                    console.log("Message submitted:", { text, attachments });
                    return true; // Return true to clear the input
                },
                onTextChange: (text: string) => console.log("Text changed:", text),
                attachmentProps: {
                    showAttachButton: true,
                    attachmentButtonAriaLabel: "Attach files",
                    attachmentAccept: "*/*",
                    attachmentMultiple: true,
                    attachmentPreviewItems: [
                        { id: "1", text: "example.pdf", progress: 100 }
                    ],
                    onFilesChange: (files: File[]) => console.log("Files:", files),
                    onAttachmentRemove: (index: number) => console.log("Remove:", index)
                },
                sendButtonProps: {
                    "aria-label": "Send your message"
                }
            },
            styleProps: {
                containerStyleProps: {
                    maxWidth: "600px",
                    margin: "0 auto"
                }
            }
        },
        suggestionsProps: {
            controlProps: {
                suggestions: [
                    { id: "1", text: "Quick reply: Thanks!", value: "Thanks!" },
                    { id: "2", text: "I need more information", value: "I need more information" }
                ],
                onSuggestionClick: (suggestion) => console.log("Suggestion:", suggestion),
                ariaLabel: "Quick replies"
            }
        }
    }
};

export const HiddenSendBox: Story = {
    args: {
        chatInputProps: {
            controlProps: {
                ...baseControlProps,
                hideSendBox: true
            }
        }
    }
};
