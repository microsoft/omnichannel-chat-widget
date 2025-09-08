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
    title?: React.ReactNode | string;           // Custom title component (React element or string)
    closeButton?: React.ReactNode | string;     // Custom bottom close button (React element or string)
    topCloseButton?: React.ReactNode | string;  // Custom top close button (React element or string)
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

## Accessibility and Scaling Support

The CitationPane component supports comprehensive browser zoom scaling from 50% to 400% view size, ensuring accessibility compliance and optimal user experience across different zoom levels. This is particularly important when the component is contained within other components that may apply additional scaling.

### Scaling Implementation

As of the latest version, the component has been fully converted to use scalable `em` units instead of fixed `px` values for all dimensional properties:

#### Core Scaling Features:
- **Container dimensions**: All padding, margins, and positioning use `em` units
- **Font sizes**: Scale proportionally with browser zoom and parent font context
- **Button dimensions**: Both top and bottom close buttons scale appropriately
- **Content area**: Scrollable content maintains proper proportions at all zoom levels
- **Maximum height**: Changed from viewport-relative (`80vh`) to container-relative (`30em`) for better scaling

#### Detailed Conversion:
- **General container**: `padding: "1em"`, `paddingTop: "2.5em"`, `maxHeight: "30em"`
- **Close buttons**: `minHeight: "2em"`, `padding: "0.5em 1em"`
- **Top close button**: `width: "2em"`, `height: "2em"`, positioned with `top: "0.5em"`
- **Content area**: Uses relative units for font sizing and spacing

### ⚠️ Critical: Width Property and Scaling

**IMPORTANT**: Setting any explicit `width` property in `generalStyleProps` will break the component's natural scaling behavior:

```tsx
// ❌ BREAKS SCALING - Any explicit width prevents natural scaling
styleProps={{
    generalStyleProps: {
        width: "400px",    // Fixed width breaks zoom scaling
        width: "25em",     // Even em units break natural container adaptation
        width: "100%",     // Percentage widths may work but limit flexibility
    }
}}

// ✅ PRESERVES SCALING - Let the component adapt naturally
styleProps={{
    generalStyleProps: {
        // No width property = component adapts to container and scales with zoom
        maxWidth: "31.25em",  // Optional: set maximum width if needed
        minWidth: "18.75em",  // Optional: set minimum width if needed
    }
}}
```

### Best Practices for Scaling

When customizing styles, use `em` units to maintain scaling compatibility:

```tsx
// ✅ Good - Uses scalable units that work with zoom and container scaling
styleProps={{
    generalStyleProps: {
        padding: "1.25em",      // Scales with font context and zoom
        fontSize: "1em",        // Base font size relative to parent
        borderRadius: "0.5em",  // Proportional to font size
        maxHeight: "25em",      // Container-relative height
        maxWidth: "31.25em"     // Optional: maximum width constraint
    },
    titleStyleProps: {
        fontSize: "1.125em",    // 18px equivalent at 16px base
        marginBottom: "0.75em"  // 12px equivalent at 16px base
    },
    topCloseButtonStyleProps: {
        width: "2em",           // Square button that scales
        height: "2em",
        top: "0.5em",          // Consistent positioning
        right: "0.5em"
    }
}}

// ❌ Avoid - Fixed pixel values don't scale and break when contained
styleProps={{
    generalStyleProps: {
        padding: "20px",        // Fixed at all zoom levels
        fontSize: "16px",       // Won't scale with browser zoom or parent context
        borderRadius: "8px",    // Fixed radius
        maxHeight: "80vh"       // Viewport-relative, doesn't work well in containers
    }
}}
```

### Scaling Verification

Test your customizations at different zoom levels and container contexts:

1. **50% zoom**: Ensure content remains readable and buttons are accessible
2. **100% zoom**: Standard view should look optimal
3. **200% zoom**: Common accessibility requirement for vision assistance
4. **400% zoom**: Maximum zoom level for accessibility compliance
5. **Container scaling**: Test when CitationPane is nested within components that apply their own scaling

