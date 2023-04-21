const createChatTranscript = (transcript: string) => {
    console.log("[createChatTranscript]");
    const data = JSON.parse(transcript);
    console.log(data);
};

export default createChatTranscript;