# CCaaS ChatGPT Widgets

A robust React-TypeScript widget for rendering OpenAI tool output as Adaptive Cards. This widget integrates seamlessly with OpenAI's ChatGPT platform, providing fast, reliable rendering of adaptive cards with comprehensive action handling.

## 🚀 Overview

The CCaaS ChatGPT Widget is designed to:
- **Safely render OpenAI tool output** with validation and error handling
- **Support multiple card types**: Adaptive Cards and Escalation Cards
- **Optimize loading performance** with 50ms polling and 60-second timeout
- **Handle race conditions** ensuring tool output is processed exactly once
- **Provide TypeScript type safety** throughout the codebase
- **Support multiple action types**: OpenUrl, Submit, ShowCard, ToggleVisibility, and Execute

## 📁 Project Structure

```
CCaaS.ChatGptWidgets/
├── src/
│   ├── actions/
│   │   ├── adaptiveCardActions.ts     # Action handlers for standard adaptive cards
│   │   └── escalationCardActions.ts   # Action handlers for escalation cards
│   ├── assets/
│   │   └── styles.css                 # Widget styles
│   ├── components/
│   │   └── AdaptiveCardRenderer.tsx   # Shared renderer for all card types
│   ├── constants/
│   │   └── constants.ts               # Configuration constants and enums
│   ├── types/
│   │   └── index.ts                   # TypeScript type definitions
│   ├── utils/
│   │   └── validation.ts              # Validation utilities
│   ├── index.html                     # HTML template
│   ├── index.tsx                      # Application entry point
│   └── OmnichannelWidget.tsx          # Main widget component
├── webpack.dev.js                     # Development webpack configuration
├── webpack.prod.js                    # Production webpack configuration
├── tsconfig.json                      # TypeScript configuration
├── package.json                       # Project dependencies and scripts
└── README.md                          # This file
```

## 🧩 Components

### **OmnichannelWidget** (`src/OmnichannelWidget.tsx`)
The main widget component that orchestrates the entire card rendering process.

**Key Features:**
- Handles delayed availability of `window.openai`
- Listens for asynchronous OpenAI tool output events
- Polls synchronously for tool output injection (50ms intervals)
- Validates Adaptive Card structure before rendering
- Ensures tool output is processed exactly once (race-safe)
- Cleans up timers and event listeners properly
- Protects against React Strict Mode double-mount behavior

**State Management:**
- `cardJson`: Stores the validated adaptive card JSON
- `payloadType`: Identifies the card type (adaptive-card, escalation-card)
- `error`: Tracks error messages
- `isLoading`: Loading state indicator

### **AdaptiveCardRenderer** (`src/components/AdaptiveCardRenderer.tsx`)
Shared renderer component for all adaptive card types.

**Props:**
- `cardJson`: The adaptive card JSON structure to render
- `actionHandler`: Function to handle card actions (different for each card type)

**Features:**
- Renders adaptive cards using the `adaptivecards` library
- Applies custom host configuration
- Delegates action handling to the provided handler function

## ⚡ Actions

### **Adaptive Card Actions** (`src/actions/adaptiveCardActions.ts`)
Handles actions for standard adaptive cards.

**Supported Action Types:**
- `Action.OpenUrl`: Opens URLs in new tabs
- `Action.Submit`: Logs submission data to console
- `Action.ShowCard`: Expands nested cards
- `Action.ToggleVisibility`: Shows/hides elements
- `Action.Execute`: Executes custom commands

### **Escalation Card Actions** (`src/actions/escalationCardActions.ts`)
Handles actions for escalation-specific cards with custom business logic.

**Features:**
- Same action types as adaptive cards
- Custom escalation-specific handling logic
- Integration with OpenAI window interface

## 🔧 Constants & Configuration

### **Constants** (`src/constants/constants.ts`)

**PayloadType Enum:**
- `ADAPTIVE_CARD`: "adaptive-card"
- `ESCALATION_CARD`: "escalation-card"

**Polling Configuration:**
- `INTERVAL_MS`: 50ms (polling frequency)
- `MAX_TIMEOUT_MS`: 60000ms (60 seconds)
- `MAX_POLL_ATTEMPTS`: 1200 (60s / 50ms)

