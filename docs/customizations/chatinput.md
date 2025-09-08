# ChatInput Component

The ChatInput component is an enhanced text input interface for the Omnichannel Chat Widget, powered by Fluent UI Copilot library. It provides a modern, accessible, and feature-rich chat experience with integrated suggestions and file attachments.

## Overview

The ChatInput component has been updated to use `@fluentui-copilot/react-chat-input` as its foundation, providing:

- Modern text Editor with different modes of appearance
- Character count support
- Integrated file attachment support
- Integrated suggestions system
- Enhanced accessibility
- Customizable styling and theming

## Features

### Core Features
- **Text Editor**: Appearance can be customized with extensive feature support 
- **Suggestions Integration**: Built-in support for suggested actions and responses
- **File Attachments**: Drag-and-drop and click-to-attach file functionality
- **Accessibility**: Full ARIA support and keyboard navigation
- **Theming**: Customizable appearance through Fluent UI Copilot themes
- **Auto-clear**: Automatic editor clearing after successful message submission

### Fluent UI Copilot Integration
The component leverages several Fluent UI Copilot packages:
- `@fluentui-copilot/react-chat-input`: Core chat input functionality
- `@fluentui-copilot/react-provider`: Theme and provider context
- `@fluentui-copilot/react-copilot`: Suggestions and copilot features
- `@fluentui-copilot/react-text-editor`: Lexical editor integration

## Usage

### Basic Implementation

```typescript
import ChatInput from "@microsoft/omnichannel-chat-components";

const chatInputProps = {
  controlProps: {
    onSubmitText: (text: string, attachments?: any[]) => {
      // Handle message submission
      console.log("Message:", text);
      console.log("Attachments:", attachments);
    },
    onTextChange: (text: string) => {
      // Handle text changes
      console.log("Text changed:", text);
    },
    hideSendBox: false,
    chatInputId: "chat-input-1"
  },
  styleProps: {
    containerStyleProps: {
      backgroundColor: "#ffffff",
      border: "1px solid #e0e0e0"
    }
  }
};

const suggestionsProps = {
  controlProps: {
    suggestions: [
      { text: "Hello", value: "greeting" },
      { text: "Help", value: "help" },
      { text: "Contact Support", value: "support" }
    ],
    onSuggestionClick: (suggestion) => {
      console.log("Suggestion clicked:", suggestion);
    }
  }
};

<ChatInput 
  chatInputProps={chatInputProps} 
  suggestionsProps={suggestionsProps} 
/>
```

## Properties

### IChatInputProps

The main props interface for the ChatInput component:

```typescript
interface IChatInputProps {
  controlProps?: IChatInputControlProps;
  styleProps?: IChatInputStyleProps;
  componentOverrides?: IChatInputComponentOverrides;
}
```

### Control Properties

Key control properties include:

- `onSubmitText(text: string, attachments?: any[]): boolean | void` - Handles message submission
- `onTextChange(text: string): void` - Handles text input changes
- `hideSendBox: boolean` - Controls visibility of the input
- `chatInputId: string` - Unique identifier for the input
- `theme: CopilotTheme` - Fluent UI Copilot theme
- `attachmentProps` - File attachment configuration
- `sendButtonProps` - Send button customization

### Attachment Properties

Configure file attachment behavior:

```typescript
interface IAttachmentProps {
  showAttachButton?: boolean;
  onAttachmentClick?: () => void;
  onFilesChange?: (files: File[]) => void;
  onAttachmentRemove?: (attachment: any) => void;
  attachmentAccept?: string;
  attachmentMultiple?: boolean;
  attachmentButtonDisabled?: boolean;
  attachmentButtonAriaLabel?: string;
  attachmentButtonIcon?: ReactNode;
  maxVisibleAttachments?: number;
  dropzoneMaxFiles?: number;
}
```

### Style Properties

Customize the appearance:

```typescript
interface IChatInputStyleProps {
  containerStyleProps?: React.CSSProperties;
  inputContainerStyleProps?: React.CSSProperties;
  dragDropOverlayStyleProps?: React.CSSProperties;
}
```

## Suggestions Component

The Suggestions component displays a list of suggested actions that users can click to quickly input common responses or actions.

### Suggestions Usage

