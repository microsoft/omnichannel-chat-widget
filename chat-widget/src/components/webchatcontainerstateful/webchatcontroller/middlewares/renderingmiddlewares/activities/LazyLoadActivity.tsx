/**
 * LazyLoadActivity Component
 * 
 * This component implements a sophisticated lazy loading system for chat history in the webchat widget.
 * It uses an IntersectionObserver to detect when the user scrolls near the top of the chat container
 * and then triggers the loading of previous chat messages.
 * 
 * Key Features:
 * - Intersection Observer based detection for optimal performance
 * - Reliable scroll management with retry mechanisms
 * - Immediate user feedback even during initialization delays
 * - Handles edge cases like minimize/maximize widget scenarios
 * - Memory leak prevention with proper cleanup
 * 
 * Architecture:
 * - LazyLoadHandler: Static class managing all lazy load logic
 * - LazyLoadActivity: React component providing the UI and lifecycle integration for lazy loading
 * 
 * Flow:
 * 1. Component renders a trigger element at the top of chat history
 * 2. IntersectionObserver watches when this element becomes visible
 * 3. When visible, dispatches event to fetch more chat history
 * 4. Performs controlled scroll to maintain user position
 * 5. Resets observer for next lazy load cycle
 */

import { LogLevel, TelemetryEvent } from "../../../../../../common/telemetry/TelemetryConstants";
import React, { useEffect, useState } from "react";

import { BroadcastEvent } from "../../../../../../common/telemetry/TelemetryConstants";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import ChatWidgetEvents from "../../../../../livechatwidget/common/ChatWidgetEvents";
import { ILiveChatWidgetProps } from "../../../../../livechatwidget/interfaces/ILiveChatWidgetProps";
import { LazyLoadActivityConstants } from "./Constants";
import LoadInlineBannerActivity from "./LoadInlineBannerActivity";
import { TelemetryHelper } from "../../../../../../common/telemetry/TelemetryHelper";
import { createTimer } from "../../../../../../common/utils";
import dispatchCustomEvent from "../../../../../../common/utils/dispatchCustomEvent";
import SecureEventBus from "../../../../../../common/utils/SecureEventBus";

/**
 * LazyLoadHandler - Static class managing all lazy loading functionality
 * 
 * This class uses a singleton pattern with static methods to ensure consistent
 * state management across component re-renders and widget lifecycle events.
 * 
 * State Management:
 * - initialized: Tracks if the IntersectionObserver has been set up
 * - paused: Temporarily disables lazy loading (during initialization/loading)
 * - pendingScrollAction: Prevents overlapping scroll operations
 * - isReady: Indicates when the system is fully ready for user interactions
 * - initializationQueue: Stores user actions while system initializes
 * 
 * Reliability Features:
 * - Retry mechanisms with exponential backoff
 * - Scroll verification with tolerance checking
 * - Multiple container detection strategies
 * - Immediate user feedback during delays
 * - Proper memory management and cleanup
 */
class LazyLoadHandler {
    // DOM element identifiers
    public static rootId = "ms_lcw_webchat_root";           // Main widget container
    public static targetId = "lazy-load-trigger-element";   // Intersection trigger element
    
    // Observer and initialization state
    public static initialized = false;                      // Observer setup completion flag
    public static paused = false;                          // Temporary disable flag
    public static observer: IntersectionObserver | null = null;  // The intersection observer instance
    
    // Scroll anchoring state (height-delta approach)
    public static preLoadScrollHeight = 0;                  // scrollHeight before content loads
    private static preLoadScrollTop = 0;                    // scrollTop before content loads
    public static initialLoadComplete = false;              // Tracks if the first batch has loaded
    public static pendingScrollAction = false;              // Prevents concurrent scroll operations (public for event handlers)
    
    // Timeout and queue management
    private static retryTimeouts: Set<number> = new Set();  // Tracks all setTimeout IDs for cleanup
    
    // Flag to track if a reset is needed when component mounts
    public static resetPending = false;
    
    // Telemetry tracking - lifecycle events only
    private static initTimer = createTimer();
    
