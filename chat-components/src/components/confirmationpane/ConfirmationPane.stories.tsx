import ConfirmationPane from "./ConfirmationPane";
import { IConfirmationPaneProps } from "./interfaces/IConfirmationPaneProps";
import { Meta } from "@storybook/react/types-6-0";
import React from "react";
import { Story } from "@storybook/react";
import { defaultConfirmationPaneProps } from "./common/defaultProps/defaultConfirmationPaneProps";
import { encodeComponentString } from "../../common/encodeComponentString";
import { useArgs } from "@storybook/client-api";
import { BroadcastServiceInitialize } from "../../services/BroadcastService";

export default {
    title: "Stateless Components/Confirmation Pane",
    component: ConfirmationPane,
} as Meta;

BroadcastServiceInitialize("testChannel");
const ConfirmationPaneTemplate: Story<IConfirmationPaneProps> = (args) => <ConfirmationPane {...args}></ConfirmationPane>;

/*
    Default Confirmation Pane
*/

export const ConfirmationPaneDefault = ConfirmationPaneTemplate.bind({});
ConfirmationPaneDefault.args = defaultConfirmationPaneProps;

/*
    Confirmation Pane Preset 1
*/

const confirmationPanePreset1Props: IConfirmationPaneProps = {
    controlProps: {
        id: "lcw-confirmation-pane-preset1",
        titleText: "Big Circle",
        subtitleText: "This is a big, big circle.",
        confirmButtonText: "Green",
        cancelButtonText: "Red"
    },
    styleProps: {
        generalStyleProps: {
            backgroundColor: "lightgrey",
            borderColor: "black",
            borderRadius: "50%",
            borderStyle: "solid",
            borderWidth: "2px",
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
            MozBoxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
            WebkitBoxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
            color: "blue",
            fontFamily: "Times New Roman",
            fontSize: "10px",
            fontWeight: "300",
            height: "300px",
            margin: "",
            padding: "60px",
            width: "300px"
        },
        titleStyleProps: {
            fontFamily: "Times New Roman",
            fontSize: "30px",
            fontWeight: "700",
            borderStyle: "solid",
            borderWidth: "0 0 3px 0",
            borderColor: "black"
        },
        subtitleStyleProps: {
            fontSize: "16px",
            fontWeight: "400",
            color: "black",
            fontFamily: "Arial",
            margin: "30px 0 30px"
        },
        confirmButtonStyleProps: {
            backgroundColor: "green",
            borderRadius: "50%",
            height: "70px",
            margin: "0px 10px 0px 0px",
            width: "70px",
            color: "white",
            lineHeight: "70px"
        },
        confirmButtonHoveredStyleProps: {
            backgroundColor: "green",
            color: "white"
        },
        cancelButtonStyleProps: {
            backgroundColor: "red",
            borderRadius: "50%",
            height: "70px",
            width: "70px",
            color: "white",
            lineHeight: "70px"
        },
        cancelButtonHoveredStyleProps: {
            backgroundColor: "red",
            color: "white"
        }
    }
};

export const ConfirmationPanePreset1 = ConfirmationPaneTemplate.bind({});
ConfirmationPanePreset1.args = confirmationPanePreset1Props;

/*
    Confirmation Pane Preset 2
*/

const confirmationPanePreset2Props: IConfirmationPaneProps = {
    controlProps: {
        id: "lcw-confirmation-pane-preset2",
        titleText: "Only One Option",
        hideSubtitle: true,
        hideCancelButton: true,
        confirmButtonText: "The Only Button"
    },
    styleProps: {
        generalStyleProps: {
            backgroundColor: "white",
            borderColor: "grey",
            borderRadius: "2px",
            borderStyle: "solid",
            borderWidth: "1px",
            color: "blue",
            fontSize: "10px",
            fontWeight: "300",
            height: "130px",
            margin: "",
            padding: "10px",
            width: "150px",
            justifyContent: "start",
            alignItems: "start"
        },
        titleStyleProps: {
            fontSize: "14px",
            fontWeight: "500",
            borderStyle: "solid",
            borderWidth: "1px",
            borderColor: "black",
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
            MozBoxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
            WebkitBoxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
            width: "100px",
            textAlign: "end"
        },
        confirmButtonStyleProps: {
            backgroundColor: "black",
            height: "40px",
            margin: "",
            width: "100px",
            color: "white",
            lineHeight: "20px",
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
            MozBoxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
            WebkitBoxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
            textAlign: "end",
            padding: "0"
        },
        confirmButtonHoveredStyleProps: {
            backgroundColor: "black",
            color: "white"
        }
    }
};

