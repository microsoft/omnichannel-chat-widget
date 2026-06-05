# omnichannel-chat-widget - Claude Code Instructions

## Repository Ecosystem

**This workspace may contain up to 6 related repositories.** Not all teams have all repos. Always be aware of which repository you're in when making changes.

| Repository | Type | Purpose | Typical Location |
|------------|------|---------|------------------|
| **CRM.Omnichannel** | Monorepo (Backend) | 20+ microservices for Omnichannel platform | `<workspace-root>/CRM.Omnichannel/` |
| **ConversationControl** | Frontend (Agent UI) | Agent experience and conversation management UI | `<workspace-root>/CRM.OmniChannel.ConversationControl/` |
| **LiveChatWidget** | Frontend (Customer) | Customer-facing chat widget | `<workspace-root>/CRM.OmniChannel.LiveChatWidget/` |
| **omnichannel-chat-sdk** | Public SDK | TypeScript SDK for chat integration | `<workspace-root>/omnichannel-chat-sdk/` |
| **omnichannel-chat-widget** | Public Components | React component library | `<workspace-root>/omnichannel-chat-widget/` |
| **omnichannel-amsclient** | Shared Library | File upload/download client | `<workspace-root>/omnichannel-amsclient/` |

---

## Quick Context
- **Purpose:** Shared React component library for building chat widgets
- **Type:** TypeScript/React Library (npm package)
- **Tech Stack:** TypeScript, React 17+, Rollup, Jest, Storybook
- **Distribution:** npm registry (@microsoft/omnichannel-chat-widget)
- **Consumers:** CRM.OmniChannel.LiveChatWidget, external customers

## Architecture Overview

**What is omnichannel-chat-widget?**

This is a React component library providing pre-built, customizable UI components for chat experiences. It includes message bubbles, input boxes, file attachments, typing indicators, and more. Components are theme-able and accessible (ARIA support).

**Key Features:**
- Pre-built React chat components
- Theme customization support
- Accessibility (ARIA attributes, keyboard navigation)
- TypeScript type definitions
- Storybook for component preview

**Monorepo Structure:**

This repo contains **2 npm packages**:
- **chat-components** - Base components (buttons, icons, primitives)
- **chat-widget** - Higher-level chat-specific components

**Integration:**
- **Peer dependency:** `omnichannel-chat-sdk` (for chat operations)
- **Peer dependency:** `react` and `react-dom` (17+ recommended)
- **Consumed by:** LiveChatWidget, external customers building custom widgets

---

## Build & Test Workflow

### Prerequisites
- Node.js (version in package.json engines)
- npm package manager

### Setup
```bash
cd omnichannel-chat-widget

# Install dependencies (both packages)
npm install
```

### Common Commands

**Build:**
- **Build all packages:** `npm run build` - Build both chat-components and chat-widget
- **Build specific package:**
  - `npm run build:chat-components`
  - `npm run build:chat-widget`
- **Watch mode:** `npm run watch` - Incremental development

**Test:**
- **Unit tests:** `npm test` - Jest tests for all packages
- **Test specific package:**
  - `npm run test:chat-components`
  - `npm run test:chat-widget`
- **Coverage:** `npm run coverage` - Test coverage report
- **Lint:** `npm run lint` - ESLint validation

**Storybook:**
- **Start Storybook:** `npm run storybook` - Component preview at localhost:6006
- **Build Storybook:** `npm run build-storybook` - Static site for deployment

**Release:**
- **Publish:** `npm run publish:packages` - Publish both packages to npm
- **Version bump:** Use lerna or npm workspaces for versioning

---

## Coding Standards

### TypeScript Best Practices

- **Avoid `any` type** - Use proper React prop types
- **Explicit prop types** - Use interfaces for component props
- **React Hooks** - Prefer functional components with hooks
- **Accessibility** - Always include ARIA attributes

