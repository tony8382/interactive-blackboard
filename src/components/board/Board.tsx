"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Message } from "@/types/message";
import { messageService } from "@/services";
import { MessageSticker } from "./MessageSticker";
import { MessageInput } from "./MessageInput";

interface PositionedMessage extends Message {
    x: number; // percentage
    y: number; // percentage
    rotation: number; // degrees
    key: string; // Unique key for rendering
}

const MAX_STICKERS = 6; // Keep around 5-6 as per original logic

export function Board() {
    const [activeMessages, setActiveMessages] = useState<PositionedMessage[]>([]);
    const [messageQueue, setMessageQueue] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    // Refs for intervals to avoid stale closures
    const activeMessagesRef = useRef<PositionedMessage[]>([]);

    // Helper to get random position (avoiding edges)
    const getRandomPosition = () => ({
        x: Math.random() * 60 + 10, // 10% to 70%
        y: Math.random() * 60 + 10, // 10% to 70%
        rotation: Math.random() * 30 - 15 // -15 to +15 deg
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

    // 2. Timer Loop (The "Motion" loop)
    useEffect(() => {
        if (loading || messageQueue.length === 0) return;

        const interval = setInterval(() => {
            // Pick a message (randomly or sequentially from queue)
            // Original logic: Sequential from Parse result, but results were randomized?
            // Let's pick random from our pool to ensure variety if pool is static.
            // OR shift from queue if we want to cycle through.

            const randomIndex = Math.floor(Math.random() * messageQueue.length);
            const nextMsg = messageQueue[randomIndex]; // Re-use messages? Yes.

            if (!nextMsg) return;

            const pos = getRandomPosition();
            const newSticker: PositionedMessage = {
                ...nextMsg,
                ...pos,
                key: `${nextMsg.id}-${Date.now()}` // Unique key to force re-mount if same msg appears again
            };

            setActiveMessages(prev => {
                const next = [...prev, newSticker];
                if (next.length > MAX_STICKERS) {
                    // Remove the oldest (first one)
                    // In React, removing the first item triggers re-render of list.
                    // We want the removal to be animated (fade out).
                    // But for now, simple removal. Stick to "appear one by one".
                    return next.slice(next.length - MAX_STICKERS);
                }
                return next;
            });

        }, 3000); // Every 3 seconds

        return () => clearInterval(interval);
    }, [loading, messageQueue]);


    // Handler for new user message
    const handleNewMessage = useCallback(async () => {
        // re-fetch pool
        await fetchPool();
        // Should we immediately show it?
        // user wants to see it.
        // We can just let the random loop pick it up eventually, OR force inject it?
        // Let's force inject to be responsive.
        // But wait, fetchPool might update state. 
        // Let's trust fetchPool updates queue, and chance picks it up. 
        // Or better: Prepend to queue or force next pick.
    }, [fetchPool]);


    return (
        <div className="relative w-full h-screen overflow-hidden bg-stone-800 bg-[url('/img/board.jpg')] bg-contain bg-center bg-no-repeat">
            {/* Overlay for legibility if needed */}
            {/* <div className="absolute inset-0 bg-black/10 pointer-events-none"></div> */}

            {loading && activeMessages.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="animate-pulse">Loading Board...</div>
                </div>
            )}

            {activeMessages.map((msg, index) => (
                <MessageSticker
                    key={msg.key}
                    message={msg}
                    index={index}
                    style={{
                        top: `${msg.y}%`,
                        left: `${msg.x}%`,
                        zIndex: index, // Newer on top
                        transform: `rotate(${msg.rotation}deg)`,
                    }}
                />
            ))}

            <MessageInput onMessagePosted={handleNewMessage} />
        </div>
    );
}
