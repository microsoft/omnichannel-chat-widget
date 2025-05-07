import { isNullOrEmptyString } from "../../../common/utils";

const validRootDomains = [
    "microsoft.com",
    "microsoft.us",
    "appsplatform.us",
    "powervirtualagents.cn"
];

const isValidSurveyUrl = (url: string) => {
    if (isNullOrEmptyString(url)) {
        return false;
    }

    try {
        const objectUrl = new URL(url);
        if (!objectUrl.origin || objectUrl.origin === "null") {
            return false;
        }

        const validDomain = validRootDomains.find((domain) => objectUrl.origin.endsWith(domain));
        if (validDomain) {
            return true;
        }
    } catch (error) {
        return false;
    }

    return false;
};

export default isValidSurveyUrl;