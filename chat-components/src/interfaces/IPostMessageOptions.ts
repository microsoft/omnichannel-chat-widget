export interface IPostMessageOptions {
    retry?: boolean; // Whether to start queuing messages 
    deferTimeout?: number;  // Timeout to prevent race conditions when queueing
    queueTimeout?: number; // Timeout to process the queue
}