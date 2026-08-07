import { BroadcastChannel } from "broadcast-channel";
import { BroadcastService, BroadcastServiceInitialize } from "./BroadcastService";

describe("BroadcastService", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("closes both channels when disposed", () => {
        const close = jest.spyOn(BroadcastChannel.prototype, "close").mockResolvedValue();

        BroadcastServiceInitialize(`test-${Date.now()}`);
        BroadcastService.disposeChannel();

        expect(close).toHaveBeenCalledTimes(2);
    });
});
