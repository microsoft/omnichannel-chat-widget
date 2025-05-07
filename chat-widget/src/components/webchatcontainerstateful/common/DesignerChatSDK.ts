import { DesignerChatAdapter } from "./DesignerChatAdapter";
import { MockChatSDK } from "./mockchatsdk";

export class DesignerChatSDK extends MockChatSDK {
    constructor() {
        super();
    }

    public createChatAdapter() {
        return new DesignerChatAdapter();
    }

    public localeId = this.getLiveChatConfig().ChatWidgetLanguage.msdyn_localeid;

    /**
    * If the widget is running in designer mode, we mock the initialize response. We don't want
    * any interactions with a real server in when designing LCW widget visually in Modern Admin.
    *
    * - All GUIDs were changed to 00000000-0000-0000-0000-000000000000.
    * - msdyn_callingoptions was changed to disable calling functionality
    */
    public getLiveChatConfig() {
        return {
            LiveWSAndLiveChatEngJoin: {
                msdyn_widgetthemecolor: "19236002",
                // msdyn_callingoptions was changed to disable calling functionality
                msdyn_callingoptions: "192350000",
                msdyn_widgettitle: "Let\u0027s chat",
                msdyn_conversationmode: "192350000",
                msdyn_avatarurl: "https://oc-cdn-ocprod.azureedge.net/livechatwidget/images/chatIcon.svg",
                msdyn_name: "Let's Chat",
                msdyn_postconversationsurveyenable: "false",
                OutOfOperatingHours: "False",
                ShowWidget: "True",
            },
            ChatWidgetLanguage: {
                msdyn_localeid: "1033",
                msdyn_languagename: "English - United States"
            },
        };
    }
}
