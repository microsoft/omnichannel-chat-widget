export const getCustomizationJson = async () => {
    const script = document.getElementById("oc-lcw-script");
    const callbackString = script?.getAttribute("data-customization-callback");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callback = window[callbackString];

    if (callback && typeof callback == "function") {
        try {
            const result = await callback();
            return result;
        } catch {
            return {};
        }
    } else {
        return {};
    }
};