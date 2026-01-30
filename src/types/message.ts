export interface Message {
    id: string;
    content: string;
    createdAt: number; // Timestamp
    deviceInfo?: string; // Optional metadata
}

export interface MessageService {
    getMessages(): Promise<Message[]>;
    postMessage(content: string): Promise<Message>;
    subscribeToMessages?(callback: (messages: Message[]) => void): () => void; // Optional for implementation that supports it
}
