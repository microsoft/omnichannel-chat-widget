export interface IPostMessageOptions {
    retry?: boolean; // Whether to start queuing messages 
    queueTimeout?: number; // Timeout to process the queue
}