import { useState, useEffect, useRef, useCallback } from "react";
import { Message } from "@/types/message";
import { messageService } from "@/services";
import { toast } from "sonner";

export interface PositionedMessage extends Message {
    x: number;
    y: number;
    rotation: number;
    key: string;
    paperIndex?: number;
}

const MAX_STICKERS = 6;

export function useBoard() {
    const [activeMessages, setActiveMessages] = useState<PositionedMessage[]>([]);
    const [messageQueue, setMessageQueue] = useState<Message[]>([]);
    const [priorityQueue, setPriorityQueue] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const deckRef = useRef<Message[]>([]);
    const startTime = useRef(Date.now());

    // Helper to get random position (avoiding edges)
    const getRandomPosition = () => ({
        x: Math.random() * 60 + 10,
        y: Math.random() * 60 + 10,
        rotation: Math.random() * 30 - 15
    });

    // 1. Initial Fetch
    const fetchPool = useCallback(async () => {
        try {
            setLoading(true);
            const fetched = await messageService.getMessages();
            setMessageQueue(fetched);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPool();
    }, [fetchPool]);

    // 2. Realtime Subscription
    useEffect(() => {
        if (!messageService.subscribeToMessages) return;

        const unsubscribe = messageService.subscribeToMessages((newMessages) => {
            const validNew = newMessages.filter(m => m.createdAt > startTime.current);

            if (validNew.length > 0) {
                setPriorityQueue(prev => {
                    const ids = new Set(prev.map(p => p.id));
                    const trulyNew = validNew.filter(m => !ids.has(m.id));
                    return [...prev, ...trulyNew];
                });

                setMessageQueue(prev => {
                    const ids = new Set(prev.map(p => p.id));
                    const trulyNew = validNew.filter(m => !ids.has(m.id));
                    return [...trulyNew, ...prev];
                });
            }
        });

        return () => unsubscribe();
    }, []);

    // 3. Deck Management
    useEffect(() => {
        if (deckRef.current.length === 0 && messageQueue.length > 0) {
            deckRef.current = [...messageQueue].sort(() => Math.random() - 0.5);
        }
    }, [messageQueue]);

    // 4. Timer Loop
    useEffect(() => {
        if (loading && messageQueue.length === 0) return;

        const interval = setInterval(() => {
            let nextMsg: Message | undefined;

            if (priorityQueue.length > 0) {
                nextMsg = priorityQueue[0];
                setPriorityQueue(prev => prev.slice(1));
            }
            else if (messageQueue.length > 0) {
                if (deckRef.current.length === 0) {
                    deckRef.current = [...messageQueue].sort(() => Math.random() - 0.5);
                }
                nextMsg = deckRef.current.pop();
            }

            if (!nextMsg) return;

            const pos = getRandomPosition();
            const paperIndex = Math.floor(Math.random() * 6) + 1;

            const newSticker: PositionedMessage = {
                ...nextMsg,
                ...pos,
                key: `${nextMsg.id}-${Date.now()}`,
                paperIndex
            };

            setActiveMessages(prev => {
                const next = [...prev, newSticker];
                if (next.length > MAX_STICKERS) {
                    return next.slice(next.length - MAX_STICKERS);
                }
                return next;
            });

        }, 3000);

        return () => clearInterval(interval);
    }, [loading, messageQueue, priorityQueue]);

    // 5. Handle Posting (Optimistic UI)
    const handlePostMessage = async (content: string) => {
        // Optimistic Add
        const tempId = `temp-${Date.now()}`;
        const tempMsg: Message = {
            id: tempId,
            content,
            createdAt: Date.now()
        };

        const pos = getRandomPosition();
        const paperIndex = Math.floor(Math.random() * 6) + 1;

        const optimisticSticker: PositionedMessage = {
            ...tempMsg,
            ...pos,
            key: tempId,
            paperIndex
        };

        // Force add to view immediately
        setActiveMessages(prev => {
            const next = [...prev, optimisticSticker];
            // Ensure we don't exceed max too much, but for user feedback, shrinking old ones is fine.
            return next.length > MAX_STICKERS ? next.slice(next.length - MAX_STICKERS) : next;
        });

        try {
            await messageService.postMessage(content);
            // Success
        } catch (error: any) {
            console.error(error);
            toast.error("留言失敗", { description: error.message || "請稍後再試" });
            // Rollback optimistic update
            setActiveMessages(prev => prev.filter(m => m.key !== tempId));
            // Throw error so input knows? Or Input just trusts us?
            // Input expects void or promise.
            throw error; // Let input handle UI state (loading) if needed, but we handled toast
        }
    };

    return {
        activeMessages,
        loading,
        handlePostMessage
    };
}
