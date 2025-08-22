import React, { useEffect } from "react";

import ChatWidgetEvents from "../../../../../livechatwidget/common/ChatWidgetEvents";
import dispatchCustomEvent from "../../../../../../common/utils/dispatchCustomEvent";

class LazyLoadHandler {
    public static rootId = "ms_lcw_webchat_root";
    public static targetId = "lazy-load-trigger-element";
    public static initialized = false;
    public static paused = false;
    public static observer: IntersectionObserver | null = null;

    public static useLazyLoadObserver() {
        if (LazyLoadHandler.initialized) {
            return;
        }

        const callback: IntersectionObserverCallback = (entries: IntersectionObserverEntry[]) => {
            if (LazyLoadHandler.paused) {
                return;
            }

            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    dispatchCustomEvent(ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY);
                }
            });
        };

        const options: IntersectionObserverInit = {
            root: document.getElementById(LazyLoadHandler.rootId)
        };

        const observer = new IntersectionObserver(callback, options);
        const targetElement = document.getElementById(LazyLoadHandler.targetId);
        if (targetElement) {
            observer.observe(targetElement);
            LazyLoadHandler.observer = observer;
        }
        
        LazyLoadHandler.initialized = true;
    }

    public static unmount() {
        const targetElement = document.getElementById(LazyLoadHandler.targetId);
        if (targetElement) {
            LazyLoadHandler.observer?.unobserve(targetElement);
        }

        LazyLoadHandler.observer = null;
        LazyLoadHandler.initialized = false;
        LazyLoadHandler.paused = false;
    }
}

const LazyLoadActivity = () => {
    const style: React.CSSProperties = {
        visibility: "visible"
    };

    useEffect(() => {
        LazyLoadHandler.useLazyLoadObserver();
        LazyLoadHandler.paused = true; // Pause to prevent unexpected pull during initialization
        setTimeout(() => {
            LazyLoadHandler.paused = false;
        }, 1000);

        return () => {
            LazyLoadHandler.unmount();
        };
    }, []);

    return (
        <>
            <div id={LazyLoadHandler.targetId} style={style}/>
        </>
    );
};

export default LazyLoadActivity;