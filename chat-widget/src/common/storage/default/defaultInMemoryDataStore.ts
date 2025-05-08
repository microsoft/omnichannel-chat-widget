import { LogLevel, TelemetryEvent } from "../../telemetry/TelemetryConstants";
import { TelemetryHelper } from "../../telemetry/TelemetryHelper";
import { defaultCacheManager } from "./defaultCacheManager";

export const defaultInitializeInMemoryDataStore = (widgetId: string) => {
    try {
        localStorage;
    } catch (error) {
        // Register below events when localStorage is not accessible
        // Listening to event raised from client browser
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.addEventListener("message", function (e: any) {
            try {
                if (e.data.key) {
                    const browserData = e.data;
                    if (defaultCacheManager.InternalCache[browserData.key]) {
                        delete defaultCacheManager.InternalCache[browserData.key];
                    }
                    defaultCacheManager.InternalCache[browserData.key] = browserData.data;
                }
            } catch (error) {
                TelemetryHelper.logConfigDataEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.InMemoryDataStoreFailed,
                    ExceptionDetails: error,
                    Description: "Unable to register default in-memory cache."
                });
            }
        });

        // send cache initialize message to client
        if (defaultCacheManager.InternalCache === undefined || {}) {
            parent.postMessage({ data: "cacheinitialize", widgetId: widgetId }, "*");
        }
    }
};

export const inMemoryDataStore = () => {
    const dataStoreProvider = {
        getData: (key: string) => {
            if (defaultCacheManager.InternalCache && defaultCacheManager.InternalCache[key]) {
                return defaultCacheManager.InternalCache[key];
            }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setData: (key: any, data: any) => {
            try {
                defaultCacheManager.InternalCache[key] = data;
            } catch (error) {
                TelemetryHelper.logConfigDataEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.InMemoryDataStoreFailed,
                    ExceptionDetails: error,
                    Description: "Unable to set data in default in-memory cache."
                });
            }
        },
        removeData: (key: string) => {
            try {
                defaultCacheManager.InternalCache[key] = {};
            } catch (error) {
                TelemetryHelper.logConfigDataEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.InMemoryDataStoreFailed,
                    ExceptionDetails: error,
                    Description: "Unable to remove data from default in-memory cache."
                });
            }
        }
    };
    return dataStoreProvider;
};