import { defaultGeneralPreChatSurveyPaneStyleProps as paneStyle } from "./defaultGeneralPreChatSurveyPaneStyleProps";

/**
 * Contract guard for Bug 6525143 / Bug 6423684 on the pre-chat pane's stateful
 * default general style.
 *
 * The pane must fill the focus-capture wrapper's remaining space via FLEX rather
 * than a fixed/percentage height:
 *  - Bug 6423684: a bare wrapper left the pane at content size -> collapsed.
 *  - Bug 6525143 (regression from PR #957): `height: 100%` resolved to the whole
 *    560px #oc-lcw container, so header + pane overflowed the centered column and
 *    the header's top was clipped.
 *
 * These assertions cover this stateful default object (the layer this fix owns).
 * The shared chat-components default still merges `height: "inherit"` underneath,
 * which resolves to auto under the flex parent and is overridden by the flex
 * main-size; the guard here is that this file never reintroduces a fixed/percentage
 * height and keeps the flex fill + own scroll.
 */
describe("defaultGeneralPreChatSurveyPaneStyleProps", () => {
    it("fills remaining space via flex, not a fixed/percentage height", () => {
        expect(paneStyle.flexGrow).toBe(1);
        expect(paneStyle.flexBasis).toBe(0);
        expect(paneStyle.minHeight).toBe(0);
    });

    it("does not reintroduce a fixed or percentage height in this default", () => {
        // A hardcoded height here (e.g. the PR #957 `height: 100%`) is what caused
        // the clip; this default must leave height to the flex fill above.
        expect(paneStyle.height).toBeUndefined();
    });

    it("keeps its own vertical scroll so tall surveys scroll instead of overflowing the container", () => {
        expect(paneStyle.overflowY).toBe("auto");
    });
});
