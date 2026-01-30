import { Message, MessageService } from '@/types/message';
import { isProfane, cleanContent } from '@/lib/profanity';

const STORAGE_KEY = 'blackboard_mock_messages';

const INITIAL_MESSAGES: Message[] = [
    { id: '1', content: '此恨綿綿無絕期', createdAt: Date.now() - 100000 },
    { id: '2', content: '落花流水春去也', createdAt: Date.now() - 200000 },
    { id: '3', content: '天上人間', createdAt: Date.now() - 300000 },
    { id: '4', content: '行到水窮處', createdAt: Date.now() - 400000 },
    { id: '5', content: '坐看雲起時', createdAt: Date.now() - 500000 },
];

export class MockMessageService implements MessageService {
    private getLocalMessages(): Message[] {
        if (typeof window === 'undefined') return [];

        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MESSAGES));
            return INITIAL_MESSAGES;
        }
        return JSON.parse(stored);
    }

    private setLocalMessages(messages: Message[]) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }

    async getMessages(): Promise<Message[]> {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const allMessages = this.getLocalMessages();

        // Logic: Randomly select messages, favoring recent ones.
        // However, the user requirement says: "Randomly pick previous messages, and recent ones have higher chance."
        // For now, let's just return all of them or a random subset to prove the concept.
        // Improved Logic:
        // 1. Sort by date desc (recent first)
        // 2. Assign weights?
        // Let's implement a simple weighted random picker.

        const sorted = [...allMessages].sort((a, b) => b.createdAt - a.createdAt);

        // Pick N messages (e.g., 10)
        // Strategy: iterate and pick with prob decreasing with index
        const results: Message[] = [];

        // Always include the very latest 3 (to ensure user sees their post)
        const latest = sorted.slice(0, 3);
        const others = sorted.slice(3);

        results.push(...latest);

        // Pick random from others with bias
        // Simply shuffle others and pick 7?
        // Or prefer recent:
        for (const msg of others) {
            // Chance to pick decreases? 
            // Start with 50% chance, verify logic later.
            if (Math.random() > 0.3) {
                results.push(msg);
            }
            if (results.length >= 15) break;
        }

        return results;
    }

    async postMessage(content: string): Promise<Message> {
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Filter profanity
        if (isProfane(content)) {
            throw new Error('請勿使用髒話！'); // "Do not use bad words!"
        }

        const newMessage: Message = {
            id: Math.random().toString(36).substr(2, 9),
            content: content,
            createdAt: Date.now(),
        };

        const current = this.getLocalMessages();
        this.setLocalMessages([newMessage, ...current]);

        return newMessage;
    }
}
