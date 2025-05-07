import { IHeaderComponentOverrides } from "./IHeaderComponentOverrides";
import { IHeaderControlProps } from "./IHeaderControlProps";
import { IHeaderStyleProps } from "./IHeaderStyleProps";

export interface IHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * header overriding children component properties
     */
    componentOverrides?: IHeaderComponentOverrides;
    /**
     * header children control properties
     */
    controlProps?: IHeaderControlProps;
    /**
     * header general and children styles
     */
    styleProps?: IHeaderStyleProps;
}