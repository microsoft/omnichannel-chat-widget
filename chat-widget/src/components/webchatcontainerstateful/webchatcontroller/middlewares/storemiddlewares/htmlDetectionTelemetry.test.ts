import { TelemetryHelper } from "../../../../../common/telemetry/TelemetryHelper";
import { logHtmlDetectionTelemetry } from "./htmlDetectionTelemetry";

jest.mock("../../../../../common/telemetry/TelemetryHelper", () => ({
    TelemetryHelper: {
        logActionEvent: jest.fn()
    }
}));

describe("logHtmlDetectionTelemetry", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should not log telemetry for plain text", () => {
        logHtmlDetectionTelemetry("Just a normal message");

        expect(TelemetryHelper.logActionEvent).not.toHaveBeenCalled();
    });

    it("should log telemetry when <img> tag is detected", () => {
        logHtmlDetectionTelemetry("Check this <img src=x> image");

        expect(TelemetryHelper.logActionEvent).toHaveBeenCalledTimes(1);
        const callArgs = (TelemetryHelper.logActionEvent as jest.Mock).mock.calls[0];
        expect(callArgs[1].ExceptionDetails.ErrorData).toContain("img");
    });

    it("should log all unique tag names when multiple tags are present", () => {
        logHtmlDetectionTelemetry("Bad <img src=x><script>alert(1)</script><div>stuff</div>");

        expect(TelemetryHelper.logActionEvent).toHaveBeenCalledTimes(1);
        const errorData = (TelemetryHelper.logActionEvent as jest.Mock).mock.calls[0][1].ExceptionDetails.ErrorData;
        expect(errorData).toContain("img");
        expect(errorData).toContain("script");
        expect(errorData).toContain("div");
    });

    it("should not log telemetry for empty string", () => {
        logHtmlDetectionTelemetry("");

        expect(TelemetryHelper.logActionEvent).not.toHaveBeenCalled();
    });

    it("should not throw and not log for null or undefined input", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => logHtmlDetectionTelemetry(null as any)).not.toThrow();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => logHtmlDetectionTelemetry(undefined as any)).not.toThrow();

        expect(TelemetryHelper.logActionEvent).not.toHaveBeenCalled();
    });
});