**Example Component:**
```typescript
// ✅ CORRECT - Explicit prop types, accessibility
import React from 'react';

export interface MessageBubbleProps {
    message: string;
    sender: 'agent' | 'customer';
    timestamp: Date;
    onRetry?: () => void;
    className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    sender,
    timestamp,
    onRetry,
    className
}) => {
    return (
        <div
            className={`message-bubble ${sender} ${className || ''}`}
            role="article"
            aria-label={`Message from ${sender} at ${timestamp.toLocaleTimeString()}`}
        >
            <div className="message-content">{message}</div>
            <div className="message-timestamp" aria-hidden="true">
                {timestamp.toLocaleTimeString()}
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    aria-label="Retry sending message"
                >
                    Retry
                </button>
            )}
        </div>
    );
};
```

### Component Structure

**File organization:**
```
chat-widget/src/
├── components/
│   ├── MessageBubble/
│   │   ├── MessageBubble.tsx       # Component implementation
│   │   ├── MessageBubble.test.tsx  # Jest tests
│   │   ├── MessageBubble.stories.tsx # Storybook stories
│   │   └── index.ts                # Exports
│   └── ...
├── hooks/                          # Custom React hooks
├── utils/                          # Utility functions
└── index.ts                        # Package exports
```

**Naming conventions:**
- **Components:** PascalCase (e.g., `MessageBubble`, `InputBox`)
- **Props interfaces:** `ComponentNameProps` (e.g., `MessageBubbleProps`)
- **Files:** Match component name (e.g., `MessageBubble.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useTypingIndicator`)

---

## Testing Strategy

**Unit Tests (Jest + React Testing Library):**
- **Location:** `<ComponentName>.test.tsx` files
- **Run:** `npm test`
- **Coverage target:** >80% for components

**Test Best Practices:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MessageBubble } from './MessageBubble';

