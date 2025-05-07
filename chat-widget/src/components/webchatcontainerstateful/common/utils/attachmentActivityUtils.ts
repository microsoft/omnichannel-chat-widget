import { HeroCard, Signin, Thumbnail } from "botframework-directlinejs";

export const createJpgFileAttachment = () => {
    return {
        contentType: "image/jpeg", 
        name: "600x400.jpg", 
        contentUrl: "https://raw.githubusercontent.com/microsoft/omnichannel-chat-sdk/e7e75d4ede351e1cf2e52f13860d2284848c4af0/playwright/public/images/600x400.jpg"
    };
};

export const createHeroCardAttachment = (): HeroCard => {
    return {
        contentType: "application/vnd.microsoft.card.hero",
        content: {
            buttons: [
                {
                    title: "Bellevue",
                    type: "imBack",
                    value: "Bellevue"
                },
                {
                    title: "Redmond",
                    type: "imBack",
                    value: "Redmond"
                },
                {
                    title: "Seattle",
                    type: "imBack",
                    value: "Seattle"
                }
            ],
            title: "Choose your location"
        }
    };
};

export const createThumbnailCardAttachment = (): Thumbnail => {
    return {
        contentType: "application/vnd.microsoft.card.thumbnail",
        content: {
            title: "Microsoft",
            subtitle: "Our mission is to empower every person and every organization on the planet to achieve more.",
            text: "Microsoft creates platforms and tools powered by AI to deliver innovative solutions that meet the evolving needs of our customers. The technology company is committed to making AI available broadly and doing so responsibly, with a mission to empower every person and every organization on the planet to achieve more.",
            images: [{
                alt: "Microsoft logo",
                url: "https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31" // logo from https://microsoft.com
            }],
            buttons: [
                {
                    title: "Learn more",
                    type: "openUrl",
                    value: "https://www.microsoft.com/"
                }
            ]
        }
    };
};

export const createSigninCardAttachment = (): Signin => {
    return {
        contentType: "application/vnd.microsoft.card.signin",
        content: {
            text: "Please login",
            buttons: [
                {
                    type: "signin",
                    title: "Signin",
                    value: "https://login.live.com/"
                }
            ]
        }
    };
};