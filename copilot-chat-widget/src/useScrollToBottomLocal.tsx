import { useFluent } from '@fluentui/react-components';
import * as React from 'react';

type UseScrollToBottomParams = {
  sentinelClassName?: string;
};

type UseScrollToBottom = {
  isAtBottom: boolean;
  sentinel: JSX.Element;
  //containerRef: React.RefObject<ContainerType>;
};

export const useScrollToBottom = (params: UseScrollToBottomParams): UseScrollToBottom => {
  const [isAtBottom, setIsAtBottom] = React.useState(true);

  //First get the ref to this container
  //const containerRef = React.useRef<HTMLDivElement>(null);
  //Get a ref to the sentinel element
  const { targetDocument } = useFluent();
  const win = targetDocument?.defaultView;
  
  const sentinelRef = React.useCallback(
    (elem: any) => {
      if (elem && win) {
        const observer = new win.IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                setIsAtBottom(true);
              } else {
                setIsAtBottom(false);
              }
            });
          },
          {
            threshold: 1.0,
          },
        );
        observer.observe(elem);
        return () => {
          observer.disconnect();
        };
      }
    },
    [win],
  );
  const { sentinelClassName } = params;

  const Sentinel = <span ref={sentinelRef} className={sentinelClassName} />;

  return {
    isAtBottom,
    sentinel: Sentinel,
  };
};
