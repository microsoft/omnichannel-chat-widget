import { Dispatch } from "react";
import { IInternalTelemetryData } from "../../../common/telemetry/interfaces/IInternalTelemetryData";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { ITelemetryConfig } from "../../../common/telemetry/interfaces/ITelemetryConfig";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { RegisterLoggers, TelemetryManager } from "../../../common/telemetry/TelemetryManager";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { defaultAriaConfig } from "../../../common/telemetry/defaultConfigs/defaultAriaConfig";
import { defaultInternalTelemetryData } from "../../../common/telemetry/defaultConfigs/defaultTelemetryInternalData";
import { defaultTelemetryConfiguration } from "../../../common/telemetry/defaultConfigs/defaultTelemetryConfiguration";

import { version as chatComponentVersion } from "@microsoft/omnichannel-chat-components/package.json";
import { version as chatSdkVersion } from "@microsoft/omnichannel-chat-sdk/package.json";

export const registerTelemetryLoggers = (props: ILiveChatWidgetProps, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    let widgetPackageInfo;
    try {
        widgetPackageInfo = require("@microsoft/omnichannel-chat-widget/package.json");
    } catch (error) {
        widgetPackageInfo = "0.0.0-0";
    }
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
        telemetryData.OCChatSDKVersion = chatSdkVersion;
        telemetryData.chatComponentVersion = chatComponentVersion;
        telemetryData.chatWidgetVersion = widgetPackageInfo;
        telemetryData.orgId = props.chatSDK?.omnichannelConfig?.orgId;
        telemetryData.widgetId = props.chatSDK?.omnichannelConfig?.widgetId;
        telemetryData.orgUrl = props.chatSDK?.omnichannelConfig?.orgUrl;
        dispatch({ type: LiveChatWidgetActionType.SET_TELEMETRY_DATA, payload: telemetryData });
    }
    RegisterLoggers();
};