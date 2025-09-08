# CitationPane Component - Comprehensive Customization Guide

The `CitationPane` is a versatile, reusable stateless component from `@microsoft/omnichannel-chat-components` designed to display citation content within chat applications. This component provides extensive customization options for styling, behavior, and component overrides.

## Overview

The CitationPane component allows you to display HTML content in a modal-like pane with both top and bottom close buttons, customizable styling, RTL support, and complete component override capabilities.

## Props Interface

### ICitationPaneControlProps

Controls the behavior and content of the citation pane:

```typescript
interface ICitationPaneControlProps {
    id?: string;                                    // DOM id for the pane (default: "ocw-citation-pane")
    dir?: "ltr" | "rtl" | "auto";                  // Text direction support
    hideCitationPane?: boolean;                     // Hide the entire pane
    hideTitle?: boolean;                           // Hide the title section
    titleText?: string;                            // Title text displayed in header
    contentHtml?: string;                          // HTML content (uses dangerouslySetInnerHTML)
    hideCloseButton?: boolean;                     // Hide the bottom close button
    closeButtonText?: string;                      // Text for bottom close button
    closeButtonAriaLabel?: string;                 // Accessibility label for bottom close button
    hideTopCloseButton?: boolean;                  // Hide the top-right X button
    topCloseButtonAriaLabel?: string;              // Accessibility label for top close button
    topCloseButtonPosition?: "topLeft" | "topRight"; // Position of top close button
    brightnessValueOnDim?: string;                 // Brightness value for dim overlay (e.g., "0.2")
    onClose?: () => void;                          // Callback when any close button is clicked
}
```

### ICitationPaneStyleProps

Comprehensive styling options for all visual elements:

```typescript
interface ICitationPaneStyleProps {
    generalStyleProps?: IStyle;        // Container/wrapper styles
    titleStyleProps?: IStyle;          // Title text styles
    contentStyleProps?: IStyle;        // Content area styles
    closeButtonStyleProps?: IStyle;    // Bottom close button styles
    topCloseButtonStyleProps?: IStyle; // Top close button (X) styles
    classNames?: ICitationPaneClassNames; // CSS class name overrides
}
```

### Component Overrides

Completely replace default components with custom React elements:

```typescript
interface ICitationPaneComponentOverrides {
    title?: string;           // Custom title component (encoded string)
    closeButton?: string;     // Custom bottom close button (encoded string)
    topCloseButton?: string;  // Custom top close button (encoded string)
}
```

## Basic Usage Examples

### 1. Simple Citation Pane

```tsx
import { CitationPane } from "@microsoft/omnichannel-chat-components";

<CitationPane 
    controlProps={{
        id: "simple-citation",
        titleText: "Reference",
        contentHtml: "<p>This is a basic citation with default styling.</p>",
        onClose: () => console.log('Citation closed')
    }}
/>
```

### 2. Citation Without Title

```tsx
<CitationPane 
    controlProps={{
        hideTitle: true,
        contentHtml: "<p><strong>Quick Reference:</strong> User Guide Section 4.2</p>",
        closeButtonText: "Got it"
    }}
/>
```

### 3. Top Close Button Only

```tsx
<CitationPane 
    controlProps={{
        hideCloseButton: true,  // Hide bottom button
        titleText: "Important Notice",
        contentHtml: "<p>Use only the X button to close this citation.</p>"
    }}
/>
```

## Advanced Styling Examples

### 4. Research Paper Style

```tsx
<CitationPane 
    controlProps={{
        titleText: "Research Citation",
        contentHtml: `
            <blockquote style="border-left: 3px solid #0078d4; padding-left: 15px; font-style: italic;">
                "AI has revolutionized modern software development approaches."
            </blockquote>
            <div style="background: #f3f2f1; padding: 10px; border-radius: 4px;">
                <strong>Citation:</strong> Dr. Sarah Johnson, AI Development Quarterly, 2024
            </div>
        `,
        closeButtonText: "Close Citation"
    }}
    styleProps={{
        generalStyleProps: {
            backgroundColor: "#ffffff",
            border: "1px solid #e1dfdd",
            borderRadius: "8px",
            boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.1)",
            padding: "20px",
            paddingTop: "45px",
            width: "500px"
        },
        titleStyleProps: {
            fontSize: "18px",
            fontWeight: "600",
            color: "#0078d4",
            borderBottom: "1px solid #edebe9",
            paddingBottom: "8px",
            marginBottom: "16px"
        },
        closeButtonStyleProps: {
            backgroundColor: "#0078d4",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "10px 20px"
        }
    }}
/>
```

### 5. Compact Mobile-Friendly Style

```tsx
<CitationPane 
    controlProps={{
        titleText: "Quick Reference",
        contentHtml: "<p><strong>Source:</strong> User Guide Section 4.2</p>",
        closeButtonText: "Got it"
    }}
    styleProps={{
        generalStyleProps: {
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "6px",
            padding: "16px",
            paddingTop: "35px",
            width: "300px"
        },
        titleStyleProps: {
            fontSize: "14px",
            fontWeight: "500",
            color: "#495057",
            marginBottom: "8px"
        },
        contentStyleProps: {
            fontSize: "13px",
            marginBottom: "12px"
        },
        closeButtonStyleProps: {
            fontSize: "12px",
            padding: "6px 12px",
            minHeight: "28px"
        }
    }}
/>
```

