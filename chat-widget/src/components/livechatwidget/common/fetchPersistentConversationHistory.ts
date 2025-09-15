import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";

async function fetchPersistentConversationHistorybackup(facadeChatSDK: FacadeChatSDK, options: { pageSize?: number | string; pageToken?: string } = {}) {
    console.log("LOPEZ history");
    /*
    // Get the chatSDK from the facade
    const chatSDK = facadeChatSDK.getChatSDK();
    
    // Check if chatSDK is available
    if (!chatSDK) {
        console.error("LOPEZ :: chatSDK is not available from facade");
        return null;
    }
    
    // Check if required properties exist
    if (!chatSDK.omnichannelConfig) {
        console.error("LOPEZ :: omnichannelConfig is not available in chatSDK");
        return null;
    }
    
    const omnichannelConfig = chatSDK.omnichannelConfig;
    const authToken = chatSDK.authenticatedUserToken;
    const authCodeNone = chatSDK.OCClient?.configuration?.authCodeNonce;
    
    // Validate required configuration
    if (!omnichannelConfig.orgUrl || !omnichannelConfig.orgId || !omnichannelConfig.widgetId) {
        console.error("LOPEZ :: Missing required omnichannelConfig properties", omnichannelConfig);
        return null;
    }
    
    if (!authToken) {
        console.error("LOPEZ :: authenticatedUserToken is not available");
        return null;
    }
    
    if (!authCodeNone) {
        console.error("LOPEZ :: authCodeNonce is not available");
        return null;
    }
    
    const requestUrl = `${omnichannelConfig.orgUrl}/livechatconnector/auth/organization/${omnichannelConfig.orgId}/widgetapp/${omnichannelConfig.widgetId}/conversation/history`;
    const url = new URL(requestUrl);

    if (options.pageSize) {
        url.searchParams.append("pageSize", `${options.pageSize}`);
    }

    console.log("LOPEZ :: Persistent chat 1", url.toString(), authToken, authCodeNone, options.pageToken);

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authcodenonce": `${authCodeNone}`,
        "Authenticatedusertoken": `${authToken}`
    };

    if (options.pageToken) {
        headers["PageToken"] = `${options.pageToken}`;
    }

    console.log("LOPEZ :: Persistent chat 1", url.toString(), headers);

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: headers
        });
        console.log("LOPEZ :: Persistent chat 2", response);
        if (response.ok) {
            const data = await response.json();
            console.log("LOPEZ :: Persistent chat response data:", data);
            return data;
        } else {
            console.error("LOPEZ :: Persistent chat API error:", response.status, response.statusText);
            return null;
        }
    } catch (err) {
        console.error("LOPEZ :: Persistent chat fetch error:", err);
        return null;
    }
        */
}

export default fetchPersistentConversationHistorybackup;