### Storybook Scaling Examples

All Storybook examples now demonstrate proper scaling behavior:

- **PureDefault**: Shows baseline scaling behavior with default styles
- **ResearchCitation**: Academic citation with scalable enhanced styling
- **CompactCitation**: Mobile-optimized with proportional scaling
- **ExtremelyLongContent**: Tests scrolling behavior at different zoom levels
- **CustomComponents**: Demonstrates scaling with component overrides

Each story maintains proper proportions and usability across the full 50%-400% zoom range.

### Width Control Without Breaking Scaling

If you need to control the component width while preserving scaling:

```tsx
// ✅ Method 1: Use container wrapper with width control
<div style={{ width: "400px", maxWidth: "100%" }}>
    <CitationPane 
        controlProps={{ /* your props */ }}
        styleProps={{
            generalStyleProps: {
                // No width specified - adapts to container
            }
        }}
    />
</div>

// ✅ Method 2: Use maxWidth/minWidth constraints
styleProps={{
    generalStyleProps: {
        maxWidth: "25em",     // Equivalent to ~400px at 16px base
        minWidth: "18.75em",  // Equivalent to ~300px at 16px base
        margin: "0 auto"      // Center if constrained
    }
}}

// ✅ Method 3: Use CSS Grid or Flexbox for layout control
// Parent container controls sizing, CitationPane adapts
<div style={{ 
    display: "grid", 
    gridTemplateColumns: "400px", 
    justifyContent: "center" 
}}>
    <CitationPane />
</div>
```

## Advanced Styling Examples

### 4. Research Paper Style

```tsx
<CitationPane 
    controlProps={{
        titleText: "Research Citation",
        contentHtml: `
            <blockquote style="border-left: 0.1875em solid #0078d4; padding-left: 0.9375em; font-style: italic;">
                "AI has revolutionized modern software development approaches."
            </blockquote>
            <div style="background: #f3f2f1; padding: 0.625em; border-radius: 0.25em;">
                <strong>Citation:</strong> Dr. Sarah Johnson, AI Development Quarterly, 2024
            </div>
        `,
        closeButtonText: "Close Citation"
    }}
    styleProps={{
        generalStyleProps: {
            backgroundColor: "#ffffff",
            border: "1px solid #e1dfdd",
            borderRadius: "0.5em",
            boxShadow: "0px 0.25em 1em rgba(0, 0, 0, 0.1)",
            padding: "1.25em",
            paddingTop: "2.8125em"
            // No width specified - allows natural scaling
        },
        titleStyleProps: {
            fontSize: "1.125em",
            fontWeight: "600",
            color: "#0078d4",
            borderBottom: "1px solid #edebe9",
            paddingBottom: "0.5em",
            marginBottom: "1em"
        },
        closeButtonStyleProps: {
            backgroundColor: "#0078d4",
            color: "white",
            border: "none",
            borderRadius: "0.25em",
            padding: "0.625em 1.25em"
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
            borderRadius: "0.375em",
            padding: "1em",
            paddingTop: "2.1875em",
            maxWidth: "18.75em"  // Use maxWidth instead of width for flexible scaling
        },
        titleStyleProps: {
            fontSize: "0.875em",
            fontWeight: "500",
            color: "#495057",
            marginBottom: "0.5em"
        },
        contentStyleProps: {
            fontSize: "0.8125em",
            marginBottom: "0.75em"
        },
        closeButtonStyleProps: {
            fontSize: "0.75em",
            padding: "0.375em 0.75em",
            minHeight: "1.75em"
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
            borderRadius: "0.5em",
            padding: "1.25em",
            maxWidth: "23.75em"  // Use maxWidth for flexible scaling
        },
        titleStyleProps: {
            color: "#f57c00",
            fontSize: "1em",
            fontWeight: "600",
            marginBottom: "0.75em"
        },
        closeButtonStyleProps: {
            backgroundColor: "#ff9800",
            color: "white",
            border: "none",
            borderRadius: "0.25em",
            padding: "0.625em 1.25em",
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
        padding: "0.75em",
        borderRadius: "0.375em",
        textAlign: "center",
        fontWeight: "bold",
        marginBottom: "1em"
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
        borderRadius: "1.25em",
        padding: "0.625em 1.25em",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "0.875em",
        boxShadow: "0px 0.1875em 0.375em rgba(0, 0, 0, 0.2)"
    }}>
        ✨ Close Citation
    </button>
);

// Custom top close button
const customTopCloseButton = encodeComponentString(
    <button style={{
        position: "absolute",
        top: "0.5em",
        right: "0.5em",
        backgroundColor: "#ffffff",
        border: "1px solid #d2d0ce",
        borderRadius: "50%",
        width: "1.75em",
        height: "1.75em",
        cursor: "pointer",
        fontSize: "1em",
        fontWeight: "bold",
        color: "#605e5c",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0px 0.0625em 0.1875em rgba(0, 0, 0, 0.1)"
    }}>
        ×
    </button>
);

<CitationPane 
    controlProps={{
        contentHtml: `
            <div style="text-align: center; padding: 0.625em;">
                <p>This citation demonstrates custom component overrides.</p>
                <div style="background: #f8f9fa; padding: 0.75em; border-radius: 0.375em;">
                    <strong>Custom Elements:</strong>
                    <ul style="text-align: left; margin-top: 0.5em;">
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
            borderRadius: "0.75em",
            padding: "1.25em",
            paddingTop: "2.5em"
            // No width specified - allows natural scaling with custom components
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
            borderRadius: "0.5em",
            padding: "1.25em",
            paddingTop: "2.5em",
            fontFamily: "Tahoma, Arial, sans-serif"
            // No width specified - allows natural RTL scaling
        },
        titleStyleProps: {
            fontSize: "1em",
            fontWeight: "600",
            textAlign: "right",
            marginBottom: "0.75em"
        },
        contentStyleProps: {
            lineHeight: "1.6",
            marginBottom: "1em"
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
            borderRadius: "0.5em",
            padding: "1.25em",
            paddingTop: "2.5em"
            // No width specified - allows natural scaling for dynamic positioning
        },
        titleStyleProps: {
            color: "#1976d2",
            fontSize: "1em",
            fontWeight: "600",
            marginBottom: "0.75em"
        }
    }}
