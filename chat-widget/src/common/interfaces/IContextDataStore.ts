export interface IContextDataStore {
    /**
     * getData: Get data from data store
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getData: (key: string, type: string) => any;

    /**
     * setData: Set data to data store
     */
    setData: (key: string, value: string) => void;

    /**
     * removeData: Remove data from data store by key
     */
    removeData?: (key: string) => void;
}