### 6. Warning/Alert Style

```tsx
<CitationPane 
    controlProps={{
        titleText: "Important Notice",
        contentHtml: `
            <p>This citation requires acknowledgment before proceeding.</p>
            <ul>
                <li>Forced acknowledgment scenario</li>
                <li>Critical information display</li>
            </ul>
        `,
        closeButtonText: "Acknowledge & Close",
        hideTopCloseButton: true  // Force bottom button usage
    }}
    styleProps={{
        generalStyleProps: {
            backgroundColor: "#fff3e0",
            border: "2px solid #ff9800",
            borderRadius: "8px",
            padding: "20px",
            width: "380px"
        },
        titleStyleProps: {
            color: "#f57c00",
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "12px"
        },
        closeButtonStyleProps: {
            backgroundColor: "#ff9800",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "10px 20px",
            fontWeight: "500"
        }
    }}
/>
```

## Custom Component Overrides

### 7. Custom Header and Buttons

```tsx
import { encodeComponentString } from "@microsoft/omnichannel-chat-components";

// Custom gradient title
const customTitle = encodeComponentString(
    <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "12px",
        borderRadius: "6px",
        textAlign: "center",
        fontWeight: "bold",
        marginBottom: "16px"
    }}>
        📚 Custom Citation Header
    </div>
);

// Custom styled close button
const customCloseButton = encodeComponentString(
    <button style={{
        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        color: "white",
        border: "none",
        borderRadius: "20px",
        padding: "10px 20px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "14px",
        boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.2)"
    }}>
        ✨ Close Citation
    </button>
);

// Custom top close button
const customTopCloseButton = encodeComponentString(
    <button style={{
        position: "absolute",
        top: "8px",
        right: "8px",
        backgroundColor: "#ffffff",
        border: "1px solid #d2d0ce",
        borderRadius: "50%",
        width: "28px",
        height: "28px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
        color: "#605e5c",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)"
    }}>
        ×
    </button>
);

<CitationPane 
    controlProps={{
        contentHtml: `
            <div style="text-align: center; padding: 10px;">
                <p>This citation demonstrates custom component overrides.</p>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 6px;">
                    <strong>Custom Elements:</strong>
                    <ul style="text-align: left; margin-top: 8px;">
                        <li>Gradient title header</li>
                        <li>Styled close button with emoji</li>
                        <li>Custom circular top close button</li>
                    </ul>
                </div>
            </div>
        `
    }}
    styleProps={{
        generalStyleProps: {
            backgroundColor: "#ffffff",
            border: "2px solid #e2e8f0",
            borderRadius: "12px",
            padding: "20px",
            paddingTop: "40px",
            width: "400px"
        }
    }}
    componentOverrides={{
        title: customTitle,
        closeButton: customCloseButton,
        topCloseButton: customTopCloseButton
    }}
/>
```

## RTL (Right-to-Left) Language Support

### 8. Arabic Language Example

```tsx
<CitationPane 
    controlProps={{
        dir: "rtl",
        titleText: "مرجع الاقتباس",
        contentHtml: `
            <div dir="rtl" style="text-align: right;">
                <p>هذا مثال على جزء الاقتباس مع دعم اللغة العربية.</p>
                <p><strong>المصدر:</strong> دليل المطور - الإصدار 2024</p>
                <p><strong>القسم:</strong> واجهات المستخدم المتعددة اللغات</p>
            </div>
        `,
        closeButtonText: "إغلاق",
        topCloseButtonPosition: "topLeft"  // Top close button on left for RTL
    }}
    styleProps={{
        generalStyleProps: {
            backgroundColor: "#ffffff",
            border: "1px solid #d2d0ce",
            borderRadius: "8px",
            padding: "20px",
            paddingTop: "40px",
            width: "400px",
            fontFamily: "Tahoma, Arial, sans-serif"
        },
        titleStyleProps: {
            fontSize: "16px",
            fontWeight: "600",
            textAlign: "right",
            marginBottom: "12px"
        },
        contentStyleProps: {
            lineHeight: "1.6",
            marginBottom: "16px"
        }
    }}
/>
```

## Interactive Features

### 9. Dynamic Close Button Position

```tsx
const [position, setPosition] = useState<"topLeft" | "topRight">("topRight");

const togglePosition = () => {
    setPosition(prev => prev === "topRight" ? "topLeft" : "topRight");
};

<CitationPane 
    controlProps={{
        titleText: `Top Close Button (${position === "topRight" ? "Right" : "Left"} Position)`,
        contentHtml: `
            <p>This demo shows dynamic top close button positioning.</p>
            <p><strong>Current position:</strong> ${position}</p>
            <p>Click "Toggle Position" to switch between positions.</p>
        `,
        closeButtonText: "Toggle Position",
        topCloseButtonPosition: position,
        onClose: togglePosition
    }}
    styleProps={{
        generalStyleProps: {
            backgroundColor: "#e3f2fd",
            border: "2px solid #2196f3",
            borderRadius: "8px",
            padding: "20px",
            paddingTop: "40px",
            width: "400px"
        },
        titleStyleProps: {
            color: "#1976d2",
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "12px"
        }
    }}
/>
```