    // Simple lifecycle logging without complex state tracking
    public static logLifecycleEvent(event: TelemetryEvent, description: string, elapsedTime?: number) {
        try {
            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: event,
                Description: description,
                ...(elapsedTime && { ElapsedTimeInMilliseconds: elapsedTime })
            });
        } catch (error) {
            // Silent fail - don't break functionality for telemetry issues
        }
    }
    
    // Broadcast event subscription for marking reset needed when chat is closed/reopened
    private static resetEventListener = BroadcastService.getMessageByEventName(BroadcastEvent.PersistentConversationReset).subscribe(() => {
        LazyLoadHandler.logLifecycleEvent(TelemetryEvent.LCWLazyLoadReset, "LazyLoad reset triggered");
        LazyLoadHandler.resetPending = true;
        LazyLoadHandler.initialLoadComplete = false; // New session — next batch is an initial load
        LazyLoadHandler.setHasMoreHistoryAvailable(true); // Reset this immediately so activityMiddleware doesn't block rendering
        LazyLoadHandler.unmount(); // Clean up current state immediately

    });
    
    // Readiness and queue system (handles minimize/maximize scenarios)
    public static isReady = false;                          // System readiness flag
    private static initializationQueue: (() => void)[] = []; // Queue for actions during initialization
    
    // History availability state
    public static hasMoreHistoryAvailable = true;          // Tracks if more history can be loaded

    // Debug method to track what's changing hasMoreHistoryAvailable
    public static setHasMoreHistoryAvailable(value: boolean) {
        LazyLoadHandler.hasMoreHistoryAvailable = value;
    }

    /**
     * Direct reset method that can be called externally
     * This bypasses the broadcast system for more reliable resets
     */
    public static directReset() {
        LazyLoadHandler.resetPending = true;
        LazyLoadHandler.initialLoadComplete = false; // New session — next batch is an initial load
        LazyLoadHandler.setHasMoreHistoryAvailable(true);
        LazyLoadHandler.unmount();
    }

    /**
     * Main initialization method for the lazy loading system
     * 
     * This method sets up the IntersectionObserver that watches for when the trigger
     * element becomes visible, indicating the user has scrolled near the top.
     * 
     * Process:
     * 1. Prevents duplicate initialization
     * 2. Sets up intersection callback to handle visibility events
     * 3. Finds appropriate scroll container with fallback strategies
     * 4. Configures observer with optimal settings for chat history loading
     * 5. Waits for target element availability with exponential backoff
     * 
     * Observer Configuration:
     * - root: The scrollable container (webchat or fallback)
     * - rootMargin: 20px top margin to trigger slightly before element is visible
     * - threshold: 0.05 (5%) visibility required to trigger
     */
    public static useLazyLoadObserver() {
        
        // Auto-correct stale state: if hasMoreHistoryAvailable is false but we're trying to initialize, reset it
        if (!LazyLoadHandler.hasMoreHistoryAvailable) {
            LazyLoadHandler.setHasMoreHistoryAvailable(true);
        }
        
        // Prevent duplicate initialization
        if (LazyLoadHandler.initialized) {
            return;
        }

        // Start initialization timing
        LazyLoadHandler.initTimer = createTimer();
        
        LazyLoadHandler.logLifecycleEvent(TelemetryEvent.LCWLazyLoadInitializationStarted, "LazyLoad observer initialization started");

        // Reset readiness during initialization to handle user interactions
        LazyLoadHandler.isReady = false;

        /**
         * Intersection Observer Callback
         * 
         * Triggered when the target element's visibility changes.
         * Guards against triggering during paused states or pending operations.
         * 
         * @param entries - Array of intersection observer entries
         */
        const callback: IntersectionObserverCallback = (entries: IntersectionObserverEntry[]) => {
            // Guard clauses: Don't trigger if paused, already processing, or no more history available
            if (LazyLoadHandler.paused || LazyLoadHandler.pendingScrollAction || !LazyLoadHandler.hasMoreHistoryAvailable) {
                return;
            }

            entries.forEach(entry => {
                // Check if element is intersecting with any visibility
                if (entry.isIntersecting && entry.intersectionRatio > 0) {
                    // Double-check history availability at trigger time
                    if (!LazyLoadHandler.hasMoreHistoryAvailable) {
                        return;
                    }
                    LazyLoadHandler.handleLazyLoadTrigger();
                }
            });
        };

        /**
         * Observer Setup Function
         * 
         * Handles the complex process of finding the right container and
         * setting up the intersection observer with proper configuration.
         */
        const setupObserver = () => {
            // Find the scroll container using multiple strategies
            const { container: scrollContainer } = LazyLoadHandler.findScrollContainer();
            
            if (!scrollContainer) {
                // Schedule retry with faster timeout for better responsiveness
                const timeoutId = window.setTimeout(() => {
                    LazyLoadHandler.retryTimeouts.delete(timeoutId);
                    setupObserver();
                }, 100); // Reduced from 200ms to 100ms for faster container detection
                LazyLoadHandler.retryTimeouts.add(timeoutId);
                return;
            }

            // Configure intersection observer options
            const options: IntersectionObserverInit = {
                root: scrollContainer,              // Container to observe within
                rootMargin: "20px 0px 0px 0px",    // Trigger 20px before element is visible
                threshold: 0.05                     // Trigger when 5% of element is visible
            };

            const observer = new IntersectionObserver(callback, options);
            
            // Wait for target element and finalize setup
            LazyLoadHandler.waitForTargetElement(() => {
                const targetElement = document.getElementById(LazyLoadHandler.targetId);
                if (targetElement) {
                    observer.observe(targetElement);
                    LazyLoadHandler.observer = observer;
                    LazyLoadHandler.initialized = true;
                    LazyLoadHandler.isReady = true; // Mark system as ready
                    
                    // Log successful initialization
                    LazyLoadHandler.logLifecycleEvent(TelemetryEvent.LCWLazyLoadInitializationCompleted, "LazyLoad observer initialization completed", LazyLoadHandler.initTimer.milliSecondsElapsed);
                    
                    // Process any actions that were queued during initialization
                    LazyLoadHandler.processInitializationQueue();                    
                }
            });
        };

        setupObserver();
    }

    /**
     * Waits for the target element to be available in the DOM
     * 
     * Uses exponential backoff to retry finding the target element.
     * This is necessary because the target element may not be immediately
     * available when the observer is being set up.
     * 
     * @param callback - Function to call when target element is found
     * @param maxAttempts - Maximum number of retry attempts (default: 10)
     * @param attempt - Current attempt number (default: 1)
     */
    private static waitForTargetElement(callback: () => void, maxAttempts = 10, attempt = 1) {
        const targetElement = document.getElementById(LazyLoadHandler.targetId);
        
        // Target found, execute callback
        if (targetElement) {
            callback();
            return;
        }

        // Max attempts reached, log error
        if (attempt >= maxAttempts) {
            LazyLoadHandler.logLifecycleEvent(TelemetryEvent.LCWLazyLoadTargetElementNotFound, "Target element not found after max attempts");
            return;
        }

        // Schedule retry with exponential backoff (50ms * attempt number for faster initial attempts)
        const timeoutId = window.setTimeout(() => {
            LazyLoadHandler.retryTimeouts.delete(timeoutId);
            LazyLoadHandler.waitForTargetElement(callback, maxAttempts, attempt + 1);
        }, 50 * attempt); // Reduced from 100ms to 50ms for faster element detection
        LazyLoadHandler.retryTimeouts.add(timeoutId);
    }

    /**
     * Handles immediate scroll requests when system might not be ready
     * 
     * This is crucial for handling minimize/maximize scenarios where users
     * immediately scroll up before the observer is fully initialized.
     * 
     * Two-Path Strategy:
     * 1. If ready: Execute normal lazy load trigger
     * 2. If not ready: Provide immediate feedback + queue action for later
     * 
     * This ensures users always get visual feedback even during initialization delays.
     */
    public static handleImmediateScrollRequest() {
        if (LazyLoadHandler.isReady) {
            // System is ready, handle normally
            LazyLoadHandler.handleLazyLoadTrigger();
        } else {
            // System not ready, provide immediate feedback and queue action
            LazyLoadHandler.executeImmediateScrollFeedback();
            
            // Queue the full lazy load action to execute when system is ready
            LazyLoadHandler.initializationQueue.push(() => {
                LazyLoadHandler.handleLazyLoadTrigger();
            });
            
            // Try to speed up initialization
            LazyLoadHandler.expediteInitialization();
        }
    }

    /**
     * Provides immediate scroll feedback during initialization
     * 
     * When the system isn't ready but user scrolls up, this provides
     * immediate visual feedback (20px scroll) so the user knows their
     * action was recognized.
     */
    private static executeImmediateScrollFeedback() {
        // Find container and validate scrollability
        const { container, isScrollable } = LazyLoadHandler.findScrollContainer();
        
        if (container && isScrollable) {
            const currentScrollTop = container.scrollTop;
            const immediateScrollTarget = currentScrollTop + 20; // Small immediate scroll for feedback
            
            // Use requestAnimationFrame for smooth scroll execution
            requestAnimationFrame(() => {
                if (container) {
                    container.scrollTop = immediateScrollTarget;
                }
            });
        }
    }

    /**
     * Forces faster initialization attempts
     * 
     * When user interacts before system is ready, this tries to
     * speed up the initialization process.
     */
    private static expediteInitialization() {
        // Force faster initialization attempts if not already initialized
        if (!LazyLoadHandler.initialized) {
            LazyLoadHandler.useLazyLoadObserver();
        }
    }

    /**
     * Processes all queued actions once system is ready
     * 
     * During initialization, user actions are queued. Once the system
     * is ready, this processes all queued actions with small delays
     * between them to prevent overwhelming the system.
     */
    private static processInitializationQueue() {
        // Process all queued actions sequentially
        while (LazyLoadHandler.initializationQueue.length > 0) {
            const action = LazyLoadHandler.initializationQueue.shift();
            if (action) {
                // Add small delay between queued actions to prevent conflicts
                const timeoutId = window.setTimeout(() => {
                    LazyLoadHandler.retryTimeouts.delete(timeoutId);
                    action();
                }, 25); // Reduced from 100ms to 25ms for faster processing
                LazyLoadHandler.retryTimeouts.add(timeoutId);
            }
        }
    }

    /**
     * Manually checks if target element is visible and triggers lazy load
     * 
     * This is used when the intersection observer might not be ready yet
     * but we need to check if the trigger element is already in view.
     * 
     * Uses getBoundingClientRect() to calculate visibility manually.
     */
    public static checkVisibilityAndTrigger() {
        // Don't trigger if no more history is available
        if (!LazyLoadHandler.hasMoreHistoryAvailable) {
            return;
        }
        
        const targetElement = document.getElementById(LazyLoadHandler.targetId);
        if (!targetElement) {
            return;
        }

        const { container } = LazyLoadHandler.findScrollContainer();
        if (!container) {
            return;
        }

        // Get bounding rectangles for visibility calculation
        const targetRect = targetElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Check if target element intersects with container viewport
        const isVisible = (
            targetRect.top < containerRect.bottom &&    // Target top is above container bottom
            targetRect.bottom > containerRect.top &&    // Target bottom is below container top
            targetRect.left < containerRect.right &&    // Target left is before container right
            targetRect.right > containerRect.left       // Target right is after container left
        );

        if (isVisible) {
            LazyLoadHandler.handleImmediateScrollRequest();
        }
    }

    /**
     * Main lazy load trigger handler
     *
     * This is the core method that executes when the trigger element becomes visible.
     * It coordinates the entire lazy loading process:
     *
     * 1. Sets flags to prevent concurrent operations
     * 2. Captures scroll state BEFORE content loads (for height-delta anchoring)
     * 3. Dispatches event to fetch more chat history
     *
     * Scroll anchoring is triggered by HISTORY_BATCH_LOADED event (not a blind timeout).
     */
    private static handleLazyLoadTrigger() {
        // Final guard: Don't proceed if no more history is available
        if (!LazyLoadHandler.hasMoreHistoryAvailable) {
            return;
        }

        // Set flags to prevent overlapping operations
        LazyLoadHandler.pendingScrollAction = true;  // Block new scroll actions
        LazyLoadHandler.paused = true;               // Pause intersection observer

        // Capture scroll geometry BEFORE new content loads — used for height-delta anchoring
        const { container, isScrollable } = LazyLoadHandler.findScrollContainer();
        if (container && isScrollable) {
            LazyLoadHandler.preLoadScrollHeight = container.scrollHeight;
            LazyLoadHandler.preLoadScrollTop = container.scrollTop;
        }

        LazyLoadHandler.logLifecycleEvent(TelemetryEvent.LCWLazyLoadTriggerFired, "Lazy load trigger fired — fetching history");

        // Dispatch custom event to trigger chat history fetching
        dispatchCustomEvent(ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY);
    }

    /**
     * Applies height-delta scroll anchoring after new history content is prepended.
     *
     * When content is added above the viewport, the browser keeps scrollTop constant
     * but the content shifts down — making the viewport drift upward.
     * Fix: scrollTop = savedScrollTop + (newScrollHeight - savedScrollHeight)
     * This keeps the user looking at the same content they had before.
     */
    public static applyScrollAnchor() {
        const { container, isScrollable } = LazyLoadHandler.findScrollContainer();
        if (!container || !isScrollable) {
            LazyLoadHandler.finishScrollAction();
            return;
        }
        const newScrollHeight = container.scrollHeight;
        const heightDelta = newScrollHeight - LazyLoadHandler.preLoadScrollHeight;
        if (heightDelta > 0) {
            container.scrollTop = LazyLoadHandler.preLoadScrollTop + heightDelta;
        }

        try {
            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.LCWLazyLoadScrollAnchorApplied,
                Description: "Scroll anchor applied after history batch",
                CustomProperties: {
                    heightDelta,
                    preLoadScrollHeight: LazyLoadHandler.preLoadScrollHeight,
                    newScrollHeight,
                    newScrollTop: container.scrollTop
                }
            });
        } catch {
            // Silent fail — don't break scroll anchoring for telemetry issues
        }

        LazyLoadHandler.finishScrollAction();
    }

    /**
     * Finishes scroll action and prepares for next cycle
     * 
     * Cleans up scroll state and schedules the reset cycle.
     * Uses delays to allow content stabilization before re-enabling
     * the intersection observer for the next lazy load cycle.
     */
    public static finishScrollAction() {
        // Clean up scroll tracking state
        LazyLoadHandler.pendingScrollAction = false;
        
        // Schedule unpause and reset with delay for content stabilization
        const timeoutId = window.setTimeout(() => {
            LazyLoadHandler.retryTimeouts.delete(timeoutId);
            LazyLoadHandler.paused = false;              // Re-enable intersection observer
            LazyLoadHandler.scheduleReset();             // Schedule next cycle reset
        }, 500);
        LazyLoadHandler.retryTimeouts.add(timeoutId);
    }

    /**
     * Schedules observer reset for next lazy load cycle
     *
     * After a lazy load operation completes, the observer needs to be reset
     * to detect the next time the user scrolls to the top.
     */
    public static scheduleReset() {
        const timeoutId = window.setTimeout(() => {
            LazyLoadHandler.retryTimeouts.delete(timeoutId);
            LazyLoadHandler.reset();
        }, 1000); // 1 second delay before resetting for next cycle
        LazyLoadHandler.retryTimeouts.add(timeoutId);
    }

    /**
     * Finds the appropriate scroll container using multiple strategies
     * 
     * Container Detection Priority:
     * 1. Primary: Specific webchat scroll container (.webchat__basic-transcript__scrollable)
     * 2. Secondary: Widget root container (ms_lcw_webchat_root)
     * 3. Tertiary: Any scrollable parent of the target element
     * 4. Fallback: Best available container (even if not scrollable)
     * 
     * Returns both the container and whether it's actually scrollable.
     * 
     * @returns Object containing container element and scrollability status
     */
    public static findScrollContainer(): { container: HTMLElement | null; isScrollable: boolean } {
        // Primary: Look for the specific webchat scroll container
        const webchatContainer = document.querySelector(LazyLoadActivityConstants.SCROLL_ID) as HTMLElement;
        if (webchatContainer && LazyLoadHandler.isElementScrollable(webchatContainer)) {
            return { container: webchatContainer, isScrollable: true };
        }

        // Secondary: Try the root container
        const rootContainer = document.getElementById(LazyLoadHandler.rootId);
        if (rootContainer && LazyLoadHandler.isElementScrollable(rootContainer)) {
            return { container: rootContainer, isScrollable: true };
        }

        // Tertiary: Find any scrollable parent of the target element
        const targetElement = document.getElementById(LazyLoadHandler.targetId);
        if (targetElement) {
            const scrollableParent = LazyLoadHandler.findScrollableParent(targetElement);
            if (scrollableParent) {
                return { container: scrollableParent, isScrollable: true };
            }
        }

        // Fallback: Return the best available container even if not scrollable
        // This allows the system to continue functioning in edge cases
        return { 
            container: webchatContainer || rootContainer || document.body, 
            isScrollable: false 
        };
    }

    /**
     * Determines if an element is scrollable
     * 
     * Checks two conditions:
     * 1. Content overflow: scrollHeight > clientHeight (content extends beyond visible area)
     * 2. CSS overflow settings: overflow/overflowY set to 'auto' or 'scroll'
     * 
     * @param element - The element to check for scrollability
     * @returns true if element is scrollable, false otherwise
     */
    private static isElementScrollable(element: HTMLElement): boolean {
        const style = window.getComputedStyle(element);
        const hasScrollableContent = element.scrollHeight > element.clientHeight;
        const hasScrollableOverflow = style.overflow === "auto" || 
                                     style.overflow === "scroll" || 
                                     style.overflowY === "auto" || 
                                     style.overflowY === "scroll";
        
        return hasScrollableContent && hasScrollableOverflow;
    }

    /**
     * Traverses up the DOM tree to find a scrollable parent element
     * 
     * Starting from the given element, walks up the parent chain
     * until it finds a scrollable element or reaches document.body.
     * 
     * @param element - Starting element to search from
     * @returns Scrollable parent element or null if none found
     */
    private static findScrollableParent(element: HTMLElement): HTMLElement | null {
        let parent = element.parentElement;
        
        while (parent && parent !== document.body) {
            if (LazyLoadHandler.isElementScrollable(parent)) {
                return parent;
            }
            parent = parent.parentElement;
        }
        
        return null;
    }

    /**
     * Legacy method - redirects to new reliable scroll system
     * 
     * Maintained for backwards compatibility with existing code
     * that might call this method directly.
     */
    public static moveScrollDown() {
        LazyLoadHandler.applyScrollAnchor();
    }

    /**
     * Legacy scroll adjustment method with enhancements
     * 
     * Enhanced version of the original adjustScroll method:
     * - Validates container scrollability before attempting scroll
     * - Uses requestAnimationFrame for smooth execution
     * - Provides logging for debugging
     * 
     * @param scrollContainer - The container element to scroll
     */
    public static adjustScroll(scrollContainer: HTMLElement) {
        // Validate container is scrollable before attempting scroll
        if (!LazyLoadHandler.isElementScrollable(scrollContainer)) {
            return;
        }

        const currentScrollTop = scrollContainer.scrollTop;
        const moveDownBy = 35; // Standard scroll adjustment amount
        const targetScrollTop = currentScrollTop + moveDownBy;
        
        // Use requestAnimationFrame for smooth scroll execution
        requestAnimationFrame(() => {
            scrollContainer.scrollTop = targetScrollTop;
        });
    }

    /**
     * Handles the NO_MORE_HISTORY_AVAILABLE event
     * 
     * Called when there's no more chat history to load.
     * Disables further lazy loading attempts and cleans up the observer.
     * Also removes the trigger element from the DOM to prevent further triggering.
     */
    public static handleNoMoreHistoryAvailable() {
        if (!LazyLoadHandler.initialLoadComplete) {
            LazyLoadHandler.initialLoadComplete = true;
        }
        LazyLoadHandler.setHasMoreHistoryAvailable(false);
        LazyLoadHandler.paused = true;
        LazyLoadHandler.pendingScrollAction = false; // Reset this to prevent stuck states

        LazyLoadHandler.logLifecycleEvent(TelemetryEvent.LCWLazyLoadNoMoreHistory, "No more history available");

        // Clear all pending timeouts to stop any scheduled operations
        LazyLoadHandler.retryTimeouts.forEach(timeoutId => {
            clearTimeout(timeoutId);
        });
        LazyLoadHandler.retryTimeouts.clear();

        // Disconnect observer to prevent further triggering
        if (LazyLoadHandler.observer) {
            LazyLoadHandler.observer.disconnect();
            LazyLoadHandler.observer = null;
        }
    }

    /**
     * Resets the lazy load system for the next cycle
     * 
     * This method prepares the system for the next lazy load operation:
     * 1. Cleans up current state
     * 2. Resets all flags and queues
     * 3. Reinitializes the observer with faster timing
     * 
     * Called after each lazy load cycle completes.
     */
    public static reset() {
        LazyLoadHandler.unmount();                    // Clean up current state
        LazyLoadHandler.initialized = false;         // Reset initialization flag
        LazyLoadHandler.isReady = false;            // Reset readiness flag
        LazyLoadHandler.setHasMoreHistoryAvailable(true); // Reset history availability flag
        LazyLoadHandler.initializationQueue = [];   // Clear action queue
        LazyLoadHandler.resetPending = false;       // Clear pending reset flag
        // Note: initialLoadComplete is NOT reset here — it persists across observer cycles.
        // It's only reset on new chat sessions (directReset / PersistentConversationReset).

        // Reinitialize with faster timing for better responsiveness
        const timeoutId = window.setTimeout(() => {
            
            LazyLoadHandler.retryTimeouts.delete(timeoutId);
            LazyLoadHandler.useLazyLoadObserver();
        }, 25); // Reduced from 50ms to 25ms for faster reset
        LazyLoadHandler.retryTimeouts.add(timeoutId);
    }

    /**
     * Comprehensive cleanup method
     * 
     * Performs complete cleanup of all lazy load resources:
     * - Clears all pending timeouts to prevent memory leaks
     * - Removes intersection observer and event listeners
     * - Resets all state variables to initial values
     * - Clears action queue
     * 
     * Critical for preventing memory leaks and ensuring clean component unmounting.
     */
    public static unmount() {
        LazyLoadHandler.retryTimeouts.forEach(timeoutId => {
            clearTimeout(timeoutId);
        });
        LazyLoadHandler.retryTimeouts.clear();

        // Clean up intersection observer
        const targetElement = document.getElementById(LazyLoadHandler.targetId);
        if (targetElement && LazyLoadHandler.observer) {
            LazyLoadHandler.observer.unobserve(targetElement);
        }

        // Reset all state variables to initial values
        LazyLoadHandler.observer = null;
        LazyLoadHandler.initialized = false;
        LazyLoadHandler.paused = false;
        LazyLoadHandler.pendingScrollAction = false;
        LazyLoadHandler.isReady = false;
        LazyLoadHandler.preLoadScrollHeight = 0;
        LazyLoadHandler.preLoadScrollTop = 0;
        LazyLoadHandler.initializationQueue = [];
        // Note: Don't reset resetPending here as it needs to persist across unmount/mount cycles
    }

    /**
     * Complete cleanup including broadcast event listener
     * 
     * This method is used for final cleanup when the LazyLoadActivity component is being destroyed completely.
     * It includes unsubscribing from broadcast events and performing complete cleanup.
     * This is different from reset() which prepares the system for a new chat session.
     */
    public static destroy() {
        LazyLoadHandler.logLifecycleEvent(TelemetryEvent.LCWLazyLoadDestroyed, "LazyLoad component destroyed");
        LazyLoadHandler.unmount();
        
        // Clean up broadcast event subscription
        if (LazyLoadHandler.resetEventListener) {
            LazyLoadHandler.resetEventListener.unsubscribe();
        }
    }
}

