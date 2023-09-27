
export interface ILiveChatWidgetExternalStorage {
    useExternalStorage: boolean | false;
    timeOutWaitForResponse: number | 1000;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cachedData : any | null;
}