import { resolveBubbleStyleOptions } from "./resolveBubbleStyleOptions";

describe("resolveBubbleStyleOptions", () => {
    it("uses the readable default text color when Classic only supplies its theme background", () => {
        expect(resolveBubbleStyleOptions({
            webChatStyles: {
                bubbleBackground: "#315FA2"
            }
        })).toEqual({
            bubbleBackground: "#315FA2",
            bubbleTextColor: "White"
        });
    });

    it("honors explicit adaptive card colors", () => {
        expect(resolveBubbleStyleOptions({
            adaptiveCardStyles: {
                background: "#112233",
                color: "#F4F4F4"
            }
        })).toEqual({
            bubbleBackground: "#112233",
            bubbleTextColor: "#F4F4F4"
        });
    });

    it("prefers explicit WebChat bubble colors", () => {
        expect(resolveBubbleStyleOptions({
            adaptiveCardStyles: {
                background: "#112233",
                color: "#F4F4F4"
            },
            webChatStyles: {
                bubbleBackground: "#445566",
                bubbleTextColor: "#FAFAFA"
            }
        })).toEqual({
            bubbleBackground: "#445566",
            bubbleTextColor: "#FAFAFA"
        });
    });
});
