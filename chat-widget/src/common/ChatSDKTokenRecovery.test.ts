import { ChatClient } from "@azure/communication-chat";
import { createHttpHeaders, createPipelineRequest, PipelineRequest, SendRequest } from "@azure/core-rest-pipeline";
import ACSClient from "@microsoft/omnichannel-chat-sdk/lib/core/messaging/ACSClient";
import { createChatTokenRefresher, RenewedChatToken } from "@microsoft/omnichannel-chat-sdk/lib/utils/chatTokenRenewal";
import {
    createChatTokenUnauthorizedRecovery,
    createChatTokenUnauthorizedRecoveryPolicy
} from "@microsoft/omnichannel-chat-sdk/lib/utils/chatTokenUnauthorizedRecovery";

jest.mock("@azure/communication-chat", () => ({
    ChatClient: jest.fn().mockImplementation(() => ({}))
}));

const chatConstructor = ChatClient as jest.MockedClass<typeof ChatClient>;
const now = Date.UTC(2026, 0, 1);
const chatId = "regression-thread";
const messageBody = JSON.stringify({ content: "Recovery regression message" });

function token(expiresAt: number, signature: string): string {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64");
    const payload = Buffer.from(JSON.stringify({ exp: Math.floor(expiresAt / 1000) })).toString("base64");
    return `${header}.${payload}.${signature}`;
}

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>(complete => { resolve = complete; });
    return { promise, resolve };
}

function createJourney() {
    const initialToken = token(now + 3600000, "initial");
    const replacementToken = token(now + 7200000, "replacement");
    const active = { value: true };
    const onRenewed = jest.fn();
    const renewed: RenewedChatToken = { ChatId: chatId, Token: replacementToken };
    const renew = jest.fn<Promise<RenewedChatToken>, []>().mockResolvedValue(renewed);
    // Exercise the installed SDK; only the backend response and ACS transport are controlled.
    const refresher = createChatTokenRefresher({
        initialToken,
        chatId,
        isChatActive: () => active.value,
        renewChatToken: renew,
        onRenewed
    });
    const recovery = createChatTokenUnauthorizedRecovery({ initialToken, refreshToken: refresher });
    const policy = createChatTokenUnauthorizedRecoveryPolicy(recovery).policy;
    const request = (body: PipelineRequest["body"] = messageBody) => createPipelineRequest({
        url: "https://example.invalid/chat/threads/regression-thread/messages",
        method: "POST",
        headers: createHttpHeaders({ Authorization: `Bearer ${initialToken}` }),
        body
    });
    return { initialToken, replacementToken, active, onRenewed, renewed, renew, refresher, recovery, policy, request };
}

function transport(statuses: number[]) {
    const attempts: { authorization: string | undefined; body: PipelineRequest["body"] }[] = [];
    const next = jest.fn<ReturnType<SendRequest>, Parameters<SendRequest>>().mockImplementation(async request => {
        const status = statuses.shift();
        if (status === undefined) {
            throw new Error("Unexpected additional ACS request.");
        }
        attempts.push({ authorization: request.headers.get("Authorization"), body: request.body });
        return { request, status, headers: createHttpHeaders() };
    });
    return { attempts, next };
}