**Card Types:**
- Defines supported adaptive card versions and types

## 🏗️ Build & Run

### **Installation**

First, install all dependencies:

```bash
npm install
```

### **Development Mode**

Start the development server with hot reloading:

```bash
npm start
```

This will:
- Start webpack dev server on `http://localhost:3000`
- Enable hot module replacement
- Use non-minified code with source maps
- Watch for file changes

Build for development (non-minified):

```bash
npm run build:dev
```

Output: `dist/CCaaSChatGPTWidget.js` (non-minified)

### **Production Mode**

Build for production (minified):

```bash
npm run build
```

Or alternatively:

```bash
npm run build:webpack
```

This will:
- Minify JavaScript with TerserPlugin
- Generate source maps for debugging
- Optimize bundle size
- Output to `dist/CCaaSChatGPTWidget.js` (~610 KiB)

## 📦 Output

**Development Build:**
- Output: `dist/CCaaSChatGPTWidget.js`
- Source maps: `eval-source-map` (inline)
- Size: ~2-3 MB (non-minified)

**Production Build:**
- Output: `dist/CCaaSChatGPTWidget.js`
- Source maps: `CCaaSChatGPTWidget.js.map` (external)
- Size: ~610 KiB (minified)

## 🔌 Integration

### **Embedding the Widget**

Include the built widget in your HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CCaaS ChatGPT Widget</title>
</head>
<body>
  <div id="root"></div>
  
  <!-- Include the widget bundle -->
  <script src="CCaaSChatGPTWidget.js"></script>
</body>
</html>
```

### **OpenAI Integration**

The widget expects the following structure on the `window` object:

```typescript
window.openai = {
  toolOutput: {
    // Your adaptive card JSON
    type: "AdaptiveCard",
    version: "1.5",
    body: [...]
  },
  toolResponseMetadata: {
    payloadType: "adaptive-card" // or "escalation-card"
  }
};
```

### **Event-Based Loading**

Alternatively, dispatch a custom event:

```javascript
window.dispatchEvent(new CustomEvent("openai-tool-output", {
  detail: {
    type: "AdaptiveCard",
    version: "1.5",
    body: [...]
  }
}));
```

## 🛠️ TypeScript

The project uses TypeScript with strict mode enabled.

**Key Type Definitions:**

- `AdaptiveCardJson`: Adaptive card structure
- `ToolResponseMetadata`: Metadata from OpenAI
- `OpenAIWindow`: Extended window interface
- `ActionHandler`: Function type for handling card actions
- `AdaptiveCardRendererProps`: Props for renderer component
- `WidgetState`: Widget state types

## 🧪 Testing

You can test the widget locally by:

1. Creating test data that matches the OpenAI tool output structure
2. Using the development server (`npm start`)
3. Injecting test data via browser console:

```javascript
window.openai = {
  toolOutput: {
    type: "AdaptiveCard",
    version: "1.5",
    body: [
      {
        type: "TextBlock",
        text: "Test Adaptive Card"
      }
    ]
  },
  toolResponseMetadata: {
    payloadType: "adaptive-card"
  }
};
```

## 📝 Dependencies

**Core Dependencies:**
- `react`: ^18.0.0
- `react-dom`: ^18.0.0
- `adaptivecards`: ^2.11.3
- `markdown-it`: via `slack-markdown-it`: ^1.0.5
- `dompurify`: ^3.0.0

**Dev Dependencies:**
- `typescript`: ^5.9.3
- `webpack`: ^5.88.0
- `babel`: ^7.22.0
- `@types/react`: ^19.2.7

## 🚦 Loading Strategy

The widget uses a multi-layered loading strategy for optimal performance:

1. **Immediate Load**: Checks if data is already available
2. **Polling**: Polls every 50ms for up to 60 seconds
3. **Event Listener**: Listens for async OpenAI events
4. **Timeout**: Falls back to error after 60 seconds

## ⚠️ Error Handling

The widget provides comprehensive error handling:
- Invalid or empty output
- Invalid AdaptiveCard structure
- Timeout scenarios
- Processing errors with detailed messages