## Large Content Handling

The CitationPane component now includes built-in support for long content with automatic scrolling. The default styles include:

- **Maximum height constraint**: `maxHeight: "80vh"` prevents the pane from becoming too tall
- **Automatic scrolling**: Content area includes `overflow: "auto"` for scrollable content
- **Flexible layout**: Uses flexbox to ensure proper positioning of title and close button

### 10. Default Long Content Behavior

```tsx
// With the updated default styles, long content automatically becomes scrollable
<CitationPane 
    controlProps={{
        titleText: "Long Document",
        contentHtml: `
            <div>
                <h4>Chapter 1</h4>
                <p>Very long content that will automatically scroll...</p>
                <!-- More content -->
            </div>
        `,
        closeButtonText: "Close"
    }}
    // No additional styling needed - scrolling works out of the box!
/>
```

### 11. Custom Height Constraints

For specific height requirements, you can override the default behavior:

```tsx
<CitationPane 
    controlProps={{
        titleText: "Custom Height Document",
        contentHtml: `<!-- Your long content -->`,
        closeButtonText: "Close Paper"
    }}
    styleProps={{
        generalStyleProps: {
            maxHeight: "600px",  // Custom maximum height
            width: "500px"
        },
        contentStyleProps: {
            maxHeight: "400px",  // Specific content area height
            overflowY: "scroll"  // Force scrollbar to always show
        }
    }}
/>
```

### 12. Testing Extremely Long Content

For testing purposes, the Storybook includes an `ExtremelyLongContent` story that demonstrates proper scrolling behavior with extensive text content, ensuring the pane remains within reasonable bounds while maintaining full content accessibility.

## Best Practices and Tips

### Scrolling and Height Management

1. **Default behavior**: The component now handles long content automatically with `maxHeight: "80vh"` and `overflow: "auto"`
2. **Custom constraints**: Override `maxHeight` in `generalStyleProps` for specific requirements
3. **Content-specific scrolling**: Use `contentStyleProps` to control just the content area scrolling behavior

### Accessibility Considerations

1. **Always provide aria labels** for close buttons:
   ```tsx
   controlProps={{
       closeButtonAriaLabel: "Close citation dialog",
       topCloseButtonAriaLabel: "Close citation"
   }}
   ```

2. **Use semantic HTML** in content:
   ```tsx
   contentHtml: `
       <article>
           <header><h4>Citation Title</h4></header>
           <main><p>Citation content...</p></main>
       </article>
   `
   ```

3. **Support keyboard navigation** with proper focus management.

### Security Considerations

⚠️ **Important Security Note**: The `contentHtml` prop uses `dangerouslySetInnerHTML`. Always sanitize content from untrusted sources:

```tsx
import DOMPurify from 'dompurify';

const sanitizedContent = DOMPurify.sanitize(userProvidedHTML);

<CitationPane 
    controlProps={{
        contentHtml: sanitizedContent
    }}
/>
```

### Performance Optimization

1. **Lazy load large content** when possible
2. **Use CSS containment** for better rendering performance:
   ```tsx
   generalStyleProps: {
       contain: "layout style paint"
   }
   ```

3. **Optimize custom components** by memoizing heavy calculations

### Mobile Responsiveness

```tsx
// Mobile-optimized example
styleProps={{
    generalStyleProps: {
        width: "calc(100vw - 32px)",  // Responsive width
        maxWidth: "400px",
        margin: "16px",
        '@media (max-width: 480px)': {
            padding: "12px",
            paddingTop: "35px"
        }
    }
}}
```

## Integration with Chat Widget

When using with the stateful `LiveChatWidget`, pass props through the `citationPaneProps` configuration:

```tsx
<LiveChatWidget 
    citationPaneProps={{
        controlProps: {
            titleText: "Research Citation",
            closeButtonText: "Close"
        },
        styleProps: {
            generalStyleProps: {
                backgroundColor: "#f8f9fa"
            }
        }
    }}
/>
```

## Storybook Examples

Explore all these examples and more in the Storybook:
- **PureDefault**: Basic component with default styling
- **ResearchCitation**: Academic citation with enhanced styling  
- **CompactCitation**: Mobile-optimized compact version
- **TopClosePositions**: Interactive position switching
- **HiddenCloseOptions**: Various close button configurations
- **CustomComponents**: Complete component overrides
- **RTLSupport**: Right-to-left language support
- **LargeContent**: Scrollable content handling with custom styles
- **ExtremelyLongContent**: Tests default scrolling behavior with very long text

Each story demonstrates different aspects of the component's flexibility and can serve as implementation templates for your specific use cases.

---

*This documentation covers the comprehensive customization capabilities of the CitationPane component. For additional examples and live demonstrations, refer to the component's Storybook stories.*
