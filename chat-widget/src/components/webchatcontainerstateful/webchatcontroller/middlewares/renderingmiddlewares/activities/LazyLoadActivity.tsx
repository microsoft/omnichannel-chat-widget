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

                // Only trigger when element starts intersecting (entering the view)
                if (entry.isIntersecting && entry.intersectionRatio > 0) {
                    dispatchCustomEvent(ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY);
                    
                    // Pause to prevent multiple rapid calls
                    LazyLoadHandler.paused = true;
                    
                    // Simple approach: just move scroll down after a delay
                    setTimeout(() => {
                        LazyLoadHandler.moveScrollDown();
                        LazyLoadHandler.paused = false;
                        
                        // Recreate observer after new content is loaded to ensure it's still working
                        setTimeout(() => {
                            LazyLoadHandler.reset();
                        }, 1000);
                    }, 2000);
                } else if (!entry.isIntersecting) {
                    console.log("LOPEZ  Lazy load:: Element exiting view - no action");
                }
            });
        };

        // Try to find the webchat container, wait a bit if not found
        const setupObserver = () => {
            const webchatContainer = document.querySelector(".webchat__basic-transcript__scrollable");
            const rootContainer = document.getElementById(LazyLoadHandler.rootId);
            

            const options: IntersectionObserverInit = {
                root: webchatContainer || rootContainer,
                rootMargin: "20px 0px 0px 0px", // Reduced to 20px - less than our 30px scroll adjustment
                threshold: 0.05 // Trigger when 5% of the element is visible
            };

            const observer = new IntersectionObserver(callback, options);
            const targetElement = document.getElementById(LazyLoadHandler.targetId);
            
            if (targetElement) {
                observer.observe(targetElement);
                LazyLoadHandler.observer = observer;
            }
        };

        // Try immediately, then retry if needed
        const targetElement = document.getElementById(LazyLoadHandler.targetId);
        if (targetElement) {
            setupObserver();
        } else {
            // Retry after a short delay
            setTimeout(setupObserver, 500);
        }
        
        LazyLoadHandler.initialized = true;
    }

    public static moveScrollDown() {
        // Try to find the webchat scrollable container
        const scrollContainer = document.querySelector(".webchat__basic-transcript__scrollable") as HTMLElement;
        
        if (!scrollContainer) {
            // Fallback to the root container
            const fallbackContainer = document.getElementById(LazyLoadHandler.rootId);
            if (!fallbackContainer) {
                return;
            }
            LazyLoadHandler.adjustScroll(fallbackContainer);
            return;
        }

        LazyLoadHandler.adjustScroll(scrollContainer);
    }

    public static adjustScroll(scrollContainer: HTMLElement) {
        // Move scroll down enough to exit the rootMargin zone (20px) plus some buffer
        const currentScrollTop = scrollContainer.scrollTop;
        const moveDownBy = 35; // pixels to move down - more than the 20px rootMargin
        
        scrollContainer.scrollTop = currentScrollTop + moveDownBy;
        

    }

    public static reset() {
        LazyLoadHandler.unmount();
        LazyLoadHandler.initialized = false;
        // Re-setup after a short delay to ensure DOM is ready
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