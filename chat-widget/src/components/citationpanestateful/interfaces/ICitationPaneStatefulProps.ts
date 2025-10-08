import { ICitationPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/citationpane/interfaces/ICitationPaneProps";

export interface ICitationPaneStatefulProps extends ICitationPaneProps {
    /**
     * id: Optional custom ID for the citation pane container
     */
    id?: string;
    
    /**
     * title: Optional title for the citation pane
     */
    title?: string;
    
    /**
     * onClose: Optional callback function called when the citation pane is closed
     */
    onClose?: () => void;
    
    /**
     * contentHtml: Optional HTML content to display in the citation pane
     */
    contentHtml?: string;
}
