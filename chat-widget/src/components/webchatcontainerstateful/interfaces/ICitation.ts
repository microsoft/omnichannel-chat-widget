export interface ICitation {
    id: string;
    text?: string;
    title?: string;
    type?: string;
    position?: number;
    entityType?: string;
    entityContext?: string;
    url?: string;
    searchSourceId?: string;
    chunkId?: string;
}