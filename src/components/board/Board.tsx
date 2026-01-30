"use client";

import { MessageSticker } from "./MessageSticker";
import { MessageInput } from "./MessageInput";
import { useBoard } from "@/hooks/useBoard";

export function Board() {
    const { activeMessages, loading, handlePostMessage } = useBoard();

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const bgImage = `${basePath}/img/board.jpg`;

    return (
        <div
            className="relative w-full h-screen overflow-hidden bg-stone-800 bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${bgImage}')` }}
        >

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
                    paperIndex={msg.paperIndex}
                    style={{
                        top: `${msg.y}%`,
                        left: `${msg.x}%`,
                        zIndex: index,
                        transform: `rotate(${msg.rotation}deg)`,
                    }}
                />
            ))}

            <MessageInput onMessagePosted={handlePostMessage} />
        </div>
    );
}
