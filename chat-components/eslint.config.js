import react from "eslint-plugin-react";
import tsParser from "@typescript-eslint/parser";
import typescript from "@typescript-eslint/eslint-plugin";

export default [
    {
        ignores: [
            "node_modules",
            "lib",
            ".storybook",
            "storybook-static",
            "dist",
            "build",
            "coverage",
            "**/*.d.ts",
            "**/*.test.{js,jsx,ts,tsx}",
            "**/*.spec.{js,jsx,ts,tsx}"
        ]
    },
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaFeatures: { jsx: true },
                ecmaVersion: 12,
                sourceType: "module"
            },
            globals: {
                window: "readonly",
                document: "readonly",
                navigator: "readonly",
                jest: "readonly",
            }
        },
        plugins: {
            "@typescript-eslint": typescript,
            react
        },
        rules: {
            indent: ["error", 4],
            "linebreak-style": ["error", "windows"],
            quotes: ["error", "double"],
            semi: ["error", "always"]
        }
    }
];