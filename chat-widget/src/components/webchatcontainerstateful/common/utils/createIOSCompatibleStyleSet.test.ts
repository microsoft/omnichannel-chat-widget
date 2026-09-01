import { createIOSCompatibleStyleSet } from "./createIOSCompatibleStyleSet";
import { createStyleSet } from "botframework-webchat";

const sendBoxRootSelector = "&.webchat__send-box-text-box";
const sendBoxInputSelector = "& .webchat__send-box-text-box__input, & .webchat__send-box-text-box__html-text-area";
const placeholderSelector = "&::placeholder";

const getSendBoxInputStyle = (styleSet: ReturnType<typeof createStyleSet>) =>
    styleSet.sendBoxTextBox[sendBoxRootSelector][sendBoxInputSelector];
const getPlaceholderStyle = (styleSet: ReturnType<typeof createStyleSet>) =>
    getSendBoxInputStyle(styleSet)[placeholderSelector];

describe("createIOSCompatibleStyleSet", () => {
    beforeAll(() => {
        Object.defineProperty(URL, "createObjectURL", {
            configurable: true,
            value: jest.fn()
        });
    });

    it("removes the native placeholder pseudo-element style that triggers Safari focus scrolling", () => {
        const styleSet = createStyleSet({});

        expect(getPlaceholderStyle(styleSet)).toBeDefined();

        const result = createIOSCompatibleStyleSet({}, styleSet);

        expect(getPlaceholderStyle(result)).toBeUndefined();
        expect(getPlaceholderStyle(styleSet)).toBeDefined();
    });

    it("removes placeholder styling from a caller-supplied style set", () => {
        const styleSet = createStyleSet({});
        const sendBoxRootStyle = styleSet.sendBoxTextBox[sendBoxRootSelector];
        const sendBoxInputStyle = sendBoxRootStyle[sendBoxInputSelector];
        const customStyleSet = {
            ...styleSet,
            sendBoxTextBox: {
                ...styleSet.sendBoxTextBox,
                [sendBoxRootSelector]: {
                    ...sendBoxRootStyle,
                    [sendBoxInputSelector]: {
                        ...sendBoxInputStyle,
                        [placeholderSelector]: {
                            color: "Red"
                        }
                    }
                }
            }
        };

        const result = createIOSCompatibleStyleSet({}, customStyleSet);

        expect(getPlaceholderStyle(result)).toBeUndefined();
        expect(getSendBoxInputStyle(result).backgroundColor).toBe("transparent");
        expect(getPlaceholderStyle(customStyleSet)).toEqual({ color: "Red" });
    });
});
