import React from "react";
import { getFileAttachmentIconData } from "../../../../common/utils/FileAttachmentIconManager";

const AttachmentIcon = (props: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    return (
        <div id={props.id} style={props.style} >
            <img src={props.src ?? getFileAttachmentIconData("txt")} alt="attachment icon" />
        </div>
    );
};

export default AttachmentIcon;