/**
 * Redacts the values of Azure Shared Access Signature (SAS) query parameters in any
 * URL embedded in a telemetry payload, so customer-supplied SAS URLs (e.g. blob asset
 * URLs in widget customization props) cannot leak credentials through Aria/AppInsights.
 *
 * Trigger: any URL whose query string contains `sig=`. When detected, every well-known
 * SAS parameter value in that query is replaced with `[REDACTED]`. Other URLs and other
 * substrings of the payload pass through unchanged.
 *
 * Coverage of SAS parameter names:
 *  - Service/Blob SAS:        sig, sv, se, st, sp, spr, sr, sip
 *  - Account SAS:             ss, srt
 *  - User-delegation key SAS: skoid, sktid, skt, ske, sks, skv, saoid, suoid, sce, sdd
 *  - Response header overrides: rscc, rscd, rsce, rscl, rsct
 *
 * Reference: https://learn.microsoft.com/en-us/rest/api/storageservices/create-service-sas
 */

const SAS_PARAM_NAMES = new Set<string>([
    "sig", "sv", "se", "st", "sp", "spr", "sr", "sip",
    "ss", "srt",
    "skoid", "sktid", "skt", "ske", "sks", "skv", "saoid", "suoid", "sce", "sdd",
    "rscc", "rscd", "rsce", "rscl", "rsct"
]);

const REDACTED_VALUE = "[REDACTED]";

// Matches any http(s) URL substring up to whitespace / closing quote / angle-bracket / paren.
const URL_REGEX = /\bhttps?:\/\/[^\s"'<>)]+/gi;

const redactQueryIfSas = (url: string): string => {
    const queryIdx = url.indexOf("?");
    if (queryIdx < 0) {
        return url;
    }
    const query = url.slice(queryIdx + 1);
    if (!/(^|&)sig=/i.test(query)) {
        // No SAS signature present — leave the URL alone so legitimate non-SAS query
        // strings (e.g. ?utm_source=...) are not mangled.
        return url;
    }
    const base = url.slice(0, queryIdx);
    const sanitizedQuery = query.split("&").map(pair => {
        const eqIdx = pair.indexOf("=");
        if (eqIdx < 0) {
            return pair;
        }
        const name = pair.slice(0, eqIdx).toLowerCase();
        return SAS_PARAM_NAMES.has(name) ? `${pair.slice(0, eqIdx)}=${REDACTED_VALUE}` : pair;
    }).join("&");
    return `${base}?${sanitizedQuery}`;
};

const sanitizeString = (s: string): string => s.replace(URL_REGEX, redactQueryIfSas);

/**
 * Deep-walk a value and redact SAS credentials in any string it contains.
 * Returns a new object/array (originals are not mutated); non-string leaves are
 * passed through. Tree-shaped, JSON-like values only — not designed for class
 * instances, prototype-bound objects, or cyclic graphs.
 */
export const sanitizeSasInPayload = <T>(value: T): T => {
    if (typeof value === "string") {
        return sanitizeString(value) as unknown as T;
    }
    if (Array.isArray(value)) {
        return value.map(sanitizeSasInPayload) as unknown as T;
    }
    if (value !== null && typeof value === "object") {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
            out[k] = sanitizeSasInPayload(v);
        }
        return out as unknown as T;
    }
    return value;
};
