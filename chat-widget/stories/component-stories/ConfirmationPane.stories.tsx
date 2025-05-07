import { Meta } from "@storybook/react/types-6-0";
import React from "react";
import { Story } from "@storybook/react";

import { useArgs } from "@storybook/client-api";
import { ConfirmationPane, encodeComponentString } from "@microsoft/omnichannel-chat-components";
import { IConfirmationPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/confirmationpane/interfaces/IConfirmationPaneProps";

export default {
    title: "Stateless Components/Confirmation Pane",
    component: ConfirmationPane,
} as Meta;

const ConfirmationPaneTemplate: Story<IConfirmationPaneProps> = (args) => <ConfirmationPane {...args}></ConfirmationPane>;
const defaultConfirmationPaneProps: IConfirmationPaneProps = {
    controlProps: {
        id: "lcw-components-confirmation-pane",
        dir: "ltr",
        hideConfirmationPane: false,
        hideTitle: false,
        titleText: "Close chat",
        hideSubtitle: false,
        subtitleText: "Do you really want to close this chat?",
        hideConfirmButton: false,
        confirmButtonText: "Close",
        confirmButtonAriaLabel: "Close Chat",
        hideCancelButton: false,
        cancelButtonText: "Cancel",
        cancelButtonAriaLabel: "Cancel. Return to Chat",
        onConfirm: function () {
            alert("on confirm");
        },
        onCancel: function () {
            alert("on cancel");
        }
    },
    styleProps: {
        generalStyleProps: {
            backgroundColor: "white",
            borderRadius: "2px",
            color: "black",
            fontFamily: "Segoe UI, Arial, sans-serif",
            fontSize: "14px",
            height: "160px",
            padding: "10px 20px",
            width: "262px",
            position: "absolute",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            flexFlow: "column",
            zIndex: "9999"
        },
        titleStyleProps: {
            color: "#323130",
            fontFamily: "Segoe UI, Arial, sans-serif",
            fontSize: "16px",
            fontWeight: "500",
            margin: "10px 0 0 0",
            width: "100%",
            textAlign: "center"           
        },
        subtitleStyleProps: {
            color: "#605e5c",
            fontFamily: "Segoe UI, Arial, sans-serif",
            fontSize: "14px",
            fontWeight: "400",
            margin: "14px 0px",
            width: "100%",
            textAlign: "center"
        },
        buttonGroupStyleProps: {
            display: "flex",
            flexFlow: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px"
        },
        confirmButtonStyleProps: {
            backgroundColor: "rgba(9,72,159,1)",
            color: "white",
            fontFamily: "Segoe UI, Arial, sans-serif",
            fontSize: "14px",
            fontWeight: "500",
            height: "32px",
            width: "80px"
        },
        cancelButtonStyleProps: {
            backgroundColor: "white",
            fontFamily: "Segoe UI, Arial, sans-serif",
            fontSize: "14px",
            fontWeight: "500",
            height: "32px",
            width: "80px"
        }
    }
};
/*
    Default Confirmation Pane
*/

export const ConfirmationPaneDefault = ConfirmationPaneTemplate.bind({});
ConfirmationPaneDefault.args = defaultConfirmationPaneProps;

/*
    Confirmation Pane (RTL)
*/

const confirmationPaneRTLProps: IConfirmationPaneProps = {
    controlProps: {
        dir: "rtl"
    }
};

export const ConfirmationPaneRTL = ConfirmationPaneTemplate.bind({});
ConfirmationPaneRTL.args = confirmationPaneRTLProps;

/*
    Confirmation Pane Sample 1
*/

const confirmationPaneSample1Props: IConfirmationPaneProps = {
    controlProps: {
        id: "oc-lcw-confirmationpane-sample1",
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

export const ConfirmationPaneSample1 = ConfirmationPaneTemplate.bind({});
ConfirmationPaneSample1.args = confirmationPaneSample1Props;

/*
    Confirmation Pane Sample 2
*/

const confirmationPaneSample2Props: IConfirmationPaneProps = {
    controlProps: {
        id: "oc-lcw-confirmationpane-sample2",
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

export const ConfirmationPaneSample2 = ConfirmationPaneTemplate.bind({});
ConfirmationPaneSample2.args = confirmationPaneSample2Props;

/*
    Confirmation Pane Sample 3
*/

const confirmationPaneSample3Props: IConfirmationPaneProps = {
    controlProps: {
        id: "oc-lcw-confirmationpane-sample3",
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

export const ConfirmationPaneSample3: Story<IConfirmationPaneProps> = (args) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, updateArgs] = useArgs();

    const switchToColumnLayout = () => {
        updateArgs(confirmationPaneSample3Props);
    };
    
    const switchToRowLayout = () => {
        updateArgs({
            ...ConfirmationPaneSample3.args,
            controlProps: {
                ...ConfirmationPaneSample3.args.controlProps,
                titleText: "Row Layout"
            },
            styleProps: {
                ...ConfirmationPaneSample3.args.styleProps,
                generalStyleProps: Object.assign({}, ConfirmationPaneSample3.args.styleProps.generalStyleProps, {
                    flexFlow: "row",
                    buttonFlexDirection: "row",
                    height: "100px",
                    width: "500px"
                }),
                titleStyleProps: Object.assign({}, ConfirmationPaneSample3.args.styleProps.titleStyleProps, {
                    width: "80px"
                }),
                subtitleStyleProps: Object.assign({}, ConfirmationPaneSample3.args.styleProps.subtitleStyleProps, {
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

ConfirmationPaneSample3.args = confirmationPaneSample3Props;

/*
    Confirmation Pane Sample 4
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

const confirmationPaneSample4Props: IConfirmationPaneProps = {
    componentOverrides: {
        title: customTitle,
        subtitle: customSubtitle,
        confirmButton: customConfirmButton,
        cancelButton: customCancelButton
    }
};

export const ConfirmationPaneSample4 = ConfirmationPaneTemplate.bind({});
ConfirmationPaneSample4.args = confirmationPaneSample4Props;