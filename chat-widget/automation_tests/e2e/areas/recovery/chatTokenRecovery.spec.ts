import { Browser, BrowserContext, chromium } from "playwright";
import { Server } from "http";
import { startRecoveryHost, TokenRecoveryJourney, waitForRecovery } from "../../utility/tokenRecovery";

const describeRecovery = process.env.LCW_TOKEN_RECOVERY_E2E === "1" ? describe : describe.skip;

describeRecovery("Real widget chat token recovery", () => {
    let browser: Browser;
    let server: Server;
    let host: string;
    let context: BrowserContext;
    let journey: TokenRecoveryJourney;

    beforeAll(async () => {
        const running = await startRecoveryHost();
        server = running.server;
        host = running.url;
        browser = await chromium.launch({
            headless: true,
            channel: process.env.LCW_RECOVERY_BROWSER_CHANNEL || undefined
        });
    });

    afterAll(async () => {
        try {
            if (browser) {
                await browser.close();
            }
        } finally {
            if (server) {
                await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
            }
        }
    });

    afterEach(async () => {
        try {
            if (journey) {
                await journey.end();
            }
        } finally {
            journey = undefined;
            if (context) {
                await context.close();
                context = undefined;
            }
        }
    });

    async function start(disabled = false): Promise<TokenRecoveryJourney> {
        context = await browser.newContext();
        const page = await context.newPage();
        journey = new TokenRecoveryJourney(page, context, host, disabled);
        await journey.start();
        return journey;
    }

    test("recovers an unexpired rejected credential once without duplicate delivery", async () => {
        const current = await start();
        expect(current.expiresAt).toBeGreaterThan(Date.now() + 600000);
        current.fault = "old-token";
        await current.sendAndExpectDelivered("Unauthorized");
        expect(current.sendStatuses).toEqual([401, 201]);
        expect(current.sendUsesInitialToken).toEqual([true, false]);
        expect(current.renewalStatuses).toEqual([200]);
        expect(current.tokenChanged).toBe(true);
        await current.sendAndExpectDelivered("After recovery");
        expect(current.sendStatuses).toEqual([201]);
        expect(current.sendUsesInitialToken).toEqual([false]);
        expect(current.renewalStatuses).toEqual([200]);
    });

    test("renews proactively near expiry and keeps messaging usable", async () => {
        const current = await start();
        await current.advanceClockTo(current.expiresAt - 540000);
        await waitForRecovery(() => current.renewalStatuses.length === 1, "proactive renewal");
        expect(current.renewalStatuses).toEqual([200]);
        await current.sendAndExpectDelivered("Near expiry");
        expect(current.tokenChanged).toBe(true);
        expect(current.sendStatuses).toEqual([201]);
        expect(current.sendUsesInitialToken).toEqual([false]);
    });

    test("refreshes a client-clock-expired credential before sending", async () => {
        const current = await start();
        // Server issuance uses real time; allow the replacement to outlive the shifted client clock.
        await new Promise(resolve => setTimeout(resolve, 110000));
        await current.advanceClockTo(current.expiresAt + 30000);
        await current.sendAndExpectDelivered("Client expiry");
        expect(current.tokenChanged).toBe(true);
        expect(current.renewalStatuses).toEqual([200]);
        expect(current.sendStatuses).toEqual([201]);
        expect(current.sendUsesInitialToken).toEqual([false]);
    });

    test("stops after one replay when the replacement credential is also rejected", async () => {
        const current = await start();
        current.fault = "all-tokens";
        await current.send("Rejected replacement");
        await current.expectRetryable();
        await new Promise(resolve => setTimeout(resolve, 3000));
        expect(current.sendStatuses).toEqual([401, 401]);
        expect(current.renewalStatuses).toEqual([200]);
        expect(current.tokenChanged).toBe(true);
    });

    test("keeps renewal failure retryable and respects the recovery cooldown", async () => {
        const current = await start();
        current.fault = "renewal-unavailable";
        await current.send("Renewal unavailable");
        await current.expectRetryable();
        expect(current.sendStatuses).toEqual([401]);
        expect(current.renewalStatuses.length).toBeGreaterThan(0);
        expect(current.renewalStatuses.every(status => status === 503)).toBe(true);
        expect(current.tokenChanged).toBe(false);
        await current.retry();
        await waitForRecovery(() => current.sendStatuses.length === 2, "the manual retry attempt");
        await current.expectRetryable();
        await waitForRecovery(() => current.renewalStatuses.length === 6, "bounded renewal transport retries");
        await new Promise(resolve => setTimeout(resolve, 3000));
        expect(current.sendStatuses).toEqual([401, 401]);
        expect(current.renewalStatuses).toEqual(Array(6).fill(503));
    });

    test("does not renew with the configuration disabled, while valid messaging still works", async () => {
        const current = await start(true);
        await current.advanceClockTo(current.expiresAt - 540000);
        await current.sendAndExpectDelivered("Disabled valid send");
        current.fault = "old-token";
        await current.send("Disabled rejected send");
        await current.expectRetryable();
        await new Promise(resolve => setTimeout(resolve, 3000));
        expect(current.sendStatuses).toEqual([401]);
        expect(current.renewalStatuses).toEqual([]);
        current.fault = "none";
        await current.retry();
        // The existing manual retry UI retains the failed bubble and adds the new send.
        await current.expectDelivered(2);
        expect(current.sendStatuses).toEqual([401, 201]);
        expect(current.sendUsesInitialToken).toEqual([true, true]);
        expect(current.renewalStatuses).toEqual([]);
        expect(current.tokenChanged).toBe(false);
    });
});
