import * as React from "react";
import {
  useId,
  useTimeout,
  useArrowNavigationGroup,
  slot,
  getIntrinsicElementProps,
  useMergedRefs,
  ProgressBar,
} from "@fluentui/react-components";
import type { ForwardRefComponent } from "@fluentui/react-components";
import type { CopilotMessageProps, CopilotMessageSlots, CopilotMessageState } from "@fluentui-copilot/react-copilot-chat";
import {
  AiGeneratedDisclaimer,
  useCopilotMessageStyles_unstable,
  useMessageAttributes,
} from "@fluentui-copilot/react-copilot-chat";

import { useCopilotMode } from "@fluentui-copilot/react-provider";
import { assertSlots, omit, useFirstMount } from "@fluentui/react-utilities";
import { useAnnounce_unstable } from "@fluentui/react-shared-contexts";


export const renderCopilotMessage_unstable_local = (state: CopilotMessageState) => {
  assertSlots<CopilotMessageSlots>(state);
  //console.log("debugging: state root ref: ", state.root.ref)
  const element =  <state.root>
      {state.content && <state.content />}
      <div className={state.nameLineClassName}>
        {state.accessibleHeading && <state.accessibleHeading />}
        <state.avatar />
        <state.name />
        {state.disclaimer && <state.disclaimer />}
      </div>
      {state.footnote && <state.footnote />}
      {state.actions && <state.actions />}
      {state.progress && <state.progress />}
    </state.root>
//   const diyElement = <div className={state.root.className}>
//     <state.avatar></state.avatar>
//   </div>
  return (
    element
  );
  // return (
  //   <div>
  //     {state.root.children}
  //     {state.avatar.children}
  //     {state.name.children}
  //   </div>
  // )
};

