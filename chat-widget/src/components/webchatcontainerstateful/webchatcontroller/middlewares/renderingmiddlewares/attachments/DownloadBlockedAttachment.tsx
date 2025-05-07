import React from "react";
import Attachment from "./Attachment";

const DownloadBlockedAttachment = (props: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const renderer = () => (
        <div style={{display: "flex", padding: "10px 10px 10px 8px", width: "100%"}}>
            <div style={{fontSize: 12, fontFamily: "Segoe UI, Arial, sans-serif"}}> {props.textCard.attachment.name} </div>
            <div style={{marginLeft: "auto", paddingRight: "10px"}}>
                {props.extraContent && props.extraContent}
            </div>
        </div>
    );

    return (
        <Attachment {...props} imageCard={undefined} renderer={renderer}/>
    );
};

export default DownloadBlockedAttachment;