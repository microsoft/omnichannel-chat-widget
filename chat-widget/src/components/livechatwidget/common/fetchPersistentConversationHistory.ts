

async function fetchPersistentConversationHistory(options: { pageSize?: number | string; pageToken?: string } = {}) {
    // Access the injected chatSDK on window without changing global types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatSDK = (window as any).chatSDK;
    const omnichannelConfig = chatSDK.omnichannelConfig;
    const authToken = chatSDK.authenticatedUserToken;
    const authCodeNone = chatSDK.OCClient.configuration.authCodeNonce;
    const requestUrl = `${omnichannelConfig.orgUrl}/livechatconnector/auth/organization/${omnichannelConfig.orgId}/widgetapp/${omnichannelConfig.widgetId}/conversation/history`;
    const url = new URL(requestUrl);

    if (options.pageSize) {
        url.searchParams.append("pageSize", `${options.pageSize}`);
    }

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authcodenonce": `${authCodeNone}`,
        "Authenticatedusertoken": `${authToken}`
    };

    if (options.pageToken) {
        headers["PageToken"] = `${options.pageToken}`;
    }

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: headers
        });
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            return data;
        }
    } catch (err) {
        console.log(err);
    }
    console.log(authToken);
}

export default fetchPersistentConversationHistory;