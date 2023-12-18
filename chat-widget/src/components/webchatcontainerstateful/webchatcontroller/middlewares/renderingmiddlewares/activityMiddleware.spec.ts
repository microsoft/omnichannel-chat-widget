import { Constants } from "../../../../../common/Constants";
import { DirectLineActivityType } from "../../enums/DirectLineActivityType";
import { DirectLineSenderRole } from "../../enums/DirectLineSenderRole";
import { MessageTypes } from "../../enums/MessageType";
import { TelemetryHelper } from "../../../../../common/telemetry/TelemetryHelper";
import { createActivityMiddleware } from "./activityMiddleware";

describe("activityMiddleware test", () => {
    it ("createActivityMiddleware() with Channel role sender should returns nothing", () => {
        spyOn(TelemetryHelper, "logActionEvent").and.callFake(() => false);
        const next = (args: any) => () => args; // eslint-disable-line @typescript-eslint/no-explicit-any
        const args = {
            activity: {
                channelData: {
                    type: MessageTypes.Thread
                },
                from: {
                    role: DirectLineSenderRole.Channel
                }
            }
        };

        const results = createActivityMiddleware()()(next)(args);
        expect(results()).toEqual(false);
        expect(TelemetryHelper.logActionEvent).toHaveBeenCalledTimes(0);
    });

    it ("createActivityMiddleware() with Hidden tag should return nothing", () => {
        spyOn(TelemetryHelper, "logActionEvent").and.callFake(() => false);
        const next = (args: any) => () => args; // eslint-disable-line @typescript-eslint/no-explicit-any
        const args = {
            activity: {
                channelData: {
                    tags: [Constants.hiddenTag]
                },
                from: {
                    role: DirectLineSenderRole.User
                }
            }
        };

        const results = createActivityMiddleware()()(next)(args);
        expect(results()).toEqual(false);
        expect(TelemetryHelper.logActionEvent).toHaveBeenCalledTimes(0);
    });

    it ("createActivityMiddleware() with System tag should return system message", () => {
        spyOn(TelemetryHelper, "logActionEvent").and.callFake(() => false);
        const next = (args: any) => () => args; // eslint-disable-line @typescript-eslint/no-explicit-any
        const systemMessage = "system message";
        const args = {
            activity: {
                text: systemMessage,
                channelData: {
                    tags: [Constants.systemMessageTag]
                },
                from: {
                    role: DirectLineSenderRole.User
                }
            }
        };

        const results = createActivityMiddleware()()(next)(args);
        expect(TelemetryHelper.logActionEvent).toHaveBeenCalledTimes(0);
        expect(results().props?.dangerouslySetInnerHTML?.__html).toEqual(systemMessage);
    });

    it ("createActivityMiddleware() should escape html texts to prevent XSS attacks", () => {
        spyOn(TelemetryHelper, "logActionEvent").and.callFake(() => false);
        const next = (args: any) => () => args; // eslint-disable-line @typescript-eslint/no-explicit-any
        const systemMessage = "<img src='' onerror=\"alert('XSS attack')\"/>";
        const args = {
            activity: {
                text: systemMessage,
                channelData: {
                    tags: [Constants.systemMessageTag]
                },
                from: {
                    role: DirectLineSenderRole.User
                }
            }
        };

        const results = createActivityMiddleware()()(next)(args);
        expect(TelemetryHelper.logActionEvent).toHaveBeenCalledTimes(0);
        expect(results().props?.dangerouslySetInnerHTML?.__html).toEqual("&lt;img src=&#39;&#39; onerror=&quot;alert(&#39;XSS attack&#39;)&quot;&#x2F;&gt;");
    });

    it ("createActivityMiddleware() with QueuePosition tag should log QueuePosition message", () => {
        spyOn(TelemetryHelper, "logActionEvent").and.callFake(() => false);
        const next = (args: any) => () => args; // eslint-disable-line @typescript-eslint/no-explicit-any
        const systemMessage = "system message";
        const args = {
            activity: {
                text: systemMessage,
                channelData: {
                    tags: [Constants.systemMessageTag, Constants.queuePositionMessageTag]
                },
                from: {
                    role: DirectLineSenderRole.User
                }
            }
        };

        createActivityMiddleware()()(next)(args);
        expect(TelemetryHelper.logActionEvent).toHaveBeenCalledTimes(1);
    });

    it ("createActivityMiddleware() with same clientmessageid with next activity should return nothing", () => {
        spyOn(TelemetryHelper, "logActionEvent").and.callFake(() => false);
        const next = (args: any) => () => args; // eslint-disable-line @typescript-eslint/no-explicit-any
        const systemMessage = "system message";
        const args = {
            activity: {
                text: systemMessage,
                channelData: {
                    tags: [Constants.systemMessageTag],
                    clientmessageid: "1234"
                },
                from: {
                    role: DirectLineSenderRole.User
                }
            },
            nextVisibleActivity: {
                channelData: {
                    clientmessageid: "1234"
                }
            }
        };

        const results = createActivityMiddleware()()(next)(args);
        expect(results()).toEqual(false);
    });

    it ("createActivityMiddleware() with same messageid with next activity should return nothing", () => {
        spyOn(TelemetryHelper, "logActionEvent").and.callFake(() => false);
        const next = (args: any) => () => args; // eslint-disable-line @typescript-eslint/no-explicit-any
        const systemMessage = "system message";
        const args = {
            activity: {
                text: systemMessage,
                channelData: {
                    tags: [Constants.systemMessageTag]
                },
                from: {
                    role: DirectLineSenderRole.User
                },
                messageid: "1234"
            },
            nextVisibleActivity: {
                messageid: "1234"
            }
        };

        const results = createActivityMiddleware()()(next)(args);
        expect(results()).toEqual(false);
    });

    it ("createActivityMiddleware() should render normal user messages", () => {
        spyOn(TelemetryHelper, "logActionEvent").and.callFake(() => false);
        const next = (args: any) => () => args; // eslint-disable-line @typescript-eslint/no-explicit-any
        const userMessage = "Hello World";
        const args = {
            activity: {
                text: userMessage,
                channelId: "webchat",
                channelData: {
                    isHtmlEncoded: false
                },
                from: {
                    role: DirectLineSenderRole.User
                },
                type: DirectLineActivityType.Message
            }
        };

        const results = createActivityMiddleware()()(next)(args);
        expect(results().props?.children?.activity?.text).toEqual(userMessage);
    });

    it ("createActivityMiddleware() should not render typing messages", () => {
        spyOn(TelemetryHelper, "logActionEvent").and.callFake(() => false);
        const next = (args: any) => () => args; // eslint-disable-line @typescript-eslint/no-explicit-any
        const userMessage = "Hello World";
        const args = {
            activity: {
                text: userMessage,
                channelId: "webchat",
                channelData: {
                    isHtmlEncoded: false
                },
                from: {
                    role: DirectLineSenderRole.User
                },
                type: DirectLineActivityType.Typing
            }
        };

        const results = createActivityMiddleware()()(next)(args);
        expect(results().activity?.text).toEqual(userMessage);
    });
});