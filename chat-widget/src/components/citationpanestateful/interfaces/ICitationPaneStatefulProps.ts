import { ICitationPaneControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/citationpane/interfaces/ICitationPaneControlProps";
import { ICitationPaneStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/citationpane/interfaces/ICitationPaneStyleProps";

export interface ICitationPaneStatefulProps {
    id?: string;
    title?: string;
    onClose?: () => void;
    contentHtml?: string;
    controlProps?: ICitationPaneControlProps;
    styleProps?: ICitationPaneStyleProps;
}
