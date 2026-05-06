import { HtmlClassNames, HtmlIdNames } from "../../../../common/Constants";

import { NotificationLevel } from "../enums/NotificationLevel";
import { WebChatActionType } from "../enums/WebChatActionType";
import { WebChatStoreLoader } from "../WebChatStoreLoader";
import { setFocusOnSendBox } from "../../../../common/utils";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { BroadcastEvent } from "../../../../common/telemetry/TelemetryConstants";

const LIVE_REGION_ID = "oc-lcw-notification-live-region";
const LIVE_REGION_CLEAR_DELAY_MS = 1000;

export class NotificationHandler {
    private static clearTimeoutId: ReturnType<typeof setTimeout> | undefined;
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
            NotificationHandler.announceToScreenReader(message);
            NotificationHandler.setFocusOnNotificationCloseButton();
        }
    }

    /**
     * Announces a message immediately to screen readers via an aria-live="assertive" region.
     * This ensures notifications interrupt the current screen reader output
     * instead of waiting for it to finish reading other content.
     */
    private static announceToScreenReader(message: string) {
        let liveRegion = document.getElementById(LIVE_REGION_ID);
        if (!liveRegion) {
            liveRegion = document.createElement("div");
            liveRegion.id = LIVE_REGION_ID;
            liveRegion.setAttribute("aria-live", "assertive");
            liveRegion.setAttribute("role", "alert");
            liveRegion.setAttribute("aria-atomic", "true");
            // Visually hidden but accessible to screen readers
            liveRegion.style.position = "absolute";
            liveRegion.style.width = "1px";
            liveRegion.style.height = "1px";
            liveRegion.style.overflow = "hidden";
            liveRegion.style.clip = "rect(0 0 0 0)";
            liveRegion.style.clipPath = "inset(50%)";
            liveRegion.style.whiteSpace = "nowrap";

            const widgetContainer = document.getElementById(HtmlIdNames.MSLiveChatWidget);
            (widgetContainer || document.body).appendChild(liveRegion);
        }

        // Clear first, then set after a microtask so the browser detects the change
        // even when the same message is announced consecutively.
        liveRegion.textContent = "";
        requestAnimationFrame(() => {
            if (liveRegion) {
                liveRegion.textContent = message;
            }
        });

        // Cancel any previous clear timer to avoid prematurely clearing a newer message
        if (NotificationHandler.clearTimeoutId) {
            clearTimeout(NotificationHandler.clearTimeoutId);
        }

        // Clear the live region after a delay so repeated identical messages still trigger
        NotificationHandler.clearTimeoutId = setTimeout(() => {
            if (liveRegion) {
                liveRegion.textContent = "";
            }
        }, LIVE_REGION_CLEAR_DELAY_MS);
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