describe("Installed Chat SDK recovery contract", () => {
    beforeEach(() => {
        jest.useFakeTimers("modern");
        jest.setSystemTime(now);
    });

    afterEach(() => {
        for (const [, credential] of chatConstructor.mock.calls) {
            credential.dispose();
        }
        jest.clearAllTimers();
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    test("replays an unexpired 401 once with a replacement token and unchanged message body", async () => {
        const journey = createJourney();
        const network = transport([401, 201]);
        const response = await journey.policy.sendRequest(journey.request(), network.next);
        expect(response.status).toBe(201);
        expect(network.attempts).toEqual([
            { authorization: `Bearer ${journey.initialToken}`, body: messageBody },
            { authorization: `Bearer ${journey.replacementToken}`, body: messageBody }
        ]);
        expect(journey.renew).toHaveBeenCalledTimes(1);
        expect(journey.onRenewed).toHaveBeenCalledWith(journey.renewed);
        const following = transport([201]);
        await journey.policy.sendRequest(journey.request(), following.next);
        expect(following.attempts).toEqual([
            { authorization: `Bearer ${journey.replacementToken}`, body: messageBody }
        ]);
        expect(journey.renew).toHaveBeenCalledTimes(1);
    });

    test("coalesces concurrent unauthorized sends into one renewal", async () => {
        const journey = createJourney();
        const started = deferred<void>();
        const renewal = deferred<RenewedChatToken>();
        journey.renew.mockImplementation(() => {
            started.resolve();
            return renewal.promise;
        });
        const firstNetwork = transport([401, 201]);
        const secondNetwork = transport([401, 201]);
        const first = journey.policy.sendRequest(journey.request("First message"), firstNetwork.next);
        const second = journey.policy.sendRequest(journey.request("Second message"), secondNetwork.next);
        await started.promise;
        expect(journey.renew).toHaveBeenCalledTimes(1);
        renewal.resolve(journey.renewed);
        expect((await Promise.all([first, second])).map(response => response.status)).toEqual([201, 201]);
        expect(journey.renew).toHaveBeenCalledTimes(1);
        expect(journey.onRenewed).toHaveBeenCalledTimes(1);
        expect(firstNetwork.attempts.map(attempt => attempt.body)).toEqual(["First message", "First message"]);
        expect(secondNetwork.attempts.map(attempt => attempt.body)).toEqual(["Second message", "Second message"]);
    });

    test("does not loop when ACS also rejects the replacement", async () => {
        const journey = createJourney();
        const network = transport([401, 401]);
        expect((await journey.policy.sendRequest(journey.request(), network.next)).status).toBe(401);
        expect(network.next).toHaveBeenCalledTimes(2);
        expect(journey.renew).toHaveBeenCalledTimes(1);
    });

    test("preserves failure and throttles repeated recovery after a renewal outage", async () => {
        const journey = createJourney();
        journey.renew.mockRejectedValueOnce(new Error("Simulated renewal outage"));
        const first = transport([401]);
        expect((await journey.policy.sendRequest(journey.request(), first.next)).status).toBe(401);
        const immediateRetry = transport([401]);
        expect((await journey.policy.sendRequest(journey.request(), immediateRetry.next)).status).toBe(401);
        expect(journey.renew).toHaveBeenCalledTimes(1);
        expect(journey.onRenewed).not.toHaveBeenCalled();
        jest.setSystemTime(now + 60000);
        const later = transport([401, 201]);
        expect((await journey.policy.sendRequest(journey.request(), later.next)).status).toBe(201);
        expect(journey.renew).toHaveBeenCalledTimes(2);
    });

    test.each([200, 400, 403, 429, 500])("does not renew or replay HTTP %s", async status => {
        const journey = createJourney();
        const network = transport([status]);
        expect((await journey.policy.sendRequest(journey.request(), network.next)).status).toBe(status);
        expect(network.next).toHaveBeenCalledTimes(1);
        expect(journey.renew).not.toHaveBeenCalled();
    });

    test.each(["same", "invalid", "expired", "different-chat"])(
        "does not replay with a %s renewal credential", async kind => {
            const journey = createJourney();
            const responses: Record<string, RenewedChatToken> = {
                same: { ...journey.renewed, Token: journey.initialToken },
                invalid: { ...journey.renewed, Token: "not-a-token" },
                expired: { ...journey.renewed, Token: token(now - 1000, "expired") },
                "different-chat": { ...journey.renewed, ChatId: "another-thread" }
            };
            journey.renew.mockResolvedValue(responses[kind]);
            const network = transport([401]);
            expect((await journey.policy.sendRequest(journey.request(), network.next)).status).toBe(401);
            expect(network.next).toHaveBeenCalledTimes(1);
            expect(journey.renew).toHaveBeenCalledTimes(1);
            if (kind !== "same") {
                expect(journey.onRenewed).not.toHaveBeenCalled();
            }
        });

    test("does not replay a non-replayable request body", async () => {
        const journey = createJourney();
        const network = transport([401]);
        const body = new Uint8Array([1, 2, 3]);
        expect((await journey.policy.sendRequest(journey.request(body), network.next)).status).toBe(401);
        expect(network.next).toHaveBeenCalledTimes(1);
        expect(journey.renew).not.toHaveBeenCalled();
    });

    test("does not apply an in-flight renewal after its chat ends", async () => {
        const journey = createJourney();
        const started = deferred<void>();
        const renewal = deferred<RenewedChatToken>();
        journey.renew.mockImplementation(() => {
            started.resolve();
            return renewal.promise;
        });
        const network = transport([401]);
        const result = journey.policy.sendRequest(journey.request(), network.next);
        await started.promise;
        journey.active.value = false;
        renewal.resolve(journey.renewed);
        expect((await result).status).toBe(401);
        expect(network.next).toHaveBeenCalledTimes(1);
        expect(journey.onRenewed).not.toHaveBeenCalled();
        jest.setSystemTime(now + 60000);
        const next = transport([401]);
        expect((await journey.policy.sendRequest(journey.request(), next.next)).status).toBe(401);
        expect(journey.renew).toHaveBeenCalledTimes(1);
    });

    test("wires recovery into the actual ACS client and shares the replacement with its credential", async () => {
        const journey = createJourney();
        const client = new ACSClient();
        await client.initialize({
            token: journey.initialToken,
            environmentUrl: "https://example.invalid",
            tokenRefresher: journey.refresher,
            unauthorizedRecovery: journey.recovery
        });
        const [, credential, options] = chatConstructor.mock.calls[0];
        expect(options?.additionalPolicies).toHaveLength(1);
        const policy = options?.additionalPolicies?.[0];
        expect(policy?.position).toBe("perRetry");
        if (!policy) {
            throw new Error("The installed SDK did not attach its recovery policy.");
        }
        const network = transport([401, 201]);
        expect((await policy.policy.sendRequest(journey.request(), network.next)).status).toBe(201);
        await expect(credential.getToken()).resolves.toEqual({
            token: journey.replacementToken,
            expiresOnTimestamp: now + 7200000
        });
        expect(journey.renew).toHaveBeenCalledTimes(1);
    });

    test("renews an expired ACS credential through the installed client before it is returned", async () => {
        const journey = createJourney();
        const client = new ACSClient();
        await client.initialize({
            token: journey.initialToken,
            environmentUrl: "https://example.invalid",
            tokenRefresher: journey.refresher
        });
        const [, credential] = chatConstructor.mock.calls[0];
        jest.setSystemTime(now + 3601000);
        await expect(credential.getToken()).resolves.toMatchObject({ token: journey.replacementToken });
        expect(journey.renew).toHaveBeenCalledTimes(1);
        expect(journey.onRenewed).toHaveBeenCalledWith(journey.renewed);
    });

    test("preserves the static-token client when recovery is not configured", async () => {
        const journey = createJourney();
        const client = new ACSClient();
        await client.initialize({ token: journey.initialToken, environmentUrl: "https://example.invalid" });
        const [, credential, options] = chatConstructor.mock.calls[0];
        expect(options).toBeUndefined();
        await expect(credential.getToken()).resolves.toMatchObject({ token: journey.initialToken });
        expect(journey.renew).not.toHaveBeenCalled();
        expect(journey.recovery.selectToken(journey.initialToken)).toBe(journey.initialToken);
    });
});
