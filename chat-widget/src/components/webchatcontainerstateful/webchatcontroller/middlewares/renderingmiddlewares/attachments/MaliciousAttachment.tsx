import React from "react";
import DownloadBlockedAttachment from "./DownloadBlockedAttachment";
import { CrossIcon, MaliciousFileIcon } from "../../../../../../assets/Icons";

const MaliciousAttachment = (props: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const extraContent = <img src={CrossIcon} alt="download blocked icon" />;
    return (
        <DownloadBlockedAttachment {...props} iconData={MaliciousFileIcon} extraContent={extraContent}/>
    );
};

export default MaliciousAttachment;