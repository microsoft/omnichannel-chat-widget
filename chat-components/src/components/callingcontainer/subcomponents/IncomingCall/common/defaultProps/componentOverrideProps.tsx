import * as React from "react";
import { IIncomingCallComponentOverrides } from "../../interfaces/IIncomingCallComponentOverrides";
import { IImageStyles, ILabelStyles, Image, IStackStyles, Label, Stack } from "@fluentui/react";
import agentImage from "../../../../../../assets/imgs/agent.png";

const agentImageStyles: IImageStyles = {
    root: { height: "50px", width: "50px" },
    image: { height: "50px", width: "50px" }
};

const label1Styles: ILabelStyles = {
    root: { color: "white", fontSize: 13, fontWeight: "bold", padding: 0 }
};

const label2Styles: ILabelStyles = {
    root: { color: "white", fontSize: 11, padding: 0 }
};

const stackStyles: Partial<IStackStyles> = {
    root: { paddingLeft: "10px" }
};

export const componentOverrideProps: IIncomingCallComponentOverrides = {
    incomingCallTitle: <Stack horizontal>
        <Image src={agentImage} styles={agentImageStyles} />
        <Stack verticalAlign="center" horizontalAlign="baseline" styles={stackStyles}>
            <Label styles={label1Styles}>Omnichannel Agent 007</Label>
            <Label styles={label2Styles}>Incoming call</Label>
        </Stack>
    </Stack>
};