import { cn } from "@/lib/utils";
import { Message } from "@/types/message";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";
import { useEffect, useState } from "react";

interface MessageStickerProps {
    message: Message;
    className?: string;
    style?: React.CSSProperties;
    paperIndex?: number; // 1-6
}

export function MessageSticker({ message, className, style, paperIndex }: MessageStickerProps) {
    const [fadeIn, setFadeIn] = useState(false);
    const [moveToPosition, setMoveToPosition] = useState(false);
    const [initialSize, setInitialSize] = useState(820);

    useEffect(() => {
        const updateSize = () => {
            const h = window.innerHeight;
            const size = Math.min(h * 0.8, 850);
            setInitialSize(size);
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const [finalPaperIndex] = useState(() => {
        if (paperIndex !== undefined) return paperIndex;
        return (Math.floor(Math.random() * 6) + 1);
    });

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const paperImage = `${basePath}/img/paper${finalPaperIndex}.jpg`;

    useEffect(() => {
        const fadeTimer = setTimeout(() => setFadeIn(true), 50);
        const moveTimer = setTimeout(() => setMoveToPosition(true), 1500);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(moveTimer);
        };
    }, []);

    // Calculate font size based on content length and animation state
    const getFontSize = () => {
        // Stage 1: Large (820x820)
        // Stage 2: Small (320x320)
        if (!moveToPosition) {
            return message.content.length <= 6 ? 110 :
                message.content.length <= 12 ? 80 : 60;
        } else {
            return message.content.length <= 6 ? 38 :
                message.content.length <= 12 ? 28 : 22;
        }
    };

    return (
        <div
            className={cn(
                "absolute p-8 shadow-lg flex flex-col justify-center items-center text-center select-none",
                // Typography
                "font-black tracking-widest text-[#2c1e13] font-[family-name:var(--font-cute)]",
                className
            )}
            style={{
                backgroundImage: `url(${paperImage})`,
                backgroundSize: "cover",
                boxShadow: "10px 10px 30px rgba(0,0,0,0.3)",
                // Stage 1: Dynamic large size at center (referenced to window height)
                // Stage 2: Fixed small size at target position (320x320)
                left: moveToPosition ? style?.left : '50%',
                top: moveToPosition ? style?.top : '50%',
                width: moveToPosition ? '320px' : `${initialSize}px`,
                height: moveToPosition ? '320px' : `${initialSize}px`,
                opacity: fadeIn ? 1 : 0,
                transform: moveToPosition
                    ? `${style?.transform || 'rotate(0deg)'}`
                    : 'translate(-50%, -50%) rotate(0deg)',
                transition: moveToPosition
                    ? 'all 900ms ease-out'
                    : 'opacity 400ms linear',
            }}
        >
            <div
                className="flex-grow flex items-center justify-center break-words w-full px-4"
                style={{ lineHeight: "1.4" }}
            >
                <div
                    style={{
                        fontSize: `${getFontSize()}px`,
                        textShadow: "1px 1px 2px rgba(255,255,255,0.9), 2px 2px 4px rgba(255,255,255,0.7), 3px 3px 6px rgba(255,255,255,0.5)",
                        WebkitTextStroke: "0.5px rgba(44,30,19,0.8)",
                        letterSpacing: "0.05em",
                        transition: moveToPosition ? 'font-size 900ms ease-out' : 'none',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        whiteSpace: 'pre-wrap',
                        display: '-webkit-box',
                        WebkitLineClamp: 4, // Max lines to prevent "pushing down" too far
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
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
