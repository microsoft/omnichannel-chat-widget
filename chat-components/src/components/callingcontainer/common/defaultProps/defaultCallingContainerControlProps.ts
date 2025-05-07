import { Ids } from "../../../../common/Constants";
import { ICallingContainerControlProps } from "../../interfaces/ICallingContainerControlProps";

export const defaultCallingContainerControlProps: ICallingContainerControlProps = {
    id: Ids.DefaultCallingContainerId,
    dir: "ltr",
    isIncomingCall: false,
    hideCallingContainer: false,
};