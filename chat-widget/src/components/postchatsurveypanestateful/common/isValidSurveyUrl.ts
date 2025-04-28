const isValidSurveyUrl = (url: string) => {
    try {
        const objectUrl = new URL(url);
        if (!objectUrl.origin || objectUrl.origin === "null") {
            return false;
        }
    } catch (error) {
        return false;
    }
    return true;
};

export default isValidSurveyUrl;