import * as React from 'react';

interface ScrollAPI {
  /**
   * Checks if user is scrolling. True if they are, false if not.
   */
  isUserScrolling(): boolean;
  /**
   * Sets user scrolling back to false.
   */
  resetUserScrolling(): void;
  /**
   * Scrolls the element to the end of it's content.
   * @param behavior @see ScrollToOptions['behavior'] Used to animate the scrolling experience.
   */
  scrollToEnd(behavior?: ScrollToOptions['behavior']): void;

  scrollToTopPercent(percent: number): void;
}

export class ScrollManager<T extends HTMLElement> implements ScrollAPI {
  private userScrolling = false;

  constructor(private readonly elementRef: React.RefObject<T>) {
    this.elementRef.current?.addEventListener('scroll', this.handleOnScroll);
  }

  private clientHeight = () => this.elementRef.current?.clientHeight ?? 0;
  private scrollHeight = () => this.elementRef.current?.scrollHeight ?? 0;
  private scrollTop = () => this.elementRef.current?.scrollTop ?? 0;

  private handleOnScroll = () => {
    const isAtBottom = Math.abs(this.scrollHeight() - this.clientHeight() - this.scrollTop()) <= 1;
    this.userScrolling = !isAtBottom;
  };

  dispose() {
    this.userScrolling = false;
    this.elementRef.current?.removeEventListener('scroll', this.handleOnScroll);
  }

  isUserScrolling() {
    return this.userScrolling;
  }

  resetUserScrolling(): void {
    this.userScrolling = false;
  }

  scrollToEnd = (behavior: ScrollToOptions['behavior']) => {
    this.elementRef.current?.scrollTo({ top: this.elementRef.current.scrollHeight, behavior: behavior ?? 'smooth' });
  };

  scrollToTopPercent = () => {
    this.elementRef.current?.scrollTo({top: this.elementRef.current.scrollHeight * 0.10, behavior: "smooth"})
  }
}

export const useScrollManager = (scrollViewRef: React.RefObject<ScrollAPI>) => {
  const autoScroll = React.useCallback(() => {
    const scrollManager = scrollViewRef.current;
    if (scrollManager) {
      if (scrollManager.isUserScrolling()) {
        console.log('user is scrolling');
        return;
      } else {
        scrollManager.scrollToEnd();
      }
    }
  }, [scrollViewRef]);

  const scrollToBottom = React.useCallback(() => {
    const scrollManager = scrollViewRef.current;
    scrollManager?.resetUserScrolling();
    scrollManager?.scrollToEnd();
  }, [scrollViewRef]);

  const scrollToTopArea = React.useCallback(() => {
    const scrollManager = scrollViewRef.current;
    scrollManager?.resetUserScrolling();
    scrollManager?.scrollToTopPercent(10);
  }, [scrollViewRef])

  return {
    autoScroll,
    scrollToBottom,
    scrollToTopArea
  };
};
