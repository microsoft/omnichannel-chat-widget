import "@testing-library/jest-dom/extend-expect";
import { createCardActionMiddleware } from "./cardActionMiddleware";

describe("cardActionMiddleware test", () => {
    it ("createCardActionMiddleware() with undefined botMagicCodeConfig should not change the sign in card url", () => {
        const next = (args: any) => args; // eslint-disable-line @typescript-eslint/no-explicit-any
        const signInUrl = "https://token.botframework.com/api/oauth/signin?signin=[signin]";
        const args = {
            cardAction: {
                type: "signin",
                value: signInUrl
            }
        };

        const results = createCardActionMiddleware(undefined)()(next)(args);
        expect(signInUrl).toEqual(results.cardAction.value);
    });

    it ("createCardActionMiddleware() with botMagicCode enabled should not change the sign in card url", () => {
        const botMagicCodeConfig = {
            disabled: false
        };

        const next = (args: any) => args; // eslint-disable-line @typescript-eslint/no-explicit-any
        const signInUrl = "https://token.botframework.com/api/oauth/signin?signin=[signin]";
        const args = {
            cardAction: {
                type: "signin",
                value: signInUrl
            }
        };

        const results = createCardActionMiddleware(botMagicCodeConfig)()(next)(args);
        expect(args.cardAction.value).toEqual(results.cardAction.value);
    });

    it ("createCardActionMiddleware() with botMagicCode disabled & no fwdUrl should not change the sign in card url", () => {
        const botMagicCodeConfig = {
            disabled: true
        };

        const next = (args: any) => args; // eslint-disable-line @typescript-eslint/no-explicit-any
        const signInUrl = "https://token.botframework.com/api/oauth/signin?signin=[signin]";
        const args = {
            cardAction: {
                type: "signin",
                value: signInUrl
            }
        };

        const results = createCardActionMiddleware(botMagicCodeConfig)()(next)(args);
        expect(args.cardAction.value).toEqual(results.cardAction.value);
    });


    it ("createCardActionMiddleware() with botMagicCode disabled & fwdUrl should append the fwdUrl in the sign in card url", () => {
        const botMagicCodeConfig = {
            disabled: true,
            fwdUrl: "http://localhost/forwarder.html"
        };

        const next = (args: any) => args; // eslint-disable-line @typescript-eslint/no-explicit-any
        const signInUrl = "https://token.botframework.com/api/oauth/signin?signin=[signin]";
        const args = {
            cardAction: {
                type: "signin",
                value: signInUrl
            }
        };

        const results = createCardActionMiddleware(botMagicCodeConfig)()(next)(args);
        expect(signInUrl === results.cardAction.value).toBe(false);
        expect(results.cardAction.value === `${signInUrl}&fwdUrl=${botMagicCodeConfig.fwdUrl}`).toBe(true);
    });

    it ("createCardActionMiddleware() should not append fwdUrl if fwdUrl & sign in card url are not in the same domain", () => {
        const botMagicCodeConfig = {
            disabled: true,
            fwdUrl: "https://localhost/forwarder.html"
        };

        const next = (args: any) => args; // eslint-disable-line @typescript-eslint/no-explicit-any
        const signInUrl = "https://token.botframework.com/api/oauth/signin?signin=[signin]";
        const args = {
            cardAction: {
                type: "signin",
                value: signInUrl
            }
        };

        const results = createCardActionMiddleware(botMagicCodeConfig)()(next)(args);
        expect(signInUrl === results.cardAction.value).toBe(true);
        expect(results.cardAction.value === `${signInUrl}&fwdUrl=${botMagicCodeConfig.fwdUrl}`).toBe(false);
    });    
});
