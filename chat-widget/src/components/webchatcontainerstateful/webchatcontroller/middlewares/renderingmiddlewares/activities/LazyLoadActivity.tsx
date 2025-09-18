import React, { useEffect } from "react";

import ChatWidgetEvents from "../../../../../livechatwidget/common/ChatWidgetEvents";
import { LazyLoadActivityConstants } from "./Constants";
import LoadInlineBannerActivity from "./LoadInlineBannerActivity";
import { defaultInlineBannerStyle } from "../defaultStyles/defaultInLineBannerStyle";
import dispatchCustomEvent from "../../../../../../common/utils/dispatchCustomEvent";

class LazyLoadHandler {
    // Root container ID for the webchat
    public static rootId = "ms_lcw_webchat_root";

    // ID of the target element to observe for lazy loading
    public static targetId = "lazy-load-trigger-element";

    // Tracks whether the lazy load observer has been initialized
    public static initialized = false;

    // Tracks whether lazy loading is temporarily paused
    public static paused = false;

    // IntersectionObserver instance for observing the target element
    public static observer: IntersectionObserver | null = null;

    // Initializes the lazy load observer if not already initialized
    public static useLazyLoadObserver() {
        if (LazyLoadHandler.initialized) {
            return; // Exit if already initialized
        }

        // Callback function for the IntersectionObserver
        const callback: IntersectionObserverCallback = (entries: IntersectionObserverEntry[]) => {
            if (LazyLoadHandler.paused) {
                return; // Do nothing if lazy loading is paused
            }

            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0) {
                    // Trigger event to fetch persistent chat history
                    dispatchCustomEvent(ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY);

                    // Pause lazy loading to prevent multiple triggers
                    LazyLoadHandler.paused = true;

                    setTimeout(() => {
                        LazyLoadHandler.moveScrollDown(); // Adjust scroll position
                        LazyLoadHandler.paused = false; // Resume lazy loading

                        setTimeout(() => {
                            LazyLoadHandler.reset(); // Reset the observer
                        }, 1000);
                    }, 2000);
                }
            });
        };

        // Sets up the IntersectionObserver
        const setupObserver = () => {
            const webchatContainer = document.querySelector(LazyLoadActivityConstants.SCROLL_ID);
            const rootContainer = document.getElementById(LazyLoadHandler.rootId);

            if (!webchatContainer && !rootContainer) {
                return; // Exit if no valid container is found
            }

            const options: IntersectionObserverInit = {
                root: webchatContainer || rootContainer, // Use webchat container or fallback to root
                rootMargin: "20px 0px 0px 0px", // Margin around the root for triggering
                threshold: 0.05 // Trigger when 5% of the target is visible
            };

            const observer = new IntersectionObserver(callback, options);
            const targetElement = document.getElementById(LazyLoadHandler.targetId);

            if (targetElement) {
                observer.observe(targetElement); // Start observing the target element
                LazyLoadHandler.observer = observer;
            }
        };

        const targetElement = document.getElementById(LazyLoadHandler.targetId);
        if (targetElement) {
            setupObserver(); // Set up observer immediately if target exists
        } else {
            setTimeout(setupObserver, 500); // Retry setup after a delay
        }

        LazyLoadHandler.initialized = true; // Mark as initialized
    }

    // Adjusts the scroll position downward
    public static moveScrollDown() {
        const scrollContainer = document.querySelector(LazyLoadActivityConstants.SCROLL_ID) as HTMLElement;

        if (!scrollContainer) {
            const fallbackContainer = document.getElementById(LazyLoadHandler.rootId);
            if (!fallbackContainer) {
                return; // Exit if no valid container is found
            }
            LazyLoadHandler.adjustScroll(fallbackContainer); // Adjust scroll for fallback container
            return;
        }
        LazyLoadHandler.adjustScroll(scrollContainer); // Adjust scroll for main container
    }

    // Adjusts the scroll position of a given container
    public static adjustScroll(scrollContainer: HTMLElement) {
        const currentScrollTop = scrollContainer.scrollTop;
        const moveDownBy = 35; // Amount to move the scroll position down
        scrollContainer.scrollTop = currentScrollTop + moveDownBy;
    }

    // Resets the lazy load observer
    public static reset() {
        LazyLoadHandler.unmount(); // Unmount the current observer
        LazyLoadHandler.initialized = false; // Mark as uninitialized
        setTimeout(() => {
            LazyLoadHandler.useLazyLoadObserver(); // Reinitialize the observer
        }, 100);
    }

    // Unmounts the lazy load observer
    public static unmount() {
        const targetElement = document.getElementById(LazyLoadHandler.targetId);
        if (targetElement) {
            LazyLoadHandler.observer?.unobserve(targetElement); // Stop observing the target element
        }

        LazyLoadHandler.observer = null; // Clear the observer instance
        LazyLoadHandler.initialized = false; // Reset initialization flag
        LazyLoadHandler.paused = false; // Reset paused state
    }
}

const LazyLoadActivity = () => {
    const style = defaultInlineBannerStyle; // Default style for the inline banner

    useEffect(() => {
        LazyLoadHandler.useLazyLoadObserver(); // Initialize the lazy load observer
        LazyLoadHandler.paused = true; // Pause to prevent unexpected triggers during initialization
        setTimeout(() => {
            LazyLoadHandler.paused = false; // Resume lazy loading after a delay
        }, 1000);

        return () => {
            LazyLoadHandler.unmount(); // Clean up the observer on component unmount
        };
    }, []);

    return (
        <LoadInlineBannerActivity id={LazyLoadHandler.targetId} style={style} />
    );
};

export default LazyLoadActivity;