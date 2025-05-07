import React from "react";
import Spinner from "./Spinner";
import DownloadBlockedAttachment from "./DownloadBlockedAttachment";
import { FileScanInProgressIcon } from "../../../../../../assets/Icons";

const ScanInProgressAttachment = (props: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const extraContent = <Spinner size={16}/>;
    return (
        <DownloadBlockedAttachment {...props} iconData={FileScanInProgressIcon} extraContent={extraContent}/>
    );
};

export default ScanInProgressAttachment;