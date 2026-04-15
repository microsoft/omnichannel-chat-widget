import { LogLevel, TelemetryEvent } from "../../../../../common/telemetry/TelemetryConstants";
import { TelemetryHelper } from "../../../../../common/telemetry/TelemetryHelper";

const HTML_TAG_REGEX = /<[a-zA-Z][^>]*>/;
const HTML_TAG_NAME_REGEX = /<([a-zA-Z][a-zA-Z0-9]*)/g;

/**
 * Detects HTML tags in text and logs telemetry if found.
 * Used to track whether any orgs rely on HTML in chat messages
 * before fully suppressing HTML rendering (MSRC 108462 step 1b).
 */
export const logHtmlDetectionTelemetry = (text: string): void => {
    try {
        if (!text || !HTML_TAG_REGEX.test(text)) {
            return;
        }

        // Extract unique tag names (do NOT log content — avoid PII)
        const tagNames = new Set<string>();
        let match;
        while ((match = HTML_TAG_NAME_REGEX.exec(text)) !== null) {
            tagNames.add(match[1].toLowerCase());
        }

        TelemetryHelper.logActionEvent(LogLevel.WARN, {
            Event: TelemetryEvent.HtmlContentDetectedInIncomingMessage,
            ExceptionDetails: {
                ErrorData: `HTML tags detected in incoming message: [${Array.from(tagNames).join(", ")}]`
            }
        });
    } catch {
        // Telemetry must never throw — fail silently
    }
};
