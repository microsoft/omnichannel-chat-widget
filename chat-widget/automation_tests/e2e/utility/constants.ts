export enum CustomLiveChatWidgetConstants {
  CustomLiveChatWidgetFilePath = "customlivechatwidgets/CustomLiveChatWidget.html",
  LiveChatButtonId = "#oc-lcw-chat-button-title",
  DefaultTimeout = 1000
}

export const DiagnosticData = [
    "timestamp",
    "activeProviderName",
    "ClientUrl",
    "AppUrl",
    "OrgLcid",
    "OrgUniqueName",
    "OrgId",
    "UserLcid",
    "UserRoles",
    "crmVersion",
    "TenantId",
    "ocApiUrl",
    "conversationId",
    "sessionId",
    "conversationType",
    "transactionParameters",
    "liveWorkItemId",
    "channelId",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const stringFormat = (str: string, ...args: any[]) =>
    str.replace(/{(\d+)}/g, (match, index) => args[index].toString() || "");
