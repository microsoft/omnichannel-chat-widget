import * as React from "react";

import { ILabelStyles, Label } from "@fluentui/react";

import { FontIcon } from "@fluentui/react/lib/Icon";
import { IHeaderComponentOverrides } from "../../interfaces/IHeaderComponentOverrides";
import { mergeStyles } from "@fluentui/style-utilities";

const iconClass = mergeStyles({
    fontSize: 40,
    height: 40,
    width: 40,
    margin: "0 5px",
    color: "white"
});

const labelClass: ILabelStyles = { root: { color: "Orange" } };

export const defaultHeaderComponentOverrides: IHeaderComponentOverrides = {
    headerIcon: <FontIcon aria-label="ChatBot" iconName="ChatBot" className={iconClass} id="oc-lcw-header-icon" />,
    headerTitle: <Label styles={labelClass} id="oc-lcw-header-title" >Hi, there!</Label>
};