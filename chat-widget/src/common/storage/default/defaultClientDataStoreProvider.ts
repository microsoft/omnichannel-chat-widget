import { inMemoryDataStore } from "./defaultInMemoryDataStore";
import { IContextDataStore } from "../../interfaces/IContextDataStore";
import { TelemetryHelper } from "../../telemetry/TelemetryHelper";
import { LogLevel, TelemetryEvent } from "../../telemetry/TelemetryConstants";

export const defaultClientDataStoreProvider = (): IContextDataStore => {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setData: (key: any, data: any, type: any) => {
            if (isCookieAllowed()) {
                try {
                    if (type === "localStorage") {
                        localStorage.setItem(key, data);
                    } else {
                        sessionStorage.setItem(key, data);
                    }
                } catch (error) {
                    TelemetryHelper.logConfigDataEvent(LogLevel.ERROR, {
                        Event: TelemetryEvent.ClientDataStoreProviderFailed,
                        ExceptionDetails: error,
                        Description: "Unable to store data in localStorage."
                    });
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getData: (key: any, type: any) => {
            if (isCookieAllowed()) {
                if (type === "localStorage") {
                    return localStorage.getItem(key);
                } else {
                    return sessionStorage.getItem(key);
                }
            } else {
                // get data from in memory db when cookie is disabled
                return inMemoryDataStore().getData(key);
            }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        removeData: (key: any, type: any) => {
            if (isCookieAllowed()) {
                if (type === "localStorage") {
                    return localStorage.removeItem(key);
                } else {
                    return sessionStorage.removeItem(key);
                }
            } else {
                // get data from in memory db when cookie is disabled
                return inMemoryDataStore().removeData(key);
            }
        }
    };
    return dataStoreProvider;
};