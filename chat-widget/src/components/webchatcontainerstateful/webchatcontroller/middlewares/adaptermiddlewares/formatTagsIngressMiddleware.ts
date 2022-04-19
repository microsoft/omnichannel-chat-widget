// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatTagsIngressMiddleware = () => (next: (arg0: any) => any) => (activity: any) => {
    const activity_instance = JSON.parse(JSON.stringify(activity));
    if (activity_instance) {
        if (activity_instance.channelData && activity_instance.channelData.tags) {
            const { tags } = activity_instance.channelData;
            if (typeof tags === "string") {
                try { //If it is json format, parse the tags. Catch block will convert string to array.(We do not need to log anything since its not an error)
                    activity_instance.channelData.tags = JSON.parse(tags);
                }
                catch {
                    activity_instance.channelData.tags = tags.split(",");
                }
            }
        }
    }
    return next(activity_instance);
};

export default formatTagsIngressMiddleware;