import { IFooterComponentOverrides } from "./IFooterComponentOverrides";
import { IFooterControlProps } from "./IFooterControlProps";
import { IFooterStyleProps } from "./IFooterStyleProps";

export interface IFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Footer overriding children component properties
     */
    componentOverrides?: IFooterComponentOverrides;
    /**
     * Footer children control properties
     */
    controlProps?: IFooterControlProps;
    /**
     * Footer general and children styles
     */
    styleProps?: IFooterStyleProps;
}