```typescript
const suggestionsProps = {
  controlProps: {
    suggestions: [
      {
        text: "Yes, please",
        value: "confirm",
        type: "imBack"
      },
      {
        text: "No, thanks",
        value: "decline",
        type: "imBack"
      },
      {
        text: "Tell me more",
        value: "more_info",
        type: "postBack"
      }
    ],
    onSuggestionClick: (suggestion) => {
      // Handle suggestion selection
      handleSuggestionClick(suggestion);
    },
    autoHide: true,
    horizontalAlignment: "start"
  },
  styleProps: {
    containerStyleProps: {
      padding: "8px",
      backgroundColor: "#f5f5f5"
    }
  }
};
```

### Suggestion Item Interface

```typescript
interface ISuggestionItem {
  text: string;                    // Button label text
  value?: any;                     // Payload sent on click
  displayText?: string;            // Optional alternate display text
  type?: "imBack" | "postBack" | "messageBack" | "openUrl" | string;
  image?: string;                  // Optional image URL
  imageAlt?: string;               // Alt text for image
  disabled?: boolean;              // Disable the suggestion
  iconName?: string;               // Icon identifier
}
```

### Suggestions Control Properties

```typescript
interface ISuggestionsControlProps {
  suggestions?: ISuggestionItem[];              // Array of suggestion items
  onSuggestionClick?: (suggestion: ISuggestionItem) => void;  // Click handler
  onSuggestionsClear?: () => void;              // Clear handler
  autoHide?: boolean;                           // Auto-hide after selection
  horizontalAlignment?: "start" | "center" | "end";  // Alignment
  disabled?: boolean;                           // Disable all suggestions
  ariaLabel?: string;                          // Accessibility label
  
  // Fluent UI Suggestion props
  mode?: "default" | "filled";
  appearance?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
  shape?: "rounded" | "square";
  iconPosition?: "before" | "after";
  disabledFocusable?: boolean;
}
```

## Advanced Customization

### Component Overrides

You can override default components:

```typescript
const componentOverrides = {
  contentBefore: <CustomAttachmentButton />,
  action: <CustomActionButton />,
  icon: <CustomIcon />
};
```

### Custom Styling

Apply custom CSS styles:

```typescript
const styleProps = {
  containerStyleProps: {
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  inputContainerStyleProps: {
    border: "2px solid #0078d4",
    borderRadius: "20px",
    fontSize: "14px"
  }
};
```

### Theme Integration

Configure Fluent UI Copilot theming:

```typescript
import { CopilotTheme } from "@fluentui-copilot/react-copilot";

const customTheme = {
  ...CopilotTheme,
  colorScheme: "light",
  primaryColor: "#0078d4"
};

const controlProps = {
  theme: customTheme,
  // ... other props
};
```

## Event Handling

### Text Submission

```typescript
const handleSubmitText = (text: string, attachments?: any[]) => {
  if (!text.trim() && !attachments?.length) {
    return false; // Prevent submission
  }
  
  // Process the message
  sendMessage(text, attachments);
  
  // Return true or undefined to clear the input
  // Return false to keep the text
  return true;
};
```

### Suggestion Interaction

```typescript
const handleSuggestionClick = (suggestion: ISuggestionItem) => {
  switch (suggestion.type) {
    case "imBack":
      // Send as regular message
      sendMessage(suggestion.text);
      break;
    case "postBack":
      // Send as postback action
      sendPostback(suggestion.value);
      break;
    case "openUrl":
      // Open URL
      window.open(suggestion.value, "_blank");
      break;
    default:
      sendMessage(suggestion.text);
  }
};
```

## Migration from Legacy ChatInput

When migrating from the previous ChatInput implementation:

1. **Import Changes**: Update imports to use the new component structure
2. **Props Structure**: The props are now structured with `controlProps` and `styleProps`
3. **Suggestions**: Suggestions are now integrated directly rather than being separate
4. **Event Handlers**: Some event handler signatures have changed
5. **Styling**: CSS-in-JS styling approach instead of CSS classes

### Migration Example

**Before:**
```typescript
<ChatInput
  onSubmit={handleSubmit}
  onChange={handleChange}
  placeholder="Type a message..."
  className="custom-chat-input"
/>
```

**After:**
```typescript
<ChatInput
  chatInputProps={{
    controlProps: {
      onSubmitText: handleSubmit,
      onTextChange: handleChange,
      placeholder: "Type a message..."
    },
    styleProps: {
      containerStyleProps: { /* custom styles */ }
    }
  }}
  suggestionsProps={{
    controlProps: {
      suggestions: suggestionItems,
      onSuggestionClick: handleSuggestionClick
    }
  }}
/>
```