/>
```

## Large Content Handling

The CitationPane component now includes built-in support for long content with automatic scrolling. The default styles include:

- **Maximum height constraint**: `maxHeight: "30em"` prevents the pane from becoming too tall
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
            maxHeight: "37.5em",  // Custom maximum height (600px equivalent)
            width: "31.25em"      // Scalable width (500px equivalent)
        },
        contentStyleProps: {
            maxHeight: "25em",    // Specific content area height (400px equivalent)
            overflowY: "scroll"   // Force scrollbar to always show
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
// Mobile-optimized example with scalable units
styleProps={{
    generalStyleProps: {
        width: "calc(100vw - 2em)",  // Responsive width with scalable margins
        maxWidth: "25em",            // Scalable maximum width
        margin: "1em",               // Scalable margin
        '@media (max-width: 480px)': {
            padding: "0.75em",       // Scalable mobile padding
            paddingTop: "2.1875em"   // Scalable mobile top padding
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

## ✅ Documentation Accuracy Note

All examples in this documentation have been updated to follow the scaling best practices:

- **Width properties removed**: Examples no longer specify explicit `width` values to preserve natural scaling
- **maxWidth used where appropriate**: When size constraints are needed, `maxWidth` is used instead of `width`
- **Scalable units throughout**: All dimensional values use `em` units for proper zoom scaling
- **Container-based sizing**: Components adapt naturally to their container size

These changes ensure that all documented examples will work correctly with browser zoom from 50% to 400% and when contained within other scaled components.

---

*This documentation covers the comprehensive customization capabilities of the CitationPane component. For additional examples and live demonstrations, refer to the component's Storybook stories.*