import { RegisterLoggers, TelemetryManager } from "../../../common/telemetry/TelemetryManager";

import { Dispatch } from "react";
import { IInternalTelemetryData } from "../../../common/telemetry/interfaces/IInternalTelemetryData";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { ITelemetryConfig } from "../../../common/telemetry/interfaces/ITelemetryConfig";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { defaultAriaConfig } from "../../../common/telemetry/defaultConfigs/defaultAriaConfig";
import { defaultInternalTelemetryData } from "../../../common/telemetry/defaultConfigs/defaultTelemetryInternalData";
import { defaultTelemetryConfiguration } from "../../../common/telemetry/defaultConfigs/defaultTelemetryConfiguration";

export const registerTelemetryLoggers = (props: ILiveChatWidgetProps, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    const telemetryConfig: ITelemetryConfig = { ...defaultTelemetryConfiguration, ...props.telemetryConfig };
    if (props.liveChatContextFromCache?.domainStates?.telemetryInternalData) {
        TelemetryManager.InternalTelemetryData = props.liveChatContextFromCache?.domainStates?.telemetryInternalData;
    } else {
        let telemetryData: IInternalTelemetryData = {
            ...defaultInternalTelemetryData,
            telemetryConfig: Object.assign({}, defaultTelemetryConfiguration, telemetryConfig),
            ariaConfig: Object.assign({}, defaultAriaConfig, telemetryConfig?.ariaConfigurations)
        };

        if (props.chatConfig) {
            telemetryData = TelemetryHelper.addChatConfigDataToTelemetry(props?.chatConfig, telemetryData);
        }
        telemetryData = TelemetryHelper.addWidgetDataToTelemetry(telemetryConfig, telemetryData);
        telemetryData.OCChatSDKVersion = telemetryConfig.OCChatSDKVersion ?? "0.0.0-0";
        telemetryData.chatComponentVersion = telemetryConfig.chatComponentVersion ?? "0.0.0-0";
        telemetryData.chatWidgetVersion = telemetryConfig.chatWidgetVersion ?? "0.0.0-0";
        telemetryData.orgId = props.chatSDK?.omnichannelConfig?.orgId;
        telemetryData.widgetId = props.chatSDK?.omnichannelConfig?.widgetId;
        telemetryData.orgUrl = props.chatSDK?.omnichannelConfig?.orgUrl;
        TelemetryManager.InternalTelemetryData = telemetryData;

        dispatch({ type: LiveChatWidgetActionType.SET_TELEMETRY_DATA, payload: telemetryData });
    }
    RegisterLoggers();
};