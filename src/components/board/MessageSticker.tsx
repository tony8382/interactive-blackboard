import { cn } from "@/lib/utils";
import { Message } from "@/types/message";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";
import { useEffect, useState } from "react";

interface MessageStickerProps {
    message: Message;
    className?: string;
    style?: React.CSSProperties;
    index?: number; // Used for random paper selection stability
    paperIndex?: number; // 1-6
}

export function MessageSticker({ message, className, style, index = 0, paperIndex }: MessageStickerProps) {
    const [mounted, setMounted] = useState(false);

    const finalPaperIndex = paperIndex || (Math.floor(Math.random() * 6) + 1);
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const paperImage = `${basePath}/img/paper${finalPaperIndex}.jpg`;

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
                "font-black tracking-widest text-[#2c1e13] font-[family-name:var(--font-cute)]", // Remove fixed size, handled by inner logic
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
                    : `translate(-50%, -50%) scale(1.5)`,
            }}
        >
            <div
                className="flex-grow flex items-center justify-center break-words w-full px-4"
                style={{ lineHeight: "1.4" }}
            >
                <div
                    className={cn(
                        // Dynamic font sizing
                        message.content.length <= 6 ? "text-5xl" :
                            message.content.length <= 12 ? "text-4xl" : "text-3xl",
                    )}
                    style={{
                        textShadow: "1px 1px 2px rgba(255,255,255,0.9), 2px 2px 4px rgba(255,255,255,0.7), 3px 3px 6px rgba(255,255,255,0.5)",
                        WebkitTextStroke: "0.5px rgba(44,30,19,0.8)",
                        letterSpacing: "0.05em"
                    }}
                >
                    {message.content}
                </div>
            </div>

            {/* Date */}
            <div className="text-sm opacity-50 mt-2 font-sans absolute top-4 right-4">
                {formatDistanceToNow(message.createdAt, { addSuffix: true, locale: zhTW })}
            </div>
        </div>
    );
}
