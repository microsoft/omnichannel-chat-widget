/* eslint-disable @typescript-eslint/no-explicit-any */

import { BroadcastEvent, LogLevel, TelemetryEvent } from "../../telemetry/TelemetryConstants";

import { IContextDataStore } from "../../interfaces/IContextDataStore";
import { StorageType } from "../../Constants";
import { TelemetryHelper } from "../../telemetry/TelemetryHelper";
import { inMemoryDataStore } from "./defaultInMemoryDataStore";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";

export const isCookieAllowed = (isUsingExternalStorage : boolean) => {
    try {
        localStorage;
        sessionStorage;
        return true;
    } catch (error) {
        // no display of TPC warning if alternate storage is defined
        if (!isUsingExternalStorage && !(window as any).TPCWarningLogged) {
            console.warn("Third party cookies blocked.");
            TelemetryHelper.logActionEvent(LogLevel.WARN, {
                Event: TelemetryEvent.ThirdPartyCookiesBlocked,
                Description: "Third party cookies are blocked. Cannot access local storage or session storage."
            });
            (window as any).TPCWarningLogged = true;
        }
        return false;
    }
};

export const defaultClientDataStoreProvider = (cacheTtlinMins = 0, storageType: StorageType = StorageType.localStorage, useExternalStorage?: boolean, timeOut?: number | 1000): IContextDataStore => {
    let ttlInMs = 0;
    const switchToExternalStorage = useExternalStorage || false;
    const timeOutWaitForResponse = timeOut || 1000;

    if (ttlInMs == 0) {
        ttlInMs = cacheTtlinMins * 60 * 1000;
    }

    const dataStoreProvider = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setData: (key: any, data: any) => {
            if (isCookieAllowed(switchToExternalStorage)) {
                try {
                    if (key) {
                        const now = new Date();
                        const item = {
                            data: data,
                            expiry: now.getTime() + ttlInMs,
                        };
                        const strItem = JSON.stringify(item);

                        if (storageType === StorageType.localStorage) {
                            localStorage.setItem(key, strItem);
                        } else {
                            sessionStorage.setItem(key, strItem);
                        }
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
                    messageName: "external:saveData",
                    key: key,
                    data: data,
                    type: (storageType == StorageType.localStorage ? "localStorage" : "sessionStorage")
                };

                //Emit the data to be cached to the external storage
                BroadcastService.postMessage({
                    eventName: BroadcastEvent.NotifyExternalSaveData,
                    payload: dataToCache
                });
            }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getData: (key: any) => {
            if (isCookieAllowed(switchToExternalStorage)) {
                let item;
                if (storageType === StorageType.localStorage) {
                    item = localStorage.getItem(key);
                } else {
                    item = sessionStorage.getItem(key);
                }
                //Return item if not expired
                let itemInJson = undefined;
                if (item !== null) {
                    itemInJson = JSON.parse(item);
                    const now = new Date();
                    // compare the expiry time of the item with the current time
                    if (now.getTime() > itemInJson.expiry) {
                        // If the item is expired, delete the item from storage
                        // and return null
                        localStorage.removeItem(key);
                        return null;
                    }
                    return itemInJson.data;
                }
            } else {
                // get data from in memory db when cookie is disabled
                let result = inMemoryDataStore().getData(key);
                let ack = false;

                // we are not using promise since is not an async function, we are using a while loop to wait for the response
                const waitForResponseOrTimeOut = (miliseconds: number) => {
                    const start = new Date().getTime();
                    const end = start + miliseconds;
                    // eslint-disable-next-line no-empty
                    while ((new Date().getTime() < end) && !ack) {}
                };

                //only switch to events when customer initiates the switch
                if (result === null && switchToExternalStorage) {
                    //we are listening to the event to receive the data from external storage
                    BroadcastService.getMessageByEventName(BroadcastEvent.ReceiveExternalItemData).subscribe((data) => {
                        if (data.payload.key === key) {
                            result = data.payload.data;
                            // we save the data in the in memory db
                            inMemoryDataStore().setData(key, result);
                            //indicates the response was received, we can stop waiting
                            ack = true;
                        }
                    });
                    // we are sending the request to external storage to get the data
                    BroadcastService.postMessage({
                        eventName: BroadcastEvent.RequestExternalItemData,
                        payload: {
                            key: key
                        }
                    });
                    // we are waiting for the response or timeout
                    waitForResponseOrTimeOut(timeOutWaitForResponse);

                    if (!ack){
                        TelemetryHelper.logConfigDataEvent(LogLevel.ERROR, {
                            Event: TelemetryEvent.ClientDataStoreProviderFailed,
                            ExceptionDetails: "External storage did not respond in time for key " + key + ".    Timeout: " + timeOutWaitForResponse + " ms",
                            Description: "External storage did not respond in time for key " + key + ".    Timeout: " + timeOutWaitForResponse + " ms"
                        });
                    }
                }
                return result;
            }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        removeData: (key: any) => {
            if (isCookieAllowed(switchToExternalStorage)) {
                if (key) {
                    if (storageType === StorageType.localStorage) {
                        return localStorage.removeItem(key);
                    } else {
                        return sessionStorage.removeItem(key);
                    }
                }
            } else {
                // get data from in memory db when cookie is disabled
                return inMemoryDataStore().removeData(key);
            }
        }
    };
    return dataStoreProvider;
};