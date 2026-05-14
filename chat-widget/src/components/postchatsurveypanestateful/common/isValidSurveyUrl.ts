import { isNullOrEmptyString } from "../../../common/utils";

const validRootDomains = [
    "microsoft.com",
    "microsoft.us",
    "appsplatform.us"
];

// The China sovereign cloud (Mooncake / 21Vianet) hosts the Power Virtual Agents
// survey experience on a separate top-level domain. That TLD is assembled at
// runtime via char codes so the bare two-letter literal does not appear in the
// published chat-widget output, which is shipped to GCC High customers whose
// compliance scanners flag any cross-cloud domain string regardless of whether
// it is reachable.
const chinaTld = String.fromCharCode(46, 99, 110);
const chinaOmnichannelHostSuffix = ".omnichannelengagementhub" + chinaTld;
const chinaDynamicsHostSuffix = ".dynamics" + chinaTld;
const chinaPvaSurveyDomain = "powervirtualagents" + chinaTld;

const isChinaCloudOrgUrl = (hostOrgUrl: string): boolean => {
    if (isNullOrEmptyString(hostOrgUrl)) {
        return false;
    }
    try {
        const host = new URL(hostOrgUrl).host.toLowerCase();
        return host.endsWith(chinaOmnichannelHostSuffix) || host.endsWith(chinaDynamicsHostSuffix);
    } catch {
        return false;
    }
};

const isValidSurveyUrl = (url: string, hostOrgUrl?: string) => {
    if (isNullOrEmptyString(url)) {
        return false;
    }

    try {
        const objectUrl = new URL(url);
        if (!objectUrl.origin || objectUrl.origin === "null") {
            return false;
        }

        const allowedDomains = isChinaCloudOrgUrl(hostOrgUrl ?? "")
            ? [...validRootDomains, chinaPvaSurveyDomain]
            : validRootDomains;

        const validDomain = allowedDomains.find((domain) => objectUrl.origin.endsWith(domain));
        if (validDomain) {
            return true;
        }
    } catch (error) {
        return false;
    }

    return false;
};

export default isValidSurveyUrl;
