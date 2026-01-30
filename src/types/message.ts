export interface Message {
    id: string;
    content: string;
    createdAt: number; // Timestamp
    deviceInfo?: string; // Optional metadata
}

export interface MessageService {
    getMessages(): Promise<Message[]>;
    postMessage(content: string): Promise<Message>;
}
