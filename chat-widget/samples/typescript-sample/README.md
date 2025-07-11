# TypeScript Sample - Omnichannel Chat Widget

This sample demonstrates how to integrate the Microsoft Omnichannel Chat Widget in a TypeScript/React application.

## Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn package manager

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure your Omnichannel settings**
   
   Open `src/index.tsx` and update the `getOmnichannelChatConfig` function with your actual Omnichannel configuration:
   
   ```typescript
   const getOmnichannelChatConfig = () => {
       const omnichannelConfig = {
           orgId: "<YOUR-ORG-ID>",          // Replace with your organization ID
           orgUrl: "<YOUR-ORG-URL>",        // Replace with your organization URL
           widgetId: "<YOUR-WIDGET-ID>"     // Replace with your widget ID
       };
       return omnichannelConfig;
   };
   ```

3. **Run the development server**
   ```bash
   npm start
   ```
   
   The application will open in your browser at `http://localhost:4000`

4. **Build for production**
   ```bash
   npm run build
   ```
   
   The built files will be available in the `dist` directory.

## Key Features

- **TypeScript Support**: Full TypeScript integration with proper type checking
- **React 18**: Updated to use React 18.x for better performance and features
- **RxJS 6 Compatibility**: Uses RxJS 6 with compatibility layer for the chat widget
- **Webpack 5**: Modern build system with hot reloading
- **Custom Styling**: Example of how to customize the chat widget appearance
- **Telemetry**: Built-in telemetry configuration for monitoring

## Dependencies

- **@microsoft/omnichannel-chat-widget**: The main chat widget component
- **@microsoft/omnichannel-chat-sdk**: SDK for chat functionality
- **@microsoft/omnichannel-chat-components**: UI components for chat
- **react** & **react-dom**: React framework (v18.x)
- **rxjs** & **rxjs-compat**: For reactive programming with backward compatibility
- **typescript**: For type checking and compilation

## Package Updates

This sample has been updated to use the latest stable versions of:
- React 18.3.1 (previously 16.14.0)
- TypeScript 5.8.3 (previously 4.8.3)
- Webpack 5.74.0 (previously 5.74.0)
- All Microsoft omnichannel packages to their latest versions

## Troubleshooting

### Common Issues

1. **RxJS Import Errors**: The sample uses RxJS 6 with rxjs-compat to support the chat widget's legacy imports
2. **TypeScript Compilation Errors**: Make sure all dependencies are properly installed and up-to-date
3. **React-Native Warning**: The warning about 'react-native' is expected and can be ignored for web applications

### Build Warnings

The build may show warnings about:
- `react-native` module not found: This is expected for web applications
- Deprecated packages: These are dependencies of the omnichannel packages and don't affect functionality

## Support

For issues with the chat widget itself, please refer to the main [omnichannel-chat-widget repository](https://github.com/microsoft/omnichannel-chat-widget).