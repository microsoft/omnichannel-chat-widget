// Opt-in axe-core/react dev reporter. Enable by exporting
// `STORYBOOK_AXE_DEV=true` before `yarn storybook` (Storybook 6 auto-injects
// `STORYBOOK_*` env vars into the client bundle). The eval-require keeps the
// axe runtime out of the production storybook bundle and prevents webpack 4
// from trying to statically analyze the @axe-core/react ESM entry.
if (typeof process !== "undefined" && process.env && process.env.STORYBOOK_AXE_DEV === "true") {
    try {
        // eslint-disable-next-line no-eval
        const dynamicRequire = eval("require");
        const React = dynamicRequire("react");
        const ReactDOM = dynamicRequire("react-dom");
        const axeMod = dynamicRequire("@axe-core/react");
        const axeFn = (axeMod && axeMod.default) || axeMod;
        axeFn(React, ReactDOM, 1000);
        // eslint-disable-next-line no-console
        console.info("[a11y] @axe-core/react reporter active (STORYBOOK_AXE_DEV=true)");
    } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[a11y] STORYBOOK_AXE_DEV=true but axe could not be loaded:", err && err.message);
    }
}

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}