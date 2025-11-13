import { ACSMessagePartial, OmnichannelMessageOptional } from "../types";

export const rawMessages = `[{"Content": "[{\"created\":\"2025-08-28T22:45:58+00:00\",\"isControlMessage\":true,\"content\":\"<deletemember><eventtime>1756421158611</eventtime><target>8:orgid:1d493ef3-e8c5-4856-a1bf-5d9650597efd</target></deletemember>\",\"createdDateTime\":\"2025-08-28T22:45:58+00:00\",\"deleted\":false,\"id\":\"1756421158611\"},{\"created\":\"2025-08-28T22:45:52+00:00\",\"isControlMessage\":false,\"content\":\"Customer has ended the conversation.\",\"contentType\":\"text\",\"createdDateTime\":\"2025-08-28T22:45:52+00:00\",\"deleted\":false,\"from\":{\"user\":{\"displayName\":\"__customer__\",\"id\":\"00000029-6c82-ca6a-a848-04bd456030c8\"}},\"attachments\":[],\"id\":\"1756421152313\",\"tags\":\"system,customerendconversation\",\"deliveryMode\":\"bridged\",\"isBridged\":\"True\"}]", "Type":0, "Mode":0, "Tag":null, "CreatedOn":null, "Sender":null, "AttachmentInfo":null, "subject":"Visitor: ErliWS", "annotationid":"8432aba9-213a-43a5-8c28-faa5d4d1bf0e"}]`;


export const rawACSMessages = [
    {
        "id": "1757366819462",
        "type": "participantRemoved",
        "sequenceId": "6",
        "version": "1757366819462",
        "content": {
            "participants": [
                {
                    "communicationIdentifier": {
                        "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-cb06-7a94-6a0b-343a0d0039f8",
                        "communicationUser": {
                            "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-cb06-7a94-6a0b-343a0d0039f8"
                        }
                    },
                    "displayName": "Customer",
                    "shareHistoryTime": "1970-01-01T00:00:00Z"
                }
            ],
            "initiatorCommunicationIdentifier": {
                "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6c82-ca79-45f7-3a3a0d003000",
                "communicationUser": {
                    "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6c82-ca79-45f7-3a3a0d003000"
                }
            }
        },
        "createdOn": "2025-09-08T21:26:59Z"
    },
    {
        "id": "1757365601615",
        "type": "text",
        "sequenceId": "5",
        "version": "1757365601615",
        "content": {
            "message": "test all",
            "attachments": []
        },
        "senderDisplayName": "Customer",
        "createdOn": "2025-09-08T21:06:41Z",
        "senderCommunicationIdentifier": {
            "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-cb06-7a94-6a0b-343a0d0039f8",
            "communicationUser": {
                "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-cb06-7a94-6a0b-343a0d0039f8"
            }
        },
        "metadata": {
            "deliveryMode": "bridged",
            "widgetId": "57aa89fc-c7ba-4b08-b7c0-082a8089b466",
            "clientActivityId": "g9ysa6nb507",
            "tags": "ChannelId-lcw,FromCustomer"
        }
    }
]


export const STORY_TEXT = "Ea veniam adipisicing reprehenderit occaecat consectetur dolor excepteur officia qui ex sit. Nisi commodo cillum duis exercitation ullamco veniam officia incididunt reprehenderit laborum. Duis laboris pariatur minim reprehenderit. Magna excepteur aliquip consectetur commodo Lorem proident reprehenderit magna quis commodo. Proident commodo adipisicing ipsum esse velit minim fugiat officia deserunt in. Elit sunt Lorem do nulla minim voluptate esse sunt consectetur. Veniam in culpa anim cupidatat ullamco. Cupidatat est tempor pariatur occaecat ipsum commodo elit incididunt pariatur nostrud anim ipsum officia laborum. Et in esse ullamco ullamco pariatur esse fugiat ullamco adipisicing officia. Deserunt cupidatat mollit dolor mollit eiusmod ut nulla incididunt consequat occaecat minim laboris. Dolore pariatur fugiat id eu ullamco fugiat cupidatat laboris nostrud dolor velit enim consequat sit. Ex culpa tempor culpa nostrud veniam ad. Voluptate ipsum minim culpa mollit ut ex minim adipisicing id esse amet dolor. Proident amet reprehenderit aliquip ea eu. Veniam eu laboris sint veniam elit. Aute anim est cupidatat fugiat enim magna ullamco fugiat Lorem ullamco voluptate. Non enim ea reprehenderit deserunt occaecat officia. Duis duis consequat labore velit aliqua dolore culpa ullamco velit velit ut veniam. Officia voluptate non irure velit irure esse officia laboris deserunt. Eu reprehenderit eu dolore et nostrud cillum consequat. Proident minim quis do ullamco tempor ullamco ex pariatur laborum ut eu. Id dolor et adipisicing ea anim ut culpa excepteur laborum amet quis voluptate culpa ullamco. Nisi elit cillum in excepteur consequat labore occaecat minim. Ullamco ea veniam proident et nostrud velit laboris mollit cillum labore eiusmod sunt anim pariatur. Aliqua aliquip tempor magna et dolore nostrud esse nisi sunt. Non cillum duis cillum sit consectetur. Esse esse quis qui dolore non esse irure esse dolor adipisicing proident. Sint ipsum sint ex magna cupidatat cupidatat cillum culpa nostrud cupidatat laboris ea in. Aute eiusmod commodo ea eiusmod qui incididunt magna aute et ipsum voluptate est pariatur.";



