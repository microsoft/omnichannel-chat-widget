import { Constants } from "./Constants";

export const contextDataStore = () => {
    const script = document.getElementById("oc-lcw-script");
    const setDataCallbackString = script?.getAttribute("set-data-callback");
    const getDataCallbackString = script?.getAttribute("get-data-callback");

    const setDataCallback = window[setDataCallbackString];
    const getDataCallback = window[getDataCallbackString];

    const thirdPartyCookieEnabled = () => {
        try {
            localStorage;
            sessionStorage;
            return true;
        } catch (error) {
            console.error("Third party cookie blocked");
            return false;
        }
    };

    const thirdPartyContextDataStore = {
        setData: (key, data, type) => {
            try {
                if (type === Constants.LocalStorage) {
                    localStorage.setItem(key, data);
                } else {
                    sessionStorage.setItem(key, data);
                }    
            } catch (error) {
                console.error("logging thirdparty failed!");
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

    const firstPartyContextDataStore = {
        setData: (key, data, type) => {
            if (setDataCallback && typeof setDataCallback == "function") {
                setDataCallback(key, data, type);
            }
        },
        getData: (key, type) => {
            if (getDataCallback && typeof getDataCallback == "function") {
                getDataCallback(key, type);
            }
        }
    };

    return thirdPartyCookieEnabled() ? thirdPartyContextDataStore : firstPartyContextDataStore;
};