import React from "react";

const AttachmentContent = (props: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    return (
        <div id={props.id} style={props.style} >
            {props.children}
        </div>
    );
};

export default AttachmentContent;