export const typingIndicatorPayload = {"eventId": 245,"senderId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278","recipientId": "acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-97a1-f70a-85f4-343a0d00a690","recipientMri": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-97a1-f70a-85f4-343a0d00a690","transactionId": "Gxpeyply5UOVE6T5hFZ/xQ.1.1.1.1.1738539707.1.0","groupId": "19:acsV2_a5sAc3sOQiigtY5J5zEFcSTXAHZ9lbzrbmvNFX_A41g1@thread.v2","messageId": "1757453226145","collapseId":"qDdjZ2AuttnOkjMP3ain1locwLkyiYJZNEUiQBj3i8I=","messageType": "Control/Typing","senderDisplayName": "# Aurora User","originalArrivalTime": "2025-09-09T21:27:06.1450000Z","version": "1757453226145"}


export const initializeMessages = (messageIdTrack: {messageId: number}) => [
      {
        id: `${messageIdTrack.messageId++}`,
        createdOn: new Date().toISOString(),
        senderDisplayName: "Customer",
        type: "text",
        content: {
          message: "Sample user plain text message",
          attachments: []
        }
      },
      {
        id: `${messageIdTrack.messageId++}`,
        createdOn: new Date().toISOString(),
        senderDisplayName: "Customer",
        type: "text",
        content: {
          message: "Sample user plain long text message, Sample user plain long text message, Sample user plain long text message, Sample user plain long text message, Sample user plain long text message, Sample user plain long text message, Sample user plain long text message, Sample user plain long text message, Sample user plain long text message, Sample user plain long text message, Sample user plain long text message, Sample user plain long text message, Sample user plain long text message, Sample user plain long text message, ",
          attachments: []
        }
      },
      {
        id: `${messageIdTrack.messageId++}`,
        createdOn: new Date().toISOString(),
        senderDisplayName: "Copilot",
        type: "text",
        content: {
          message: "{\"attachments\":[{\"contentType\":\"application/vnd.microsoft.card.adaptive\",\"contentUrl\":null,\"content\":\"{\\\"type\\\":\\\"AdaptiveCard\\\",\\\"body\\\":[{\\\"color\\\":\\\"Light\\\",\\\"text\\\":\\\"Ask me a question or select a topic to explore.\\\",\\\"wrap\\\":true,\\\"type\\\":\\\"TextBlock\\\"},{\\\"color\\\":\\\"Light\\\",\\\"text\\\":\\\" - For a personalized chat experience—including account details and available actions—<b><a href='https://www.mrcooper.com/signin'>sign in</a><div><span>layer1<div>layer2</div></span></div></b> to your digital account.\\\",\\\"wrap\\\":true,\\\"type\\\":\\\"TextBlock\\\"},{\\\"actions\\\":[{\\\"data\\\":\\\"Payments & Payoffs\\\",\\\"type\\\":\\\"Action.Submit\\\",\\\"title\\\":\\\"Payments & Payoffs\\\"},{\\\"data\\\":\\\"Escrow, Taxes, & Insurance\\\",\\\"type\\\":\\\"Action.Submit\\\",\\\"title\\\":\\\"Escrow, Taxes, & Insurance\\\"},{\\\"data\\\":\\\"Statements & 1098/1099\\\",\\\"type\\\":\\\"Action.Submit\\\",\\\"title\\\":\\\"Statements & 1098/1099\\\"},{\\\"data\\\":\\\"Mortgage Assistance\\\",\\\"type\\\":\\\"Action.Submit\\\",\\\"title\\\":\\\"Mortgage Assistance\\\"},{\\\"data\\\":\\\"Account Help\\\",\\\"type\\\":\\\"Action.Submit\\\",\\\"title\\\":\\\"Account Help\\\"}],\\\"type\\\":\\\"ActionSet\\\"}],\\\"version\\\":\\\"1.2\\\",\\\"backgroundImage\\\":{\\\"url\\\":\\\"https://storage.googleapis.com/apolloimage/images/omnichannel/ChatBotRectangle.gif\\\"},\\\"$schema\\\":\\\"http://adaptivecards.io/schemas/adaptive-card.json\\\"}\",\"name\":null,\"thumbnailUrl\":null}],\"suggestedActions\":null}",
          attachments: []
        }
      },
      {
        id: `${messageIdTrack.messageId++}`,
        createdOn: new Date().toISOString(),
        senderDisplayName: "Copilot",
        type: "text",
        content: {
          message: "Sample copilot plain text message",
          attachments: []
        }
      },
      {
        id: `${messageIdTrack.messageId++}`,
        createdOn: new Date().toISOString(),
        senderDisplayName: "Copilot",
        type: "text",
        content: {
          message: "Here is a *markdown link*: [Link text](https://malicious.com)",
          attachments: []
        }
      },
    ]

export const persistentChatInput2: ACSMessagePartial[] = [
    {
        "id": "1758320444422",
        "type": "text",
        "sequenceId": "15",
        "version": "1758320444422",
        "content": {
            "message": "",
            "attachments": []
        },
        "senderDisplayName": "Customer",
        "createdOn": "2025-09-19T22:20:44Z",
        "senderCommunicationIdentifier": {
            "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-f38d-62e5-28c5-593a0d00b890",
            "communicationUser": {
                "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-f38d-62e5-28c5-593a0d00b890"
            }
        },
        "metadata": {
            "deliveryMode": "bridged",
            "widgetId": "aa93b293-99e2-4f5e-a98b-159123b5a12a",
            "clientActivityId": "k9vq4kebszk",
            "tags": "ChannelId-lcw,FromCustomer",
            "amsReferences": "[\"0-wus-d4-2d6c96106c5ac55a5b2e99e60a83c744\"]",
            "amsMetadata": "[{\"contentType\":\"image/jpeg\",\"fileName\":\"ersuo-Mocha climbs up high - 1.jpg\"}]",
            "amsreferences": "[\"0-wus-d4-2d6c96106c5ac55a5b2e99e60a83c744\"]"
        }
    },
    {
        "id": "1758319860421",
        "type": "text",
        "sequenceId": "14",
        "version": "1758319860421",
        "content": {
            "message": "test from copilot lcw",
            "attachments": []
        },
        "senderDisplayName": "Customer",
        "createdOn": "2025-09-19T22:11:00Z",
        "senderCommunicationIdentifier": {
            "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-f38d-62e5-28c5-593a0d00b890",
            "communicationUser": {
                "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-f38d-62e5-28c5-593a0d00b890"
            }
        },
        "metadata": {
            "deliveryMode": "bridged",
            "tags": "public,client_activity_id:kg0rqbt7234",
            "clientActivityId": "kg0rqbt7234"
        }
    },
    {
        "id": "1758214546322",
        "type": "text",
        "sequenceId": "13",
        "version": "1758214546322",
        "content": {
            "message": "test",
            "attachments": []
        },
        "senderDisplayName": "Customer",
        "createdOn": "2025-09-18T16:55:46Z",
        "senderCommunicationIdentifier": {
            "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-f38d-62e5-28c5-593a0d00b890",
            "communicationUser": {
                "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-f38d-62e5-28c5-593a0d00b890"
            }
        },
        "metadata": {
            "deliveryMode": "bridged",
            "widgetId": "aa93b293-99e2-4f5e-a98b-159123b5a12a",
            "clientActivityId": "mazackgudv",
            "tags": "ChannelId-lcw,FromCustomer"
        }
    },
    {
        "id": "1758127019492",
        "type": "text",
        "sequenceId": "12",
        "version": "1758127019492",
        "content": {
            "message": "restart",
            "attachments": []
        },
        "senderDisplayName": "Customer",
        "createdOn": "2025-09-17T16:36:59Z",
        "senderCommunicationIdentifier": {
            "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-f38d-62e5-28c5-593a0d00b890",
            "communicationUser": {
                "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-f38d-62e5-28c5-593a0d00b890"
            }
        },
        "metadata": {
            "deliveryMode": "bridged",
            "widgetId": "aa93b293-99e2-4f5e-a98b-159123b5a12a",
            "clientActivityId": "rvapwn0kcqk",
            "tags": "ChannelId-lcw,FromCustomer"
        }
    },
    {
        "id": "1758061248155",
        "type": "text",
        "sequenceId": "11",
        "version": "1758061248155",
        "content": {
            "message": "",
            "attachments": []
        },
        "senderDisplayName": "# Aurora User",
        "createdOn": "2025-09-16T22:20:48Z",
        "senderCommunicationIdentifier": {
            "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278",
            "communicationUser": {
                "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278"
            }
        },
        "metadata": {
            "deliveryMode": "bridged",
            "tags": "public,client_activity_id:9wd3ynnun6b",
            "clientActivityId": "9wd3ynnun6b",
            "amsReferences": "[\"0-wus-d10-919a11cacc15ca0a55357a5ee5a1a9b9\"]",
            "amsMetadata": "[{\"contentType\":\"application/pdf\",\"fileName\":\"pdf.pdf\"}]",
            "amsreferences": "[\"0-wus-d10-919a11cacc15ca0a55357a5ee5a1a9b9\"]"
        }
    },
    {
        "id": "1758046292274",
        "type": "text",
        "sequenceId": "10",
        "version": "1758046292274",
        "content": {
            "message": "{\"attachments\":[{\"contentType\":\"application/vnd.microsoft.card.adaptive\",\"contentUrl\":null,\"content\":\"{\\\"type\\\":\\\"AdaptiveCard\\\",\\\"body\\\":[{\\\"color\\\":\\\"Light\\\",\\\"text\\\":\\\"Ask me a question or select a topic to explore.\\\",\\\"wrap\\\":true,\\\"type\\\":\\\"TextBlock\\\"},{\\\"color\\\":\\\"Light\\\",\\\"text\\\":\\\" - For a personalized chat experience—including account details and available actions—<b><a href='https://www.mrcooper.com/signin'>sign in</a></b> to your digital account.\\\",\\\"wrap\\\":true,\\\"type\\\":\\\"TextBlock\\\"},{\\\"actions\\\":[{\\\"data\\\":\\\"Payments & Payoffs\\\",\\\"type\\\":\\\"Action.Submit\\\",\\\"title\\\":\\\"Payments & Payoffs\\\"},{\\\"data\\\":\\\"Escrow, Taxes, & Insurance\\\",\\\"type\\\":\\\"Action.Submit\\\",\\\"title\\\":\\\"Escrow, Taxes, & Insurance\\\"},{\\\"data\\\":\\\"Statements & 1098/1099\\\",\\\"type\\\":\\\"Action.Submit\\\",\\\"title\\\":\\\"Statements & 1098/1099\\\"},{\\\"data\\\":\\\"Mortgage Assistance\\\",\\\"type\\\":\\\"Action.Submit\\\",\\\"title\\\":\\\"Mortgage Assistance\\\"},{\\\"data\\\":\\\"Account Help\\\",\\\"type\\\":\\\"Action.Submit\\\",\\\"title\\\":\\\"Account Help\\\"}],\\\"type\\\":\\\"ActionSet\\\"}],\\\"version\\\":\\\"1.2\\\",\\\"backgroundImage\\\":{\\\"url\\\":\\\"https://storage.googleapis.com/apolloimage/images/omnichannel/ChatBotRectangle.gif\\\"},\\\"$schema\\\":\\\"http://adaptivecards.io/schemas/adaptive-card.json\\\"}\",\"name\":null,\"thumbnailUrl\":null}],\"suggestedActions\":null}",
            "attachments": []
        },
        "senderDisplayName": "# Erli Suo",
        "createdOn": "2025-09-16T18:11:32Z",
        "senderCommunicationIdentifier": {
            "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278",
            "communicationUser": {
                "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278"
            }
        },
        "metadata": {
            "deliveryMode": "bridged",
            "tags": "public,client_activity_id:eg81ac5iadc",
            "adaptiveCardText": "{\"type\":\"AdaptiveCard\",\"body\":[{\"color\":\"Light\",\"text\":\"Ask me a question or select a topic to explore.\",\"wrap\":true,\"type\":\"TextBlock\"},{\"color\":\"Light\",\"text\":\" - For a personalized chat experience—including account details and available actions—<b><a href='https://www.mrcooper.com/signin'>sign in</a></b> to your digital account.\",\"wrap\":true,\"type\":\"TextBlock\"},{\"actions\":[{\"data\":\"Payments & Payoffs\",\"type\":\"Action.Submit\",\"title\":\"Payments & Payoffs\"},{\"data\":\"Escrow, Taxes, & Insurance\",\"type\":\"Action.Submit\",\"title\":\"Escrow, Taxes, & Insurance\"},{\"data\":\"Statements & 1098/1099\",\"type\":\"Action.Submit\",\"title\":\"Statements & 1098/1099\"},{\"data\":\"Mortgage Assistance\",\"type\":\"Action.Submit\",\"title\":\"Mortgage Assistance\"},{\"data\":\"Account Help\",\"type\":\"Action.Submit\",\"title\":\"Account Help\"}],\"type\":\"ActionSet\"}],\"version\":\"1.2\",\"backgroundImage\":{\"url\":\"https://storage.googleapis.com/apolloimage/images/omnichannel/ChatBotRectangle.gif\"},\"$schema\":\"http://adaptivecards.io/schemas/adaptive-card.json\"}",
            "microsoft.azure.communication.chat.bot.contenttype": "azurebotservice.adaptivecard",
            "clientActivityId": "eg81ac5iadc"
        }
    },
    {
        "id": "1758046243952",
        "type": "text",
        "sequenceId": "9",
        "version": "1758046243952",
        "content": {
            "message": "C1 out bound",
            "attachments": []
        },
        "senderDisplayName": "# Aurora User",
        "createdOn": "2025-09-16T18:10:43Z",
        "senderCommunicationIdentifier": {
            "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278",
            "communicationUser": {
                "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278"
            }
        },
        "metadata": {
            "deliveryMode": "bridged",
            "tags": "public,client_activity_id:q22oqcftgl",
            "clientActivityId": "q22oqcftgl"
        }
    },
    {
        "id": "1758045470819",
        "type": "text",
        "sequenceId": "8",
        "version": "1758045470819",
        "content": {
            "message": "here is the link: https://oc-cdn-public.azureedge.net/livechatwidget/scripts/LiveChatBootstrapper.js?oc.reconnectid=39da2180-08e0-48d2-bbb6-802d8c0a2db8",
            "attachments": []
        },
        "senderDisplayName": "# Aurora User",
        "createdOn": "2025-09-16T17:57:50Z",
        "senderCommunicationIdentifier": {
            "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278",
            "communicationUser": {
                "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278"
            }
        },
        "metadata": {
            "deliveryMode": "bridged",
            "tags": "public,client_activity_id:zydpt1sbgf",
            "clientActivityId": "zydpt1sbgf"
        }
    },
    {
        "id": "1758045439362",
        "type": "text",
        "sequenceId": "7",
        "version": "1758045439362",
        "content": {
            "message": "ok, test from c2",
            "attachments": []
        },
        "senderDisplayName": "Customer",
        "createdOn": "2025-09-16T17:57:19Z",
        "senderCommunicationIdentifier": {
            "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-f38d-62e5-28c5-593a0d00b890",
            "communicationUser": {
                "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-f38d-62e5-28c5-593a0d00b890"
            }
        },
        "metadata": {
            "deliveryMode": "bridged",
            "widgetId": "aa93b293-99e2-4f5e-a98b-159123b5a12a",
            "clientActivityId": "olwsbcgvrqt",
            "tags": "ChannelId-lcw,FromCustomer"
        }
    },
    {
        "id": "1758045415417",
        "type": "text",
        "sequenceId": "6",
        "version": "1758045415417",
        "content": {
            "message": "test persistent chat form agent",
            "attachments": []
        },
        "senderDisplayName": "# Aurora User",
        "createdOn": "2025-09-16T17:56:55Z",
        "senderCommunicationIdentifier": {
            "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278",
            "communicationUser": {
                "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278"
            }
        },
        "metadata": {
            "deliveryMode": "bridged",
            "tags": "public,client_activity_id:zfyd6yg2zgq",
            "clientActivityId": "zfyd6yg2zgq"
        }
    }
]




export const persistentChatInput1: ACSMessagePartial[] = [
    {
        "id": "1758045398407",
        "type": "text",
        "sequenceId": "5",
        "version": "1758045398407",
        "content": {
            "message": "# Aurora User has joined the conversation.",
            "attachments": []
        },
        "senderDisplayName": "__agent__",
        "createdOn": "2025-09-16T17:56:38Z",
        "senderCommunicationIdentifier": {
            "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6c82-cae5-0848-04bd45602f4b",
            "communicationUser": {
                "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6c82-cae5-0848-04bd45602f4b"
            }
        },
        "metadata": {
            "tags": "system,agentaccepted,displaytocustomer",
            "deliveryMode": "bridged",
            "isBridged": "True"
        }
    },
    {
        "id": "1758045395026",
        "type": "participantAdded",
        "sequenceId": "4",
        "version": "1758045395026",
        "content": {
            "participants": [
                {
                    "communicationIdentifier": {
                        "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278",
                        "communicationUser": {
                            "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278"
                        }
                    },
                    "displayName": "# Aurora User",
                    "shareHistoryTime": "1970-01-01T00:00:00Z"
                }
            ],
            "initiatorCommunicationIdentifier": {
                "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6c82-ca79-45f7-3a3a0d003000",
                "communicationUser": {
                    "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6c82-ca79-45f7-3a3a0d003000"
                }
            }
        },
        "createdOn": "2025-09-16T17:56:35Z"
    },
    {
        "id": "1758045389723",
        "type": "text",
        "sequenceId": "3",
        "version": "1758045389723",
        "content": {
            "message": "Leave as many messages as you’d like and we’ll get back to you as soon as possible. We’ll save your chat history, so you can leave and come back anytime.",
            "attachments": []
        },
        "senderDisplayName": "__agent__",
        "createdOn": "2025-09-16T17:56:29Z",
        "senderCommunicationIdentifier": {
            "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6c82-cae5-0848-04bd45602f4b",
            "communicationUser": {
                "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6c82-cae5-0848-04bd45602f4b"
            }
        },
        "metadata": {
            "tags": "system,persistentagentassignment,displaytocustomer",
            "deliveryMode": "bridged",
            "isBridged": "True"
        }
    },
    {
        "id": "1758045389059",
        "type": "topicUpdated",
        "sequenceId": "2",
        "version": "1758045389059",
        "content": {
            "topic": "Frontend",
            "initiatorCommunicationIdentifier": {
                "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6c82-ca76-284a-04bd45602ce5",
                "communicationUser": {
                    "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6c82-ca76-284a-04bd45602ce5"
                }
            }
        },
        "createdOn": "2025-09-16T17:56:29Z"
    },
    {
        "id": "1758045389025",
        "type": "participantAdded",
        "sequenceId": "1",
        "version": "1758045389025",
        "content": {
            "participants": [
                {
                    "communicationIdentifier": {
                        "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-f38d-62e5-28c5-593a0d00b890",
                        "communicationUser": {
                            "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-f38d-62e5-28c5-593a0d00b890"
                        }
                    },
                    "displayName": "Customer",
                    "shareHistoryTime": "1970-01-01T00:00:00Z"
                },
                {
                    "communicationIdentifier": {
                        "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6c82-cae5-0848-04bd45602f4b",
                        "communicationUser": {
                            "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6c82-cae5-0848-04bd45602f4b"
                        }
                    },
                    "displayName": "__agent__",
                    "shareHistoryTime": "1970-01-01T00:00:00Z"
                },
                {
                    "communicationIdentifier": {
                        "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6c82-ca76-284a-04bd45602ce5",
                        "communicationUser": {
                            "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6c82-ca76-284a-04bd45602ce5"
                        }
                    },
                    "displayName": "__admin__",
                    "shareHistoryTime": "1970-01-01T00:00:00Z"
                },
                {
                    "communicationIdentifier": {
                        "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6c82-ca79-45f7-3a3a0d003000",
                        "communicationUser": {
                            "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6c82-ca79-45f7-3a3a0d003000"
                        }
                    },
                    "displayName": "__system__",
                    "shareHistoryTime": "1970-01-01T00:00:00Z"
                }
            ],
            "initiatorCommunicationIdentifier": {
                "rawId": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6c82-ca76-284a-04bd45602ce5",
                "communicationUser": {
                    "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6c82-ca76-284a-04bd45602ce5"
                }
            }
        },
        "createdOn": "2025-09-16T17:56:29Z"
    }
]

export const persistentChatInput1StrArr = persistentChatInput1.filter(val=>!!val.content).map(val=>val.content?.message);

export const getNextSeqId = () => {
    let id = 0;
    persistentChatInput2.forEach(val => {
        const idNum = Number.parseFloat(val.sequenceId ?? "");
        if (idNum > id) id = idNum;
    })
    return id +1;
}


export const persistentChatInput3: OmnichannelMessageOptional[] = [
    {
        "liveChatVersion": 2,
        "id": "1759363863723",
        "properties": {
            "tags": "public,client_activity_id:tcqj7myd0bd",
            "originalMessageId": "1759363863723"
        },
        "content": "333",
        "tags": [
            "public",
            "client_activity_id:tcqj7myd0bd"
        ],
        "timestamp": new Date("2025-10-02T00:09:20.100Z"),
        "messageType": "UserMessage",
        "sender": {
            "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278",
            "displayName": "# Aurora User",
            "type": 2
        },
        "role": "agent",
    },
    {
        "liveChatVersion": 2,
        "id": "1759363760698",
        "properties": {
            "tags": "ChannlId-lcw,FromCustomer,client_activity_id:mock1759363760566",
            "originalMessageId": "1759363760698"
        },
        "content": "Random message generated at: 1759363760566",
        "tags": [
            "ChannlId-lcw",
            "FromCustomer",
            "client_activity_id:mock1759363760566"
        ],
        "timestamp": new Date("2025-10-02T00:09:20.000Z"),
        "messageType": "UserMessage",
        "sender": {
            "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_0000002a-410e-6f11-85f4-343a0d00b6b4",
            "displayName": "Customer",
            "type": 2
        },
        "role": "user"
    },
    {
        "liveChatVersion": 2,
        "id": "1759363752871",
        "properties": {
            "tags": "public,client_activity_id:5gsnzikcm5a",
            "originalMessageId": "1759363752871"
        },
        "content": "*222*",
        "tags": [
            "public",
            "client_activity_id:5gsnzikcm5a"
        ],
        "timestamp": new Date("2025-10-02T00:09:12.000Z"),
        "messageType": "UserMessage",
        "sender": {
            "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278",
            "displayName": "# Aurora User",
            "type": 2
        },
        "role": "agent"
    },
    {
        "liveChatVersion": 2,
        "id": "1759363745596",
        "properties": {
            "tags": "ChannlId-lcw,FromCustomer,client_activity_id:mock1759363745322",
            "originalMessageId": "1759363745596"
        },
        "content": "Random message generated at: 1759363745322",
        "tags": [
            "ChannlId-lcw",
            "FromCustomer",
            "client_activity_id:mock1759363745322"
        ],
        "timestamp": new Date("2025-10-02T00:09:05.000Z"),
        "messageType": "UserMessage",
        "sender": {
            "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_0000002a-410e-6f11-85f4-343a0d00b6b4",
            "displayName": "Customer",
            "type": 2
        },
        "role": "user"
    },
    {
        "liveChatVersion": 2,
        "id": "1759363737160",
        "properties": {
            "tags": "public,client_activity_id:oyat1pi8pf",
            "originalMessageId": "1759363737160"
        },
        "content": "111",
        "tags": [
            "public",
            "client_activity_id:oyat1pi8pf"
        ],
        "timestamp": new Date("2025-10-02T00:08:57.000Z"),
        "messageType": "UserMessage",
        "sender": {
            "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278",
            "displayName": "# Aurora User",
            "type": 2
        },
        "role": "agent"
    },
    {
        "liveChatVersion": 2,
        "id": "1759363723242",
        "properties": {
            "tags": "system,agentaccepted,displaytocustomer",
            "originalMessageId": "1759363723242"
        },
        "content": "# Aurora User has joined the conversation.",
        "tags": [
            "system",
            "agentaccepted",
            "displaytocustomer"
        ],
        "timestamp": new Date("2025-10-02T00:08:43.000Z"),
        "messageType": "UserMessage",
        "sender": {
            "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6c82-cae5-0848-04bd45602f4b",
            "displayName": "__agent__",
            "type": 2
        },
        "role": "system"
    },
    {
        "liveChatVersion": 2,
        "id": "1759363691446",
        "properties": {
            "tags": "system,agentassignmentready,displaytocustomer",
            "originalMessageId": "1759363691446"
        },
        "content": "An agent will be with you in a moment.",
        "tags": [
            "system",
            "agentassignmentready",
            "displaytocustomer"
        ],
        "timestamp": new Date("2025-10-02T00:08:11.000Z"),
        "messageType": "UserMessage",
        "sender": {
            "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6c82-cae5-0848-04bd45602f4b",
            "displayName": "__agent__",
            "type": 2
        },
        "role": "system"
    },
    {
        "liveChatVersion": 2,
        "id": "1759424736989",
        "properties": {
            "tags": "public,client_activity_id:o3td87nld8r",
            "originalMessageId": "1759424736989"
        },
        "content": "",
        "tags": [
            "public",
            "client_activity_id:o3td87nld8r"
        ],
        "timestamp": new Date("2025-10-02T17:05:36.989Z"),
        "messageType": "UserMessage",
        "sender": {
            "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278",
            "displayName": "# Aurora User",
            "type": 2
        },
        "fileMetadata": {
            "fileSharingProtocolType": 0,
            "id": "0-wus-d11-1d87bdcdc76b2c67d0d309bebcec78bb",
            "name": "ersuo-Mocha climbs up high - 1.jpg",
            "size": 0,
            "type": "image/jpeg",
            "url": ""
        },
        "role": "agent"
    },
    {
        "liveChatVersion": 2,
        "id": "1759424831619",
        "properties": {
            "tags": "public,client_activity_id:52rhyd78jv9",
            "originalMessageId": "1759424831619"
        },
        "content": "",
        "tags": [
            "public",
            "client_activity_id:52rhyd78jv9"
        ],
        "timestamp": new Date("2025-10-02T17:07:11.619Z"),
        "messageType": "UserMessage",
        "sender": {
            "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278",
            "displayName": "# Aurora User",
            "type": 2
        },
        "fileMetadata": {
            "fileSharingProtocolType": 0,
            "id": "0-wus-d6-57d9a7f1639a6c5a2f0fe69a1177785e",
            "name": "pdf.pdf",
            "size": 0,
            "type": "application/pdf",
            "url": ""
        },
        "role": "agent"
    },
    {
        "liveChatVersion": 2,
        "id": "1759424962291",
        "properties": {
            "tags": "public,client_activity_id:eg81ac5iadc",
            "originalMessageId": "1759424962291"
        },
        "content": "{\"attachments\":[{\"contentType\":\"application/vnd.microsoft.card.adaptive\",\"contentUrl\":null,\"content\":\"{\\\"type\\\":\\\"AdaptiveCard\\\",\\\"body\\\":[{\\\"color\\\":\\\"Light\\\",\\\"text\\\":\\\"Ask me a question or select a topic to explore.\\\",\\\"wrap\\\":true,\\\"type\\\":\\\"TextBlock\\\"},{\\\"color\\\":\\\"Light\\\",\\\"text\\\":\\\" - For a personalized chat experience—including account details and available actions—<b><a href='https://www.mrcooper.com/signin'>sign in</a></b> to your digital account.\\\",\\\"wrap\\\":true,\\\"type\\\":\\\"TextBlock\\\"},{\\\"actions\\\":[{\\\"data\\\":\\\"Payments & Payoffs\\\",\\\"type\\\":\\\"Action.Submit\\\",\\\"title\\\":\\\"Payments & Payoffs\\\"},{\\\"data\\\":\\\"Escrow, Taxes, & Insurance\\\",\\\"type\\\":\\\"Action.Submit\\\",\\\"title\\\":\\\"Escrow, Taxes, & Insurance\\\"},{\\\"data\\\":\\\"Statements & 1098/1099\\\",\\\"type\\\":\\\"Action.Submit\\\",\\\"title\\\":\\\"Statements & 1098/1099\\\"},{\\\"data\\\":\\\"Mortgage Assistance\\\",\\\"type\\\":\\\"Action.Submit\\\",\\\"title\\\":\\\"Mortgage Assistance\\\"},{\\\"data\\\":\\\"Account Help\\\",\\\"type\\\":\\\"Action.Submit\\\",\\\"title\\\":\\\"Account Help\\\"}],\\\"type\\\":\\\"ActionSet\\\"}],\\\"version\\\":\\\"1.2\\\",\\\"backgroundImage\\\":{\\\"url\\\":\\\"https://storage.googleapis.com/apolloimage/images/omnichannel/ChatBotRectangle.gif\\\"},\\\"$schema\\\":\\\"http://adaptivecards.io/schemas/adaptive-card.json\\\"}\",\"name\":null,\"thumbnailUrl\":null}],\"suggestedActions\":null}",
        "tags": [
            "public",
            "client_activity_id:eg81ac5iadc"
        ],
        "timestamp": new Date("2025-10-02T17:09:22.291Z"),
        "messageType": "UserMessage",
        "sender": {
            "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278",
            "displayName": "# Erli Suo",
            "type": 2
        },
        "role": "agent"
    },
    {
        "liveChatVersion": 2,
        "id": "1759530419744",
        "properties": {
            "tags": "public,client_activity_id:3kitr9nz89",
            "originalMessageId": "1759530419744"
        },
        "content": "",
        "tags": [
            "public",
            "client_activity_id:3kitr9nz89"
        ],
        "timestamp": new Date("2025-10-03T22:26:59.744Z"),
        "messageType": "UserMessage",
        "sender": {
            "id": "8:acs:a703fdc1-4fdd-4dbf-b944-f01b67a63d54_00000029-6dbc-f924-45f7-3a3a0d004278",
            "displayName": "# Aurora User",
            "type": 2
        },
        "fileMetadata": {
            "fileSharingProtocolType": 0,
            "id": "0-wus-d10-14c948d1527314784fdd8bcb441f169a",
            "name": "ersuo-Mocha climbs up high.jpg",
            "size": 0,
            "type": "image/jpeg",
            "url": ""
        },
        "role": "agent"
    }
]