export const ConfirmationPanePreset2 = ConfirmationPaneTemplate.bind({});
ConfirmationPanePreset2.args = confirmationPanePreset2Props;

/*
    Confirmation Pane Preset 3
*/

const confirmationPanePreset3Props: IConfirmationPaneProps = {
    controlProps: {
        id: "lcw-confirmation-pane-preset3",
        titleText: "COLUMN LAYOUT",
        subtitleText: "Try the buttons below",
        confirmButtonText: "Row layout",
        cancelButtonText: "Column layout"
    },
    styleProps: {
        generalStyleProps: {
            backgroundColor: "lightblue",
            color: "black",
            fontSize: "14px",
            fontWeight: "300",
            height: "250px",
            margin: "",
            padding: "0px",
            width: "150px",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
            MozBoxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
            WebkitBoxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
            flexFlow: "column",
        },
        titleStyleProps: {
            fontSize: "16px",
            fontWeight: "600",
            width: "100px"
        },
        subtitleStyleProps: {
            width: "100px"
        },
        buttonGroupStyleProps: {
            flexFlow: "column"
        },
        confirmButtonStyleProps: {
            backgroundColor: "white",
            height: "20px",
            width: "110px",
            color: "black",
            lineHeight: "20px",
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
            MozBoxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
            WebkitBoxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
            padding: "0"
        },
        confirmButtonHoveredStyleProps: {
            backgroundColor: "white",
            color: "black"
        },
        cancelButtonStyleProps: {
            backgroundColor: "white",
            height: "20px",
            margin: "",
            width: "110px",
            color: "black",
            lineHeight: "20px",
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
            MozBoxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
            WebkitBoxShadow: "0px 0px 2px rgba(0, 0, 0, 0.16), 0px 4px 8px rgba(0, 0, 0, 0.12)",
            padding: "0"
        },
        cancelButtonHoveredStyleProps: {
            backgroundColor: "white",
            color: "black"
        }
    }
};

export const ConfirmationPanePreset3: Story<IConfirmationPaneProps> = (args) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, updateArgs] = useArgs();

    const switchToColumnLayout = () => {
        updateArgs(confirmationPanePreset3Props);
    };
    
    const switchToRowLayout = () => {
        updateArgs({
            ...ConfirmationPanePreset3.args,
            controlProps: {
                ...ConfirmationPanePreset3.args?.controlProps,
                titleText: "Row Layout"
            },
            styleProps: {
                ...ConfirmationPanePreset3.args?.styleProps,
                generalStyleProps: Object.assign({}, ConfirmationPanePreset3.args?.styleProps?.generalStyleProps, {
                    flexFlow: "row",
                    buttonFlexDirection: "row",
                    height: "100px",
                    width: "500px"
                }),
                titleStyleProps: Object.assign({}, ConfirmationPanePreset3.args?.styleProps?.titleStyleProps, {
                    width: "80px"
                }),
                subtitleStyleProps: Object.assign({}, ConfirmationPanePreset3.args?.styleProps?.subtitleStyleProps, {
                    width: "80px"
                }),
                buttonGroupStyleProps: {
                    flexFlow: "row"
                }
            }
        });
    };

    args.controlProps.onConfirm = switchToRowLayout;
    args.controlProps.onCancel = switchToColumnLayout;
    return <ConfirmationPane {...args} ></ConfirmationPane>;
};

ConfirmationPanePreset3.args = confirmationPanePreset3Props;

/*
    Confirmation Pane Preset 4
*/

const customTitle = (
    <h2>
        Hello world
    </h2>
);

const customSubtitle = (
    <input type="text" placeholder="This is a subtitle" style={{marginBottom: "10px"}}>
    </input>
);

const customConfirmButton = encodeComponentString(
    <button style={{color: "pink"}}>
        Yes
    </button>
);

const customCancelButton = (
    <button style={{color: "yellow"}}>
        No
    </button>
);

const confirmationPanePreset4Props: IConfirmationPaneProps = {
    componentOverrides: {
        title: customTitle,
        subtitle: customSubtitle,
        confirmButton: customConfirmButton,
        cancelButton: customCancelButton
    }
};

export const ConfirmationPanePreset4 = ConfirmationPaneTemplate.bind({});
ConfirmationPanePreset4.args = confirmationPanePreset4Props;

/*
    Confirmation Pane Preset 5 (RTL)
*/

const confirmationPanePreset5Props: IConfirmationPaneProps = {
    controlProps: {
        dir: "rtl"
    }
};

export const ConfirmationPanePreset5 = ConfirmationPaneTemplate.bind({});
ConfirmationPanePreset5.args = confirmationPanePreset5Props;