/**
 * LazyLoadActivity React Component
 * 
 * This component serves as the React wrapper for the LazyLoadHandler system.
 * It renders the trigger element and manages the component lifecycle.
 * 
 * Component Lifecycle:
 * 1. Mount: Initializes lazy load observer and sets up scroll listener
 * 2. Active: Monitors user scroll behavior and responds to interactions
 * 3. Unmount: Cleans up all resources and prevents memory leaks
 * 
 * Key Features:
 * - Automatic initialization on mount
 * - Scroll event monitoring for immediate responsiveness
 * - Proper cleanup on unmount
 * - Handles minimize/maximize scenarios
 * - Reactive rendering based on history availability
 */
const LazyLoadActivity = (props? : Partial<ILiveChatWidgetProps>) => {
    const [hasMoreHistory, setHasMoreHistory] = useState(LazyLoadHandler.hasMoreHistoryAvailable);
    
    useEffect(() => {
        
        LazyLoadHandler.logLifecycleEvent(TelemetryEvent.LCWLazyLoadActivityMounted, "LazyLoadActivity component mounted");
        
        // Set up event listeners FIRST - before any early returns
        // Event listener for NO_MORE_HISTORY_AVAILABLE
        const handleNoMoreHistory = () => {
            LazyLoadHandler.handleNoMoreHistoryAvailable();
            // Update React state to trigger re-render and hide component
            setHasMoreHistory(false);
        };

        // Event listener for HISTORY_LOAD_ERROR — dismiss banner on any error
        const handleHistoryLoadError = () => {
            LazyLoadHandler.logLifecycleEvent(TelemetryEvent.LCWLazyLoadHistoryError,
                `History load error - dismissing banner. initialLoadComplete: ${LazyLoadHandler.initialLoadComplete}`);
            LazyLoadHandler.handleNoMoreHistoryAvailable();
            setHasMoreHistory(false);
        };

        // Event listener for PersistentConversationReset to sync React state
        // This fixes the issue where banner doesn't appear in start chat + close chat + start chat sequence
        // by ensuring React state (hasMoreHistory) is synchronized with handler state when reset occurs
        const handlePersistentConversationReset = () => {
            // Update React state to trigger re-render and show component for new chat session
            setHasMoreHistory(true);
        };

        // Event listener for HISTORY_BATCH_LOADED — applies scroll anchoring after batch is processed
        const handleBatchLoaded = () => {
            LazyLoadHandler.logLifecycleEvent(TelemetryEvent.LCWLazyLoadBatchReceived,
                `Batch received — initialLoadComplete: ${LazyLoadHandler.initialLoadComplete}`);

            if (!LazyLoadHandler.initialLoadComplete) {
                // Initial load: use the same height-delta scroll anchoring as subsequent loads.
                // This keeps the user at their current position while history is prepended above.
                LazyLoadHandler.initialLoadComplete = true;
                LazyLoadHandler.pendingScrollAction = false;

                try {
                    const { container } = LazyLoadHandler.findScrollContainer();
                    if (container) {
                        const savedScrollTop = container.scrollTop;
                        const savedScrollHeight = container.scrollHeight;

                        // Freeze viewport while React renders new content above
                        container.style.overflow = "hidden";

                        let framesRemaining = 6;
                        const anchorScroll = () => {
                            const newScrollHeight = container.scrollHeight;
                            const heightDelta = newScrollHeight - savedScrollHeight;
                            if (heightDelta > 0) {
                                container.scrollTop = savedScrollTop + heightDelta;
                            }
                            framesRemaining--;
                            if (framesRemaining > 0) {
                                requestAnimationFrame(anchorScroll);
                            } else {
                                container.style.overflow = "";
                                LazyLoadHandler.paused = false;
                                LazyLoadHandler.scheduleReset();
                            }
                        };
                        requestAnimationFrame(anchorScroll);
                    } else {
                        LazyLoadHandler.paused = false;
                        LazyLoadHandler.scheduleReset();
                    }
                } catch {
                    LazyLoadHandler.paused = false;
                    LazyLoadHandler.scheduleReset();
                }

                LazyLoadHandler.logLifecycleEvent(TelemetryEvent.LCWLazyLoadInitialLoadComplete,
                    "Initial history load complete — scroll anchored to current position");
                return;
            }
            // Pagination: apply height-delta scroll anchoring repeatedly across frames.
            //
            // react-scroll-to-bottom uses useEffect + rAF to auto-scroll to bottom when new content
            // arrives. This fires at unpredictable timing relative to our callbacks, so a single
            // scrollTop assignment gets overridden intermittently.
            //
            // Fix: re-apply the correct scrollTop across several animation frames. After a few frames,
            // react-scroll-to-bottom detects the user is NOT at the bottom (sticky=false) and stops
            // auto-scrolling. We also temporarily freeze overflow to prevent visible flicker.
            try {
                const { container } = LazyLoadHandler.findScrollContainer();
                if (container) {
                    // Re-capture scrollTop — user may have scrolled during the API fetch
                    const savedScrollTop = container.scrollTop;
                    const savedScrollHeight = LazyLoadHandler.preLoadScrollHeight;

                    // Freeze viewport to prevent visible flicker between competing scroll positions
                    container.style.overflow = "hidden";

                    let framesRemaining = 6; // ~100ms at 60fps — enough for react-scroll-to-bottom to settle
                    const anchorScroll = () => {
                        const newScrollHeight = container.scrollHeight;
                        const heightDelta = newScrollHeight - savedScrollHeight;
                        if (heightDelta > 0) {
                            container.scrollTop = savedScrollTop + heightDelta;
                        }
                        framesRemaining--;
                        if (framesRemaining > 0) {
                            requestAnimationFrame(anchorScroll);
                        } else {
                            // All frames applied — restore overflow and finish
                            container.style.overflow = "";
                            LazyLoadHandler.finishScrollAction();
                        }
                    };
                    requestAnimationFrame(anchorScroll);
                } else {
                    LazyLoadHandler.finishScrollAction();
                }
            } catch {
                LazyLoadHandler.finishScrollAction();
            }
        };

        // Add secure event listener for no more history signal
        const eventBus = SecureEventBus.getInstance();
        const unsubscribeNoMoreHistory = eventBus.subscribe(ChatWidgetEvents.NO_MORE_HISTORY_AVAILABLE, handleNoMoreHistory);

        // Add event listener for history load errors
        const unsubscribeHistoryError = eventBus.subscribe(ChatWidgetEvents.HISTORY_LOAD_ERROR, handleHistoryLoadError);

        // Add event listener for history batch loaded
        const unsubscribeBatchLoaded = eventBus.subscribe(ChatWidgetEvents.HISTORY_BATCH_LOADED, handleBatchLoaded);

        // Add event listener for persistent conversation reset
        const resetSubscription = BroadcastService.getMessageByEventName(BroadcastEvent.PersistentConversationReset).subscribe(handlePersistentConversationReset);

        // Sync React state with handler state on mount in case they're out of sync
        if (hasMoreHistory !== LazyLoadHandler.hasMoreHistoryAvailable) {
            setHasMoreHistory(LazyLoadHandler.hasMoreHistoryAvailable);
        }
        
        // Check if a reset was pending from a previous chat session
        if (LazyLoadHandler.resetPending) {
            LazyLoadHandler.resetPending = false;
            LazyLoadHandler.reset();
            
            // Still need to return cleanup function even after reset
            return () => {
                unsubscribeNoMoreHistory();
                unsubscribeHistoryError();
                unsubscribeBatchLoaded();
                resetSubscription.unsubscribe();
            };
        }
        
        // Initialize the lazy load observer system
        LazyLoadHandler.useLazyLoadObserver();
        
        // Pause initially to prevent unexpected triggers during initialization
        LazyLoadHandler.paused = true;
        
        // Set up initialization completion with visibility check
        const initTimeoutId = window.setTimeout(() => {
            LazyLoadHandler.paused = false;  // Enable lazy loading
            
            // Check if target is already visible after initialization
            // This handles cases where user scrolled during initialization
            LazyLoadHandler.checkVisibilityAndTrigger();
        }, 200); // Reduced from 500ms to 200ms for faster initial load

        /**
         * Scroll Event Handler for Immediate Responsiveness
         * 
         * This listener provides immediate feedback when users scroll
         * before the system is fully ready (e.g., after minimize/maximize).
         * 
         * Uses passive event listener for better performance.
         */
        const handleScroll = () => {
            if (!LazyLoadHandler.isReady) {
                // System not ready, but user is scrolling - check if we should trigger
                window.setTimeout(() => {
                    LazyLoadHandler.checkVisibilityAndTrigger();
                }, 50); // Reduced from 100ms to 50ms for faster response
                
            }
        };

        // Find container and attach scroll listener
        const { container } = LazyLoadHandler.findScrollContainer();
        if (container) {
            container.addEventListener("scroll", handleScroll, { passive: true });
        }

        // Cleanup function - critical for preventing memory leaks
        return () => {
            clearTimeout(initTimeoutId);
            
            // Remove event listeners
            unsubscribeNoMoreHistory();
            unsubscribeHistoryError();
            unsubscribeBatchLoaded();
            resetSubscription.unsubscribe();
            if (container) {
                container.removeEventListener("scroll", handleScroll);
            }
            
            // Perform complete system cleanup including broadcast event listener
            LazyLoadHandler.destroy();
        };
    }, []); // Empty dependency array - only run on mount/unmount

    // Don't render if no more history is available
    if (!hasMoreHistory) {
        return null;
    }

    // Render the trigger element that the intersection observer watches
    return (
        <LoadInlineBannerActivity {...(props || {})} id={LazyLoadHandler.targetId} />
    );
};

export default LazyLoadActivity;
export { LazyLoadHandler };