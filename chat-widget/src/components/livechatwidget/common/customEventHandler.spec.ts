/* eslint-disable @typescript-eslint/no-unused-vars */
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { customEventCallback, subscribeToSendCustomEvent } from "./customEventHandler";

describe("customEventHandler tests", () => {
    it("verify correct message is sent through facade SdK", () => {
        const observers: ((event) => void)[] = [];
        const fakeBroadcastService = {
            getMessageByEventName: (name: string) => {
                return {
                    subscribe: (callback: (event) => void) => {
                        observers.push(callback);
                    }
                };
            },
            postMessage: (message) => {
                observers[0](message);
            }
        };
        const fakeFacadeSDK = {
            sendMessage: jest.fn().mockImplementation((_message) => {
                return;
            })
        };
        jest.spyOn(TelemetryHelper, "logActionEventToAllTelemetry").mockImplementation(() => {
            return;
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        subscribeToSendCustomEvent(fakeBroadcastService as any, fakeFacadeSDK as any, customEventCallback);
        fakeBroadcastService.postMessage({
            payload: {
                customEventName: "TestEvent",
                customEventValue: "TestValue"
            }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((fakeFacadeSDK as any).sendMessage).toHaveBeenCalledWith({
            content: "",
            tags: [ "Hidden" ],
            metadata: {
                customEvent: "true",
                customEventName: "TestEvent",
                customEventValue: "TestValue"
            },
            timestamp: expect.any(Date)
        });
    });
});
