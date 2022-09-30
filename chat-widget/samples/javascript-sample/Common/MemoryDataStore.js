import { Constants } from "./Constants";

export const memoryDataStore = () => {
    var internalCache = {};

    // Listening to event raised from client browser
    window.addEventListener(Constants.WidgetStateUpdatedOnClientEvent, function (e) {
        const browserData = e.detail;
        if (internalCache[browserData.key]) {
            delete internalCache[browserData.key];
        }
        internalCache[browserData.key] = browserData.data;
    });

    const dataStoreProvider = {
        getData: (key) => {
            return internalCache[key];
        },
        setData: (key, data) => {
            internalCache[key] = data;
        }
    };
    return dataStoreProvider;
};