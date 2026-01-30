import { Message } from "@/types/message";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";
import { useEffect, useState } from "react";

interface MessageStickerProps {
    message: Message;
    className?: string;
    style?: React.CSSProperties;
    index?: number; // Used for random paper selection stability
}

export function MessageSticker({ message, className, style, index = 0 }: MessageStickerProps) {
    const [mounted, setMounted] = useState(false);

    // Random paper background (1-6)
    // Use a deterministic way based on index or ID to keep it stable during renders
    // If we rely on ID, it works.
    const paperIndex = (message.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6) + 1;
    const paperImage = `/img/paper${paperIndex}.jpg`;

    useEffect(() => {
        // Trigger entrance animation
        const timer = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className={cn(
                "absolute p-8 shadow-lg w-[320px] h-[320px] flex flex-col justify-center items-center text-center select-none transition-all duration-1000 ease-out",
                // Typography
                "font-serif text-3xl font-bold tracking-widest text-[#2c1e13]", // Dark brown text for paper feel
                className
            )}
            style={{
                ...style,
                backgroundImage: `url(${paperImage})`,
                backgroundSize: "cover",
                boxShadow: "10px 10px 30px rgba(0,0,0,0.3)",
                // Animation states
                opacity: mounted ? 1 : 0,
                transform: mounted
                    ? `${style?.transform || 'rotate(0deg)'} scale(1)`
                    : `translate(-50%, -50%) scale(1.5)`, // Start from center-ish and large? 
                // Actually parent controls position relative to top/left.
                // If we want it to "fly in" from center, we need to know center relative to current pos.
                // Easier approach: Start Large vs Normal.
                // Default style has top/left.
            }}
        >
            <div
                className="flex-grow flex items-center justify-center break-words w-full"
                style={{ lineHeight: "1.6" }}
            >
                {/* Split 8 chars into 2 lines if needed or just let flex wrap? 
            Original code: substring(0,4) + <br> + substring(4,8). 
            Let's emulate that specifically if length > 4 */}
                <div>
                    {message.content.length > 4 ? (
                        <>
                            <div>{message.content.substring(0, 4)}</div>
                            <div>{message.content.substring(4)}</div>
                        </>
                    ) : message.content}
                </div>
            </div>

            {/* Date */}
            <div className="text-sm opacity-50 mt-2 font-sans absolute bottom-4 right-4">
                {formatDistanceToNow(message.createdAt, { addSuffix: true, locale: zhTW })}
            </div>
        </div>
    );
}
