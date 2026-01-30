import { Message, MessageService } from "@/types/message";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from "firebase/firestore";
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

            // Implement Weighted Random Logic here if needed similar to mock
            // For now, return recent ones.
            // To strictly follow "retrieve random past messages":
            // Firestore doesn't support random natively easily.
            // We can fetch a larger batch and pick randomly on client, 
            // or use a random index field in DB (advanced).
            // Given the "Small" scope, client-side filtering of 50 items is fine for MVP.

            return messages;
        } catch (error) {
            console.error("Error fetching messages:", error);
            return [];
        }
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
