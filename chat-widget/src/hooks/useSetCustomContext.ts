import { LogLevel, TelemetryEvent } from "../common/telemetry/TelemetryConstants";
import { getStateFromCache, getWidgetCacheIdfromProps, isNullOrEmptyString, isUndefinedOrEmpty } from "../common/utils";

import { Constants } from "../common/Constants";
import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../components/livechatwidget/interfaces/ILiveChatWidgetProps";
import { TelemetryHelper } from "../common/telemetry/TelemetryHelper";
import useChatContextStore from "./useChatContextStore";

const useSetCustomContext = (props: ILiveChatWidgetProps, widgetInstanceId?: string) => {
    const [state, ]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getInitContextParamsForPopout = async (): Promise<any> => {
        return window.opener ? await getInitContextParamForPopoutFromOuterScope(window.opener) : null;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getInitContextParamForPopoutFromOuterScope = async (scope: any): Promise<any> =>  {
        let payload;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let waitPromiseResolve: any;
        const waitPromise = new Promise((res, rej) => {
            waitPromiseResolve = res;
            setTimeout(() => rej("Failed to find method in outer scope"), 5000);
        }).catch((rej) => console.warn(rej));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getInitContextParamsFromParent = (e: any) => {
            if (e.data && e.data.messageName == Constants.InitContextParamsResponse) {
                payload = e.data.payload;
                waitPromiseResolve();
            }
        };

        window.addEventListener("message", getInitContextParamsFromParent, false);
        scope.postMessage({ messageName: Constants.InitContextParamsRequest }, "*");
        await waitPromise;
        window.removeEventListener("message", getInitContextParamsFromParent, false);
        return payload;
    };

    const setCustomContextParams = async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isAuthenticatedChat = (props?.chatConfig?.LiveChatConfigAuthSettings as any)?.msdyn_javascriptclientfunction ? true : false;
        
        // Should not set custom context for auth chat
        if (isAuthenticatedChat) {
            return;
        }

        if (state.domainStates.customContext) {
            return state.domainStates.customContext;
        }
        
        if (isNullOrEmptyString(widgetInstanceId)) {
            widgetInstanceId = getWidgetCacheIdfromProps(props);
        }

        // Look in cache if state doesn't have context
        const persistedState = getStateFromCache(widgetInstanceId as string);
        const customContextLocal = persistedState?.domainStates?.customContext ?? props?.initialCustomContext;
        if (customContextLocal) {
            TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
                Event: TelemetryEvent.SettingCustomContext,
                Description: "Setting custom context for unauthenticated chat"
            });

            return customContextLocal;
        } else {
            const customContextFromParent = await getInitContextParamsForPopout();
            if (!isUndefinedOrEmpty(customContextFromParent?.contextVariables)) {
                return customContextFromParent.contextVariables;
            }
        }
    };

    return setCustomContextParams;
};

export default useSetCustomContext;