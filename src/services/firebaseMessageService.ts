import { Message, MessageService } from "@/types/message";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp, onSnapshot } from "firebase/firestore";
import { isProfane } from "@/lib/profanity";

const COLLECTION_NAME = "messages";

export class FirebaseMessageService implements MessageService {
    async getMessages(): Promise<Message[]> {
        try {
            // Fetch recent messages first
            const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"), limit(50));
            const querySnapshot = await getDocs(q);

            const messages: Message[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                messages.push({
                    id: doc.id,
                    content: data.content,
                    createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
                });
            });

            return messages;
        } catch (error) {
            console.error("Error fetching messages:", error);
            return [];
        }
    }

    // Realtime subscription
    subscribeToMessages(callback: (messages: Message[]) => void): () => void {
        // Listen to the last 20 messages for realtime updates
        const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"), limit(20));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messages: Message[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                messages.push({
                    id: doc.id,
                    content: data.content,
                    createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
                });
            });
            callback(messages);
        });

        return unsubscribe;
    }

    async postMessage(content: string): Promise<Message> {
        if (isProfane(content)) {
            throw new Error("請勿使用髒話！");
        }

        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            content,
            createdAt: Timestamp.now(),
        });

        return {
            id: docRef.id,
            content,
            createdAt: Date.now(),
        };
    }
}
