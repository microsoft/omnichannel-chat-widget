import { Constants } from "./Constants";

export const browserDataStoreProvider = () => {
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
            }
        },
        getData: (key, type) => {
            if (type === Constants.LocalStorage) {
                return localStorage.getItem(key);
            } else {
                return sessionStorage.getItem(key);
            }
        }
    };
    return dataStoreProvider;
};