import { BrowserContext, Page, Route } from "playwright";
import { createServer, Server } from "http";
import { readFileSync, readdirSync } from "fs";
import * as path from "path";

const renewalPattern = /\/livechatconnector\/v2\/(?:auth\/)?renewchattoken(?:\/|\?|$)/i;
const messagesPattern = /\/chat\/threads\/[^/]+\/messages(?:\?|$)/;
const configPattern = /\/livechatconnector\/config(?:\/|\?|$)/i;
const creationPattern = /\/livechatconnector\/(?:auth\/)?(?:sessioninit(?:\/|\?|$)|organization\/[^/]+\/widgetApp\/[^/]+\/conversation(?:\?|$))/i;
const sendBox = ".webchat__send-box input, .webchat__send-box textarea";
const pollInterval = 200;
const networkTimeout = 30000;
const widgetRoot = path.resolve(__dirname, "..", "..", "..");

declare global {
    interface Window {
        advanceRecoveryClock: (time: number) => void;
        resetRecoveryClock: () => void;
        endChat: () => void;
    }
}

export async function waitForRecovery(check: () => boolean | Promise<boolean>, label: string,
    timeout = networkTimeout): Promise<void> {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
        if (await check()) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    throw new Error(`Timed out waiting for ${label}.`);
}

export async function startRecoveryHost(): Promise<{ server: Server; url: string }> {
    const widget = JSON.parse(readFileSync(path.join(widgetRoot, "package.json"), "utf8"));
    const automation = JSON.parse(readFileSync(path.join(widgetRoot, "automation_tests", "package.json"), "utf8"));
    const version = widget.dependencies["@microsoft/omnichannel-chat-sdk"];
    if (version !== automation.dependencies["@microsoft/omnichannel-chat-sdk"]) {
        throw new Error("Widget and automation must use the same Chat SDK version.");
    }
    const bundle = readFileSync(path.join(widgetRoot, "dist", "out.js"));
    if (!bundle.includes(Buffer.from(version))) {
        throw new Error("Rebuild the sample: its bundle does not contain the configured Chat SDK version.");
    }
    const html = readFileSync(path.join(widgetRoot, "automation_tests", "customlivechatwidgets",
        "CustomLiveChatWidget.html"));
    const assets = new Map<string, Buffer>();
    for (const name of readdirSync(path.join(widgetRoot, "dist"))) {
        if (/^[\w.-]+\.(js|css)$/.test(name)) {
            assets.set(name, readFileSync(path.join(widgetRoot, "dist", name)));
        }
    }
    const server = createServer((request, response) => {
        const pathname = new URL(request.url || "/", "http://localhost").pathname;
        const assetName = pathname.replace(/^\/(?:chat-widget\/)?dist\//, "");
        if (pathname === "/") {
            response.setHeader("Content-Type", "text/html");
            response.end(html);
        } else if (assets.has(assetName)) {
            response.setHeader("Content-Type", assetName.endsWith(".css") ? "text/css" : "application/javascript");
            response.end(assets.get(assetName));
        } else {
            response.statusCode = 404;
            response.end();
        }
    });
    await new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    if (!address || typeof address === "string") {
        throw new Error("The loopback widget host did not start.");
    }
    return { server, url: `http://127.0.0.1:${address.port}/` };
}

export class TokenRecoveryJourney {
    fault: "none" | "old-token" | "all-tokens" | "renewal-unavailable" = "none";
    renewalEnabled: boolean | undefined;
    renewalStatuses: number[] = [];
    sendStatuses: number[] = [];
    sendUsesInitialToken: boolean[] = [];
    sessionClosed = false;
    private initialAuthorization = "";
    private currentAuthorization = "";
    private messagesUrl = "";
    private marker = "";
    private started = false;
    private routeFailure = false;

    constructor(readonly page: Page, private readonly context: BrowserContext,
        private readonly host: string, private readonly renewalDisabled = false) {}

    get tokenChanged(): boolean {
        return !!this.currentAuthorization && this.currentAuthorization !== this.initialAuthorization;
    }

    get expiresAt(): number {
        const jwt = this.initialAuthorization.replace(/^Bearer\s+/i, "");
        const payload = JSON.parse(Buffer.from(jwt.split(".")[1], "base64").toString("utf8"));
        if (typeof payload.exp !== "number") {
            throw new Error("The ACS credential has no numeric expiry.");
        }
        return payload.exp * 1000;
    }

    async start(): Promise<void> {
        const orgId = process.env.LCW_RECOVERY_ORG_ID;
        const widgetId = process.env.LCW_RECOVERY_WIDGET_ID;
        const orgUrl = process.env.LCW_RECOVERY_ORG_URL;
        if (!orgId || !widgetId || !orgUrl || new URL(orgUrl).protocol !== "https:") {
            throw new Error("Set LCW_RECOVERY_ORG_ID, LCW_RECOVERY_WIDGET_ID and HTTPS LCW_RECOVERY_ORG_URL for a test org.");
        }
        await this.page.addInitScript(() => {
            const nativeDate = Date;
            let offset = 0;
            window.Date = new Proxy(nativeDate, {
                construct(target, args) {
                    return Reflect.construct(target, args.length ? args : [nativeDate.now() + offset]);
                },
                apply() {
                    return new nativeDate(nativeDate.now() + offset).toString();
                },
                get(target, key) {
                    return key === "now" ? () => nativeDate.now() + offset : Reflect.get(target, key);
                }
            });
            const browser: Window = window;
            const setTimer = browser.setTimeout.bind(browser);
            const clearTimer = browser.clearTimeout.bind(browser);
            const timers = new Map<number, { due: number; fire: () => void }>();
            browser.setTimeout = (handler, delay = 0, ...args) => {
                if (typeof handler !== "function" || delay < 60000) {
                    return setTimer(handler, delay, ...args);
                }
                const fire = () => {
                    timers.delete(id);
                    handler(...args);
                };
                const id = setTimer(fire, delay);
                timers.set(id, { due: Date.now() + delay, fire });
                return id;
            };
            browser.clearTimeout = id => {
                timers.delete(id);
                clearTimer(id);
            };
            window.advanceRecoveryClock = time => {
                offset += Math.max(0, time - Date.now());
                for (const [id, timer] of Array.from(timers)) {
                    if (timer.due <= Date.now()) {
                        clearTimer(id);
                        timer.fire();
                    }
                }
            };
            window.resetRecoveryClock = () => {
                offset = 0;
            };
        });
        this.page.on("response", response => {
            const request = response.request();
            if (request.method() === "POST" && creationPattern.test(response.url()) && response.ok()) {
                this.started = true;
            }
            if (request.method() === "POST" && /\/livechatconnector\/(?:auth\/)?sessionclose/i.test(response.url()) &&
                response.ok()) {
                this.sessionClosed = true;
            }
            if (request.method() === "POST" && messagesPattern.test(response.url()) &&
                this.marker && (request.postData() || "").includes(this.marker)) {
                this.sendStatuses.push(response.status());
            }
        });
        await this.context.route(configPattern, async route => {
            await this.handleRoute(route, async () => {
                if (route.request().method() === "OPTIONS") {
                    await route.continue();
                    return;
                }
                const response = await this.context.request.fetch(route.request());
                const body = await response.json();
                if (this.renewalDisabled && body.LcwFcbConfiguration) {
                    body.LcwFcbConfiguration.lcwChatTokenRenewalEnabled = false;
                }
                this.renewalEnabled = body.LcwFcbConfiguration &&
                    body.LcwFcbConfiguration.lcwChatTokenRenewalEnabled === true;
                await route.fulfill({ response, body: JSON.stringify(body), contentType: "application/json" });
            });
        });
        await this.context.route(renewalPattern, async route => {
            await this.handleRoute(route, async () => {
                if (route.request().method() === "OPTIONS") {
                    await route.continue();
                } else if (this.fault === "renewal-unavailable") {
                    this.renewalStatuses.push(503);
                    await route.fulfill({
                        status: 503,
                        headers: { "access-control-allow-origin": route.request().headers().origin || "*",
                            "access-control-allow-credentials": "true",
                            "access-control-expose-headers": "retry-after", "retry-after": "0" },
                        contentType: "application/json",
                        body: "{\"error\":\"Test renewal unavailable\"}"
                    });
                } else {
                    const response = await this.context.request.fetch(route.request());
                    this.renewalStatuses.push(response.status());
                    await route.fulfill({ response });
                }
            });
        });
        await this.context.route(messagesPattern, route => this.handleRoute(route, () => this.routeMessage(route)));
        const url = new URL(this.host);
        url.searchParams.set("data-org-id", orgId);
        url.searchParams.set("data-app-id", widgetId);
        url.searchParams.set("data-org-url", orgUrl);
        await this.page.goto(url.href);
        await this.page.locator("#oc-lcw-chat-button").click({ timeout: 60000 });
        await this.page.locator(sendBox).first().waitFor({ state: "visible", timeout: 60000 });
        await waitForRecovery(() => this.started && !!this.initialAuthorization, "real conversation initialization");
        expect(this.renewalEnabled).toBe(!this.renewalDisabled);
        await this.sendAndExpectDelivered("Baseline");
        expect(this.renewalStatuses).toEqual([]);
    }

    private async handleRoute(route: Route, action: () => Promise<void>): Promise<void> {
        try {
            await action();
        } catch {
            // Browser transport exceptions can contain credentials. Never forward them to a reporter.
            this.routeFailure = true;
            try {
                await route.abort();
            } catch {
                // A failed/closed route may already have been disposed by the browser.
            }
        }
    }

    private async routeMessage(route: Route): Promise<void> {
        const request = route.request();
        if (request.method() === "OPTIONS") {
            await route.continue();
            return;
        }
        const headers = await request.allHeaders();
        const authorization = headers.authorization || "";
        if (authorization) {
            this.initialAuthorization = this.initialAuthorization || authorization;
            this.currentAuthorization = authorization;
            this.messagesUrl = request.url();
        }
        const target = request.method() === "POST" && !!this.marker &&
            (request.postData() || "").includes(this.marker);
        if (target) {
            this.sendUsesInitialToken.push(authorization === this.initialAuthorization);
        }
        const reject = target && (this.fault === "all-tokens" ||
            ((this.fault === "old-token" || this.fault === "renewal-unavailable") &&
                authorization === this.initialAuthorization));
        if (reject) {
            const parts = authorization.split(".");
            if (parts.length !== 3 || !parts[2]) {
                throw new Error("Missing ACS credential on the target send.");
            }
            parts[2] = `${parts[2][0] === "A" ? "B" : "A"}${parts[2].slice(1)}`;
            await route.continue({ headers: { ...headers, authorization: parts.join(".") } });
        } else {
            await route.continue();
        }
    }

    async send(label: string): Promise<void> {
        this.marker = `Recovery ${label} ${Date.now()}-${Math.random().toString(16).slice(2)}`;
        this.sendStatuses = [];
        this.sendUsesInitialToken = [];
        const input = this.page.locator(sendBox).first();
        await input.fill(this.marker);
        await input.press("Enter");
    }

    async expectDelivered(expectedBubbles = 1): Promise<void> {
        await waitForRecovery(() => this.sendStatuses.includes(201), "ACS message persistence");
        await waitForRecovery(async () => this.page.locator(".webchat__bubble__content")
            .filter({ hasText: this.marker }).count().then(count => count === expectedBubbles),
        "the expected number of visible message bubbles");
        await waitForRecovery(async () => this.page.evaluate(async ({ url, authorization, marker }) => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 5000);
            try {
                const response = await fetch(url, { headers: { authorization }, signal: controller.signal });
                if (!response.ok) {
                    return false;
                }
                const body = await response.json();
                return Array.isArray(body.value) && body.value.filter(message =>
                    message.content && JSON.stringify(message.content).includes(marker)).length === 1;
            } finally {
                clearTimeout(timer);
            }
        }, { url: this.messagesUrl, authorization: this.currentAuthorization, marker: this.marker }),
        "one persisted history message");
        expect(this.routeFailure).toBe(false);
    }

    async sendAndExpectDelivered(label: string): Promise<void> {
        await this.send(label);
        await this.expectDelivered();
    }

    async expectRetryable(): Promise<void> {
        await this.page.locator("button").filter({ hasText: /^Retry$/ }).first()
            .waitFor({ state: "visible", timeout: networkTimeout });
    }

    async retry(): Promise<void> {
        await this.page.locator("button").filter({ hasText: /^Retry$/ }).first().click();
    }

    async advanceClockTo(time: number): Promise<void> {
        await this.page.evaluate(value => window.advanceRecoveryClock(value), time);
    }

    async end(): Promise<void> {
        if (!this.started || this.sessionClosed) {
            return;
        }
        this.fault = "none";
        await this.page.evaluate(() => {
            window.resetRecoveryClock();
            window.endChat();
        });
        await waitForRecovery(async () => {
            const confirm = this.page.locator("#lcw-components-confirmation-pane button[aria-label='Close Chat']");
            if (await confirm.isVisible()) {
                await confirm.click();
            }
            return this.sessionClosed;
        }, "successful conversation cleanup");
        expect(this.routeFailure).toBe(false);
    }
}
