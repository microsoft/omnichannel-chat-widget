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
        console.log("Initializing LazyLoadObserver...");
        if (LazyLoadHandler.initialized) {
            console.log("LazyLoadObserver already initialized.");
            return;
        }

        const callback: IntersectionObserverCallback = (entries: IntersectionObserverEntry[]) => {
            console.log("IntersectionObserver callback triggered.", entries);
            if (LazyLoadHandler.paused) {
                console.log("LazyLoadHandler is paused. Ignoring callback.");
                return;
            }

            entries.forEach(entry => {
                console.log("Intersection entry:", entry);
                if (entry.isIntersecting && entry.intersectionRatio > 0) {
                    console.log("Element is intersecting. Fetching persistent chat history.");
                    dispatchCustomEvent(ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY);

                    LazyLoadHandler.paused = true;
                    setTimeout(() => {
                        LazyLoadHandler.moveScrollDown();
                        LazyLoadHandler.paused = false;

                        setTimeout(() => {
                            LazyLoadHandler.reset();
                        }, 1000);
                    }, 2000);
                } else if (!entry.isIntersecting) {
                    console.log("Element is not intersecting. No action taken.");
                }
            });
        };

        const setupObserver = () => {
            console.log("Setting up IntersectionObserver...");
            const webchatContainer = document.querySelector(".webchat__basic-transcript__scrollable");
            const rootContainer = document.getElementById(LazyLoadHandler.rootId);

            if (!webchatContainer && !rootContainer) {
                console.error("Neither webchatContainer nor rootContainer found. Observer setup failed.");
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
                console.log("Target element found. Observing:", targetElement);
                observer.observe(targetElement);
                LazyLoadHandler.observer = observer;
            } else {
                console.error("Target element not found. Observer setup incomplete.");
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
        console.log("Attempting to move scroll down...");
        const scrollContainer = document.querySelector(".webchat__basic-transcript__scrollable") as HTMLElement;

        if (!scrollContainer) {
            console.warn("Scroll container not found. Falling back to root container.");
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
        console.log("Adjusting scroll for container:", scrollContainer);
        const currentScrollTop = scrollContainer.scrollTop;
        const moveDownBy = 35;

        scrollContainer.scrollTop = currentScrollTop + moveDownBy;
        console.log(`Scroll moved down by ${moveDownBy}px. New scrollTop: ${scrollContainer.scrollTop}`);
    }

    public static reset() {
        console.log("Resetting LazyLoadHandler...");
        LazyLoadHandler.unmount();
        LazyLoadHandler.initialized = false;
        setTimeout(() => {
            LazyLoadHandler.useLazyLoadObserver();
        }, 100);
    }

    public static unmount() {
        console.log("Unmounting LazyLoadHandler...");
        const targetElement = document.getElementById(LazyLoadHandler.targetId);
        if (targetElement) {
            LazyLoadHandler.observer?.unobserve(targetElement);
            console.log("Observer unobserved target element.");
        }

        LazyLoadHandler.observer = null;
        LazyLoadHandler.initialized = false;
        LazyLoadHandler.paused = false;
    }
}

const LazyLoadActivity = () => {
    const style: React.CSSProperties = {
        visibility: "visible",
        height: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "12px",
        color: "#666",
        backgroundColor: "rgba(0,0,0,0.05)",
        borderRadius: "10px",
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
                ↑ Scroll up to load more messages (click to test)
            </div>
        </>
    );
};

export default LazyLoadActivity;