describe('MessageBubble', () => {
    it('should render message content', () => {
        render(
            <MessageBubble
                message="Hello world"
                sender="customer"
                timestamp={new Date('2024-01-01T12:00:00')}
            />
        );

        expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('should call onRetry when retry button clicked', () => {
        const onRetry = jest.fn();
        render(
            <MessageBubble
                message="Failed message"
                sender="customer"
                timestamp={new Date()}
                onRetry={onRetry}
            />
        );

        fireEvent.click(screen.getByLabelText('Retry sending message'));
        expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should have correct ARIA attributes', () => {
        render(
            <MessageBubble
                message="Test"
                sender="agent"
                timestamp={new Date()}
            />
        );

        const bubble = screen.getByRole('article');
        expect(bubble).toHaveAttribute('aria-label');
    });
});
```

**Storybook Stories:**
- **Location:** `<ComponentName>.stories.tsx` files
- **Purpose:** Visual testing, component documentation, design review

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { MessageBubble } from './MessageBubble';

const meta: Meta<typeof MessageBubble> = {
    title: 'Components/MessageBubble',
    component: MessageBubble,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MessageBubble>;

export const CustomerMessage: Story = {
    args: {
        message: 'Hello, I need help with my order',
        sender: 'customer',
        timestamp: new Date(),
    },
};

export const AgentMessage: Story = {
    args: {
        message: 'Sure, I can help you with that!',
        sender: 'agent',
        timestamp: new Date(),
    },
};

export const WithRetry: Story = {
    args: {
        message: 'Failed to send',
        sender: 'customer',
        timestamp: new Date(),
        onRetry: () => console.log('Retry clicked'),
    },
};
```

---

## Theme Customization

**Components should support theme customization:**

```typescript
// Theme interface
export interface ChatWidgetTheme {
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    backgroundColor: string;
    fontFamily: string;
    borderRadius: string;
}

// Theme context
import React, { createContext, useContext } from 'react';

const ThemeContext = createContext<ChatWidgetTheme | undefined>(undefined);

export const useTheme = () => {
    const theme = useContext(ThemeContext);
    if (!theme) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return theme;
};

// Component using theme
export const ThemedButton: React.FC<ButtonProps> = ({ children, ...props }) => {
    const theme = useTheme();
    return (
        <button
            style={{
                backgroundColor: theme.primaryColor,
                color: theme.textColor,
                borderRadius: theme.borderRadius,
                fontFamily: theme.fontFamily,
            }}
            {...props}
        >
            {children}
        </button>
    );
};
```

---

## Accessibility Requirements

**All components MUST be accessible:**

1. **Semantic HTML:** Use appropriate elements (`<button>`, `<input>`, etc.)
2. **ARIA attributes:** Add `role`, `aria-label`, `aria-describedby` where needed
3. **Keyboard navigation:** All interactive elements keyboard accessible
4. **Focus management:** Logical tab order, visible focus indicators
5. **Screen reader support:** Test with NVDA/JAWS/VoiceOver

**Accessibility checklist:**
- [ ] Component uses semantic HTML
- [ ] All interactive elements keyboard accessible (Tab, Enter, Space)
- [ ] ARIA roles and labels present
- [ ] Color contrast meets WCAG AA standards (4.5:1 for text)
- [ ] Focus indicators visible
- [ ] Tested with screen reader

---

## Integration with Other Repos

**This library integrates with:**
- **omnichannel-chat-sdk** (peer dependency) - For chat operations (send message, etc.)
- **React** (peer dependency) - UI framework

**Consumed by:**
- **CRM.OmniChannel.LiveChatWidget** (npm dependency) - Customer chat widget
- **External customers** (public npm) - Custom widget implementations

**When changing component APIs:**
- This is a **public contract** - breaking changes affect external customers
- Use semantic versioning: major version for breaking changes
- Coordinate with LiveChatWidget team
- Update Storybook stories to reflect API changes
- Provide migration guide in CHANGELOG.md

---

## Pull Request Guidelines

1. **Code standards:** Follow TypeScript best practices, React conventions
2. **Commit messages:** Conventional commit format (feat:, fix:, chore:, etc.)
3. **Testing:** All tests must pass, add tests for new components
4. **Storybook:** Add stories for new components
5. **Accessibility:** Verify all accessibility requirements met
6. **Documentation:** Update README.md if component APIs change
7. **CHANGELOG:** Update CHANGELOG.md under [Unreleased] section

---

## Common Issues & Troubleshooting

**Build Issues:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node --version`
- Ensure both packages build: `npm run build`

**Storybook Issues:**
- Clear Storybook cache: `npm run storybook -- --no-manager-cache`
- Check for circular dependencies
- Verify all stories have valid meta exports

**Peer Dependency Warnings:**
- Ensure React version compatibility (17+ recommended)
- Check chat-sdk peer dependency version in package.json

**Accessibility Issues:**
- Use axe-core for automated testing: `npm run test:a11y` (if configured)
- Manually test with keyboard navigation (Tab, Enter, Space)
- Test with screen reader (NVDA, JAWS, VoiceOver)

---

## Documentation

- **[README.md](README.md)** - Component library usage, examples
- **[CHANGE_LOG.md](CHANGE_LOG.md)** - Release history
- **[docs/](docs/)** - Additional documentation
- **Storybook:** Run `npm run storybook` for interactive component docs

---

## Breaking Change Protocol

**Before making breaking changes to component APIs:**

1. **Identify impact:**
   - LiveChatWidget dependency (check package.json version)
   - External customers (check npm download stats)

2. **Coordination:**
   - Notify LiveChatWidget team
   - Create tracking work item
   - Plan migration timeline (minimum 2 release cycles)

3. **Implementation:**
   - Add new prop/API (backwards-compatible)
   - Mark old prop as deprecated in JSDoc: `@deprecated Use newProp instead`
   - Update Storybook stories with new API examples
   - After 2 releases, remove old prop (major version bump)

4. **Documentation:**
   - Update README.md with new component examples
   - Add migration guide to CHANGE_LOG.md
   - Update TypeScript type definitions

---

**Summary:** This is a public React component library with shared components for chat UIs. Focus on accessibility, theme customization, and Storybook documentation. Coordinate breaking changes with consumers (LiveChatWidget, external customers).
