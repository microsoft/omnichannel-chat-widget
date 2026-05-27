import { sanitizeSasInPayload } from "../sanitizeSasInPayload";

describe("sanitizeSasInPayload", () => {
    const SAMPLE_SIG = "J%2BI1lqYeZ7RWT0TyoIYiyjCUhbApccqKMMGiqCUnn%2Bk%3D";

    it("redacts sig and all SAS params in a typical blob SAS URL", () => {
        const url = `https://example.blob.core.windows.net/c/file.png?sp=r&st=2026-05-20T20:57:08Z&se=2036-05-21T05:12:08Z&spr=https&sv=2026-02-06&sr=b&sig=${SAMPLE_SIG}`;
        const out = sanitizeSasInPayload(url);
        expect(out).not.toContain(SAMPLE_SIG);
        expect(out).toContain("sig=[REDACTED]");
        expect(out).toContain("sv=[REDACTED]");
        expect(out).toContain("se=[REDACTED]");
        expect(out).toContain("sp=[REDACTED]");
        expect(out).toContain("spr=[REDACTED]");
        expect(out).toContain("sr=[REDACTED]");
        expect(out).toContain("st=[REDACTED]");
        // URL base remains intact for debuggability
        expect(out).toContain("https://example.blob.core.windows.net/c/file.png");
    });

    it("does not touch non-SAS URLs with query params", () => {
        const url = "https://example.com/path?utm_source=docs&page=2&q=hello";
        expect(sanitizeSasInPayload(url)).toBe(url);
    });

    it("does not touch URLs without a query string", () => {
        const url = "https://example.com/path/to/asset.png";
        expect(sanitizeSasInPayload(url)).toBe(url);
    });

    it("redacts user-delegation SAS parameters", () => {
        const url = `https://x.blob.core.windows.net/c/f.png?skoid=abc&sktid=def&skt=2026-01-01&ske=2026-12-31&sks=b&skv=2026-02-06&sig=${SAMPLE_SIG}`;
        const out = sanitizeSasInPayload(url);
        expect(out).toContain("skoid=[REDACTED]");
        expect(out).toContain("sktid=[REDACTED]");
        expect(out).toContain("skt=[REDACTED]");
        expect(out).toContain("ske=[REDACTED]");
        expect(out).toContain("sks=[REDACTED]");
        expect(out).toContain("skv=[REDACTED]");
        expect(out).toContain("sig=[REDACTED]");
    });

    it("redacts account SAS and response-header-override parameters", () => {
        const url = `https://x.blob.core.windows.net/?ss=b&srt=sco&sp=rwdlac&rscc=no-cache&rscd=attachment&sig=${SAMPLE_SIG}`;
        const out = sanitizeSasInPayload(url);
        expect(out).toContain("ss=[REDACTED]");
        expect(out).toContain("srt=[REDACTED]");
        expect(out).toContain("sp=[REDACTED]");
        expect(out).toContain("rscc=[REDACTED]");
        expect(out).toContain("rscd=[REDACTED]");
    });

    it("preserves non-SAS params alongside SAS params in the same query", () => {
        const url = `https://x.blob.core.windows.net/c/f.png?versionId=2026-05-20&sv=2026-02-06&sig=${SAMPLE_SIG}`;
        const out = sanitizeSasInPayload(url);
        expect(out).toContain("versionId=2026-05-20"); // unknown param passes through
        expect(out).toContain("sv=[REDACTED]");
        expect(out).toContain("sig=[REDACTED]");
    });

    it("is case-insensitive for SAS parameter names", () => {
        const url = `https://x.blob.core.windows.net/c/f.png?SIG=${SAMPLE_SIG}&SV=2026-02-06`;
        const out = sanitizeSasInPayload(url);
        expect(out).toContain("SIG=[REDACTED]");
        expect(out).toContain("SV=[REDACTED]");
    });

    it("redacts multiple SAS URLs inside a single string", () => {
        const text = `Icon: https://a.blob.core.windows.net/i/x.png?sv=2026-02-06&sig=${SAMPLE_SIG} and avatar https://b.blob.core.windows.net/a/y.png?sv=2026-02-06&sig=${SAMPLE_SIG}`;
        const out = sanitizeSasInPayload(text);
        expect(out.match(/sig=\[REDACTED\]/g)?.length).toBe(2);
        expect(out).not.toContain(SAMPLE_SIG);
    });

    it("walks nested objects and arrays", () => {
        const payload = {
            Event: "PropsReceived",
            CustomProperties: {
                headerProps: {
                    controlProps: {
                        headerIconProps: {
                            src: `https://x.blob.core.windows.net/i/h.png?sv=2026-02-06&sig=${SAMPLE_SIG}`,
                            alt: "icon"
                        }
                    }
                },
                assets: [
                    `https://a.blob.core.windows.net/a.png?sv=2026-02-06&sig=${SAMPLE_SIG}`,
                    "https://example.com/clean.png"
                ]
            }
        };
        const out = sanitizeSasInPayload(payload);
        const headerSrc = out.CustomProperties.headerProps.controlProps.headerIconProps.src as string;
        expect(headerSrc).toContain("sig=[REDACTED]");
        expect(headerSrc).not.toContain(SAMPLE_SIG);
        expect((out.CustomProperties.assets as string[])[0]).toContain("sig=[REDACTED]");
        expect((out.CustomProperties.assets as string[])[1]).toBe("https://example.com/clean.png");
        // Non-string siblings untouched
        expect(out.Event).toBe("PropsReceived");
        expect(out.CustomProperties.headerProps.controlProps.headerIconProps.alt).toBe("icon");
    });

    it("passes through non-string primitives unchanged", () => {
        expect(sanitizeSasInPayload(42)).toBe(42);
        expect(sanitizeSasInPayload(true)).toBe(true);
        expect(sanitizeSasInPayload(null)).toBe(null);
        expect(sanitizeSasInPayload(undefined)).toBe(undefined);
    });

    it("does not mutate the input object", () => {
        const sigUrl = `https://x.blob.core.windows.net/c/f.png?sv=2026-02-06&sig=${SAMPLE_SIG}`;
        const original = { url: sigUrl, nested: { also: sigUrl } };
        const out = sanitizeSasInPayload(original);
        expect(original.url).toBe(sigUrl);
        expect(original.nested.also).toBe(sigUrl);
        expect(out.url).toContain("sig=[REDACTED]");
        expect(out.nested.also).toContain("sig=[REDACTED]");
    });

    it("does not falsely match a literal 'sig=' substring outside any URL", () => {
        // Without an http(s):// prefix, the regex must not match — bare strings can
        // legitimately contain the substring 'sig=' (e.g. variable names, error text).
        const input = "config validation failed: invalid signature (sig=missing)";
        expect(sanitizeSasInPayload(input)).toBe(input);
    });

    it("handles an empty/no-op payload", () => {
        expect(sanitizeSasInPayload("")).toBe("");
        expect(sanitizeSasInPayload({})).toEqual({});
        expect(sanitizeSasInPayload([])).toEqual([]);
    });

    it("strips the URL substring out of a longer enclosing string", () => {
        const wrapped = `error fetching <https://x.blob.core.windows.net/c/f.png?sv=2026-02-06&sig=${SAMPLE_SIG}>: 403`;
        const out = sanitizeSasInPayload(wrapped);
        expect(out).not.toContain(SAMPLE_SIG);
        expect(out).toContain("sig=[REDACTED]");
        expect(out.startsWith("error fetching <")).toBe(true);
        expect(out.endsWith(">: 403")).toBe(true);
    });
});
