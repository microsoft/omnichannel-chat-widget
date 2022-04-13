import * as React from "react";

import { DefaultButton, IButtonStyles, PrimaryButton } from "@fluentui/react";

import { IFooterComponentOverrides } from "../../interfaces/IFooterComponentOverrides";

const iconButtonStyles: IButtonStyles = {
    root: { margin: 0 }
};

export const defaultFooterComponentOverrides: IFooterComponentOverrides = {
    DownloadTranscriptButton: <PrimaryButton text="Download" onClick={_downloadClicked} allowDisabledFocus styles={iconButtonStyles} />,
    EmailTranscriptButton: <DefaultButton text="Email" onClick={_emailClicked} allowDisabledFocus styles={iconButtonStyles} />
};

function _downloadClicked(): void {
    console.log("download clicked");
}

function _emailClicked(): void {
    console.log("email clicked");
}