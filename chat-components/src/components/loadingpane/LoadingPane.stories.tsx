import { LegacyChatIconBase64, LoadingSpinnerBase64 } from "../../assets/Icons";

import { ILoadingPaneProps } from "./interfaces/ILoadingPaneProps";
import LoadingPane from "./LoadingPane";
import { Meta } from "@storybook/react/types-6-0";
import React from "react";
import { Story } from "@storybook/react";
import { defaultLoadingPaneProps } from "./common/defaultProps/defaultLoadingPaneProps";
import { encodeComponentString } from "../../common/encodeComponentString";
import { presetOneLoadingPaneProps } from "./common/presetOneProps/presetOneLoadingPaneProps";
import { presetThreeLoadingPaneProps } from "./common/presetThreeProps/presetThreeLoadingPaneProps";
import { presetTwoLoadingPaneProps } from "./common/presetTwoProps/presetTwoLoadingPaneProps";

export default {
    title: "Stateless Components/Loading Pane",
    component: LoadingPane,
} as Meta;

const LoadingPaneTemplate: Story<ILoadingPaneProps> = (args) => <LoadingPane {...args}></LoadingPane>;

/*
    Default Loading Pane
*/
export const LoadingPaneDefault = LoadingPaneTemplate.bind({});
LoadingPaneDefault.args = defaultLoadingPaneProps;

/*
    Loading Pane Preset 1
*/

export const LoadingPanePreset1 = LoadingPaneTemplate.bind({});
LoadingPanePreset1.args = presetOneLoadingPaneProps;

/*
    Loading Pane Preset 2
*/

export const LoadingPanePreset2 = LoadingPaneTemplate.bind({});
LoadingPanePreset2.args = presetTwoLoadingPaneProps;

/*
    Loading Pane Preset 3
*/

export const LoadingPanePreset3 = LoadingPaneTemplate.bind({});
LoadingPanePreset3.args = presetThreeLoadingPaneProps;

/*
    Loading Pane Preset 4
*/
const customIcon = (
    <img src={LegacyChatIconBase64} />
);

const customTitle = (
    <h2>
        Hello world
    </h2>
);

const customSubtitle = encodeComponentString(
    <p style={{ marginBottom: "10px" }}>
        This is subtitle
    </p>
);

const customSpinner = (
    <img src={LoadingSpinnerBase64} />
);

const customSpinnerText = (
    <p style={{ marginTop: "10px" }}>
        This is spinner Text
    </p>
);

const loadingPanePreset4Props: ILoadingPaneProps = {
    componentOverrides: {
        icon: customIcon,
        title: customTitle,
        subtitle: customSubtitle,
        spinner: customSpinner,
        spinnerText: customSpinnerText
    }
};

export const LoadingPanePreset4 = LoadingPaneTemplate.bind({});
LoadingPanePreset4.args = loadingPanePreset4Props;