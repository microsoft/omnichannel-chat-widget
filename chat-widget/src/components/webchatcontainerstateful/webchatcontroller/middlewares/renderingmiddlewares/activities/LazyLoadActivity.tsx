import React, { useEffect } from "react";

import ChatWidgetEvents from "../../../../../livechatwidget/common/ChatWidgetEvents";
import { defaultSystemMessageStyles } from "../defaultStyles/defaultSystemMessageStyles";
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
                if (entry.isIntersecting && entry.intersectionRatio > 0) {
                    dispatchCustomEvent(ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY);
                    LazyLoadHandler.paused = true;
                    setTimeout(() => {
                        LazyLoadHandler.moveScrollDown();
                        LazyLoadHandler.paused = false;
                        setTimeout(() => {
                            LazyLoadHandler.reset();
                        }, 1000);
                    }, 2000);
                }
            });
        };

        const setupObserver = () => {
            console.log("Setting up IntersectionObserver...");
            const webchatContainer = document.querySelector(".webchat__basic-transcript__scrollable");
            const rootContainer = document.getElementById(LazyLoadHandler.rootId);

            if (!webchatContainer && !rootContainer) {
                return;
            }

            const options: IntersectionObserverInit = {
                root: webchatContainer || rootContainer,
                rootMargin: "20px 0px 0px 0px",
                threshold: 0.05
            };

            const observer = new IntersectionObserver(callback, options);
            const targetElement = document.getElementById(LazyLoadHandler.targetId);

            if (targetElement) {
                observer.observe(targetElement);
                LazyLoadHandler.observer = observer;
            }
        };

        const targetElement = document.getElementById(LazyLoadHandler.targetId);
        if (targetElement) {
            setupObserver();
        } else {
            console.warn("Target element not found. Retrying setup after delay.");
            setTimeout(setupObserver, 500);
        }

        LazyLoadHandler.initialized = true;
    }

    public static moveScrollDown() {
        const scrollContainer = document.querySelector(".webchat__basic-transcript__scrollable") as HTMLElement;

        if (!scrollContainer) {
            const fallbackContainer = document.getElementById(LazyLoadHandler.rootId);
            if (!fallbackContainer) {
                console.error("Fallback container not found. Cannot adjust scroll.");
                return;
            }
            LazyLoadHandler.adjustScroll(fallbackContainer);
            return;
        }
        LazyLoadHandler.adjustScroll(scrollContainer);
    }

    public static adjustScroll(scrollContainer: HTMLElement) {
        const currentScrollTop = scrollContainer.scrollTop;
        const moveDownBy = 35;
        scrollContainer.scrollTop = currentScrollTop + moveDownBy;
    }

    public static reset() {
        LazyLoadHandler.unmount();
        LazyLoadHandler.initialized = false;
        setTimeout(() => {
            LazyLoadHandler.useLazyLoadObserver();
        }, 100);
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
        ...defaultSystemMessageStyles,
        visibility: "visible",
        height: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "5px 10px",
        cursor: "pointer"
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
            <div 
                id={LazyLoadHandler.targetId} 
                style={style}
            >
                Retrieving any previous conversations...
            </div>
        </>
    );
};

export default LazyLoadActivity;