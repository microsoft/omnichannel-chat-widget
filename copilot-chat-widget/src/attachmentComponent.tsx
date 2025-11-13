import React from "react";
import { AppContext } from "./App";
import { AMSManager } from "./AMSManager";

interface AttachmentComponentProps {
    amsReference: string,
    amsMetadata: string,
    blobUrl: string
}


//const initializeAMSClient = async () => {

//     const supportedImagesMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/heic", "image/webp"];
// //     {
// //     "deliveryMode": "bridged",
// //     "tags": "public,client_activity_id:9wd3ynnun6b",
// //     "clientActivityId": "9wd3ynnun6b",
// //     "amsReferences": "[\"0-wus-d10-919a11cacc15ca0a55357a5ee5a1a9b9\"]",
// //     "amsMetadata": "[{\"contentType\":\"application/pdf\",\"fileName\":\"pdf.pdf\"}]",
// //     "amsreferences": "[\"0-wus-d10-919a11cacc15ca0a55357a5ee5a1a9b9\"]"
// // }
//     const fileMetadata = {
//         id: "0-wus-d10-919a11cacc15ca0a55357a5ee5a1a9b9",
//         type: "application/pdf",
//         name: "pdf.pdf"
//     };
//     const response = await amsClient.getViewStatus(fileMetadata, chatToken, supportedImagesMimeTypes) as any;
//     console.log("debugging: response received: ", response);
//     const view = await amsClient.getView(fileMetadata, response["view_location"], chatToken, supportedImagesMimeTypes) as any;
//     console.log("debugging: view received: ", view);
//     const blob = URL.createObjectURL(view);
//     console.log("debugging: blob: ", blob);
//   }
// export const loadStatus = async (amsReference: string, amsClient: FramedClient, chatToken: OmnichannelChatToken, supportedImagesMimeTypes: string[]) => {
export const loadStatus = async () => {
    console.log("debugging: load status is called");
    const appContext = React.useContext(AppContext);
    const amsClient = AMSManager.getAmsClient();
    const chatToken = appContext.getConfigurations()["chatToken"] as any;
    const supportedImagesMimeTypes = appContext.getConfigurations()["supportedImagesMimeTypes"] as any
    let blob = "no value";
    try {
        console.log("debugging: amsClient: ", amsClient);
        if (!amsClient || !chatToken || !supportedImagesMimeTypes) {
            console.error("debugging: failed to get amsClient");
            return;
        }
        const fileMetadata = {
            id: "0-wus-d10-919a11cacc15ca0a55357a5ee5a1a9b9",
            type: "application/pdf",
            name: "pdf.pdf"
        };
    
        const response = await amsClient.getViewStatus(fileMetadata, chatToken, supportedImagesMimeTypes) as any;
        console.log("debugging: response received: ", response);
        const view = await amsClient.getView(fileMetadata, response["view_location"], chatToken, supportedImagesMimeTypes) as any;
        console.log("debugging: view received: ", view);
        blob = URL.createObjectURL(view);
        console.log("debugging: blob: ", blob);
    } catch (error) {
        console.log("debugging: error received: ", error)
    }
    return blob;
}

const AttachmentComponent = (props: AttachmentComponentProps) => {

    return (
        <>
            {props.blobUrl}
        </>
    )
}

export default AttachmentComponent;
