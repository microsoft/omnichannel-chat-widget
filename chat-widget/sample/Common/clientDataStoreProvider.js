import { Constants } from "./Constants";
import { memoryDataStore } from "./MemoryDataStore";

export const clientDataStoreProvider = () => {
    const _memoryDataStore = memoryDataStore();

    const isCookieAllowed = () => {
        try {
            localStorage;
            sessionStorage;
            return true;
        } catch (error) {
            console.error("Third party cookie blocked");
            return false;
        }
    };

    const dataStoreProvider = {
        setData: (key, data, type) => {
            if (isCookieAllowed()) {
                try {
                    if (type === Constants.LocalStorage) {
                        localStorage.setItem(key, data);
                    } else {
                        sessionStorage.setItem(key, data);
                    }
                } catch (error) {
                    console.error("logging third-party failed!");
                }
            } else {
                const dataToCache = {
                    key: key,
                    data: data,
                    type: type
                };
                parent.postMessage(dataToCache, "*");
            }
        },
        getData: (key, type) => {
            if (isCookieAllowed()) {
                if (type === Constants.LocalStorage) {
                    return localStorage.getItem(key);
                } else {
                    return sessionStorage.getItem(key);
                }
            } else {
                // get data from in memory db when cookie is disabled
                _memoryDataStore.getData(key);
            }

        }
    };
    return dataStoreProvider;
};