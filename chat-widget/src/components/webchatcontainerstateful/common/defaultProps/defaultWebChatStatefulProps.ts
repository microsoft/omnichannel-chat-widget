import { IWebChatProps } from "../../interfaces/IWebChatProps";
import { activityStatusMiddleware } from "../../webchatcontroller/middlewares/renderingmiddlewares/activityStatusMiddleware";
import { groupActivitiesMiddleware } from "../../webchatcontroller/middlewares/renderingmiddlewares/groupActivitiesMiddleware";
import { typingIndicatorMiddleware } from "../../webchatcontroller/middlewares/renderingmiddlewares/typingIndicatorMiddleware";

export const defaultWebChatStatefulProps: IWebChatProps = {
    // activityMiddleware: activityMiddleware, - this is implemented elsewhere and can be customized
    activityStatusMiddleware: activityStatusMiddleware,
    // avatarMiddleware: avatarMiddleware, - this is implemented elsewhere and can be customized
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    groupActivitiesMiddleware: groupActivitiesMiddleware as any,
    typingIndicatorMiddleware: typingIndicatorMiddleware,
    // attachmentMiddleware: createAttachmentMiddleware(false), - this is implemented elsewhere and can be customized
};