export const useCopilotMessage_unstable_local = (
  props: CopilotMessageProps,
  ref: React.Ref<HTMLDivElement>,
): CopilotMessageState => {
  const { announcement, accessibleHeading, loadingState = 'none' } = props;
  const messageId = useId('copilot-message-', props.id);
  const headingId = `${messageId}-title`;
  const rootRef = React.useRef<HTMLDivElement>(null);

  const { announce } = useAnnounce_unstable();

  const mode = useCopilotMode(props.mode);

  // timeout for announcing "loading" at 10s intervals
  const [setLoadingAnnounceTimeout, clearLoadingAnnounceTimeout] = useTimeout();

  // track whether the message has loaded; this should only change once from false -> true
  const hasLoaded = React.useRef(loadingState === 'none');

  // if the message is loading when first mounted, kick off loading announcements
  const isFirstMount = useFirstMount();

  if (isFirstMount && !announcement && loadingState !== 'none') {
    const announceLoading = () => {
      // check for the announcement when this function runs as well
      if (!announcement) {
        let messageText = 'loading...';
        if (loadingState === 'loading' && rootRef.current?.textContent) {
          messageText = rootRef.current.textContent;
        }
        announce(messageText, { batchId: messageId });
      }

      setLoadingAnnounceTimeout(() => {
        announceLoading();
      }, 5000);
    };

    announceLoading();
  }

  //fire tabster event on first mount to focus new message when it appears
  React.useEffect(() => {
    if (isFirstMount) {
      const tabsterMoverEvent = new CustomEvent('tabster:mover:memorized-element', {
        bubbles: true,
        detail: { memorizedElement: rootRef.current },
      });
      rootRef.current?.dispatchEvent(tabsterMoverEvent);
    }
  }, [isFirstMount]);

  //announce the announcement message every time the prop changes
  React.useEffect(() => {
    if (announcement) {
      clearLoadingAnnounceTimeout();
      announce(announcement, { batchId: messageId });
    }
  }, [announce, announcement, clearLoadingAnnounceTimeout, messageId]);

  //automatically announce when loading is complete, if announcement is not defined
  React.useEffect(() => {
    if (!hasLoaded.current && loadingState === 'none') {
      // flag message as having finished loading, and stop loading announcements
      hasLoaded.current = true;
      clearLoadingAnnounceTimeout();

      if (announcement === undefined) {
        const messageText = rootRef.current?.textContent;

        // clear any queued batched announcements and announce the full message
        announce('', { batchId: messageId });
        messageText && announce(messageText);
      }
    }
  }, [announce, announcement, clearLoadingAnnounceTimeout, messageId, loadingState]);

  const focusAttributes = useArrowNavigationGroup({
    axis: 'horizontal',
    memorizeCurrent: true,
  });

  // let tempRoot = slot.always(
  //     getIntrinsicElementProps('div', {
  //       ref: useMergedRefs(rootRef, ref),
  //       ...useMessageAttributes({ contentId: messageId, headingId, defaultFocused: props.defaultFocused } as any),
  //       'aria-busy': loadingState === 'streaming' ? true : undefined,
  //       // `content` is a slot and it's type clashes with the HTMLElement `content` attribute
  //       ...omit(props, ['content']),
  //     } as any) as any,

  //     { elementType: 'div' },
  //   )
  //console.log("debugging: tempRoot: ", tempRoot);

  let obj = {
    loadingState,
    mode,
    components: {
      root: 'div',
      accessibleHeading: 'h6',
      avatar: 'div',
      name: 'div',
      disclaimer: 'div',
      content: 'div',
      footnote: 'div',
      actions: 'div',
      progress: ProgressBar,
    },

    root: slot.always(
      getIntrinsicElementProps('div', {
        ref: useMergedRefs(rootRef, ref),
        ...useMessageAttributes({ contentId: messageId, headingId, defaultFocused: props.defaultFocused } as any),
        'aria-busy': loadingState === 'streaming' ? true : undefined,
        // `content` is a slot and it's type clashes with the HTMLElement `content` attribute
        ...omit(props, ['content']),
      } as any) as any,

      { elementType: 'div' },
    ),

    accessibleHeading: slot.optional(accessibleHeading, {
      defaultProps: {
        children: 'Copilot said: ',
        id: headingId,
      },
      elementType: 'h6',
      renderByDefault: true,
    }),

    avatar: slot.always(props.avatar, {
      elementType: 'div',
    }),

    name: slot.always(props.name, {
      elementType: 'div',
    }),

    disclaimer: slot.optional(props.disclaimer, {
      defaultProps: {
        children: <AiGeneratedDisclaimer> AI-generated content may be incorrect </AiGeneratedDisclaimer>,
      },
      elementType: 'div',
      renderByDefault: true,
    }),

    content: slot.optional(props.content, {
      defaultProps: {
        children: props.children,
        dir: 'auto',
        id: messageId,
      },
      elementType: 'div',
      renderByDefault: props.children !== undefined,
    }),

    footnote: slot.optional(props.footnote, {
      elementType: 'div',
    }),

    actions: slot.optional(props.actions, {
      defaultProps: {
        ...focusAttributes,
        role: 'toolbar',
      },
      elementType: 'div',
    }),

    progress: slot.optional(props.progress, {
      defaultProps: {
        'aria-label': 'Loading',
        shape: 'square',
        thickness: 'large',
      },
      elementType: ProgressBar,
      renderByDefault: loadingState === 'loading',
    }) as any,
  };

  //console.log("debugging: returning obj: ", obj);

  return obj as any;
};

export const CopilotMessageLocal: ForwardRefComponent<CopilotMessageProps> = React.forwardRef((props, ref) => {
  //console.log("debugging: props: ", props, " ref: ", ref);
  const state = useCopilotMessage_unstable_local(props, ref as any);

  useCopilotMessageStyles_unstable(state);
  //console.log("localElement: ", localElement);
  //console.log("elment: ", element);

  return (
    <>
        <div>
            <span>
                {state.avatar.children}
            </span>
            <span>
                {state.name.children}
            </span>
        </div>
            {state.root.children}
    </>
  );
});
CopilotMessageLocal.displayName = 'CopilotMessageLocal';


