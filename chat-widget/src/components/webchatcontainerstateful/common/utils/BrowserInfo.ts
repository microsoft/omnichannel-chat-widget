import { BrowserVendor } from "../../webchatcontroller/enums/BrowserVendor";

const REGEX_VERSION = "([\\d,.]+)";
const UNKNOWN_VERSION = "U";
let userAgent: string | undefined = undefined;

export const getUserAgent = (): string => {
    if (!userAgent){
        userAgent = window.navigator.userAgent;
    }
    
    return userAgent;
};

const userAgentContainsString = (searchString: string): boolean => {
    const userAgent: string = getUserAgent();
    return userAgent.indexOf(searchString) > -1;
};

const isEdge = (): boolean => {
    return userAgentContainsString(BrowserVendor.EDGE) ||
        userAgentContainsString(BrowserVendor.EDGE_CHROMIUM);
};

export const isChromiumEdge = (): boolean => {
    return userAgentContainsString(BrowserVendor.EDGE_CHROMIUM) &&
        !userAgentContainsString(BrowserVendor.EDGE);
};

const isOpera = (): boolean => {
    return userAgentContainsString("OPR/");
};

export const getBrowserName = (): BrowserVendor => {
    if (isOpera()) {
        return BrowserVendor.OPERA;
    }

    if (isEdge()) {
        return BrowserVendor.EDGE;
    }

    if (userAgentContainsString(BrowserVendor.CHROME)) {
        return BrowserVendor.CHROME;
    }

    if (userAgentContainsString(BrowserVendor.FIREFOX)) {
        return BrowserVendor.FIREFOX;
    }

    if (userAgentContainsString(BrowserVendor.SAFARI)) {
        return BrowserVendor.SAFARI;
    }

    return BrowserVendor.UNKNOWN;
};

export const getBrowserVersion = (): string | undefined => {
    let browserString : string | BrowserVendor = getBrowserName();
    const browserVersion : string = UNKNOWN_VERSION;
    let matches: RegExpMatchArray | null;

    if (browserString === BrowserVendor.SAFARI) {
        browserString = "Version";
    }

    // eslint-disable-next-line prefer-const
    matches = getUserAgent().match(new RegExp(browserString + "/" + REGEX_VERSION));

    if (matches) {
        return matches[1];
    }

    return browserVersion;   
};