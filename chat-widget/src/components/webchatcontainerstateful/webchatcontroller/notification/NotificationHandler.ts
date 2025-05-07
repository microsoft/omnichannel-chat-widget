import { HtmlClassNames, HtmlIdNames } from "../../../../common/Constants";

import { NotificationLevel } from "../enums/NotificationLevel";
import { WebChatActionType } from "../enums/WebChatActionType";
import { WebChatStoreLoader } from "../WebChatStoreLoader";
import { setFocusOnSendBox } from "../../../../common/utils";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { BroadcastEvent } from "../../../../common/telemetry/TelemetryConstants";

export class NotificationHandler {
    private static notify(id: string, level: NotificationLevel, message: string) {
        if (WebChatStoreLoader.store) {
            WebChatStoreLoader.store.dispatch({
                type: WebChatActionType.WEB_CHAT_SET_NOTIFICATION,
                payload: {
                    id,
                    level,
                    message
                }
            });
            NotificationHandler.setFocusOnNotificationCloseButton();
        }
    }

    public static dismissNotification(id: string) {
        if (WebChatStoreLoader.store) {
            WebChatStoreLoader.store.dispatch({
                type: WebChatActionType.WEB_CHAT_DISMISS_NOTIFICATION,
                payload: {
                    id
                }
            });
        }
    }

    public static notifyError(id: string, message: string) {
        BroadcastService.postMessage({
            eventName: BroadcastEvent.OnWidgetError,
            payload: {
                errorMessage: message
            }
        });
        
        this.notify(id, NotificationLevel.Error, message);
    }

    public static notifyWarning(id: string, message: string) {
        this.notify(id, NotificationLevel.Warning, message);
    }

    public static notifyInfo(id: string, message: string) {
        this.notify(id, NotificationLevel.Info, message);
    }

    public static notifySuccess(id: string, message: string) {
        this.notify(id, NotificationLevel.Success, message);
    }

    public static notifyWithLevel(id: string, message: string, level: NotificationLevel) {
        if (!level) {
            this.notifyInfo(id, message);
        } else {
            this.notify(id, level, message);
        }
    }

    /* Bypass WebChat behavior and focus on banner close button */
    private static setFocusOnNotificationCloseButton() {
        const expandButton: HTMLButtonElement = document.querySelector(`#${HtmlIdNames.MSLiveChatWidget} .${HtmlClassNames.webChatBannerExpandButton}`) as HTMLButtonElement;
        if (expandButton) {
            expandButton.focus();
            return;
        }

        const closeButton: HTMLButtonElement = document.querySelector(`#${HtmlIdNames.MSLiveChatWidget} .${HtmlClassNames.webChatBannerCloseButton}`) as HTMLButtonElement;
        if (closeButton) {
            closeButton.focus();
            NotificationHandler.registerOnCloseEvent(closeButton);
            return;
        }
    }

    private static registerOnCloseEvent(button: HTMLButtonElement) {
        button.onclick = () => {
            setFocusOnSendBox();
        };
    }
}