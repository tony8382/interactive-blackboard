"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Send } from "lucide-react";
import { useState } from "react";

interface MessageInputProps {
    onMessagePosted: (content: string) => Promise<void>;
}

export function MessageInput({ onMessagePosted }: MessageInputProps) {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const MAX_LENGTH = 20;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!content.trim()) return;
        if (content.length > MAX_LENGTH) {
            alert(`字數請控制在 ${MAX_LENGTH} 字以內`);
            return;
        }

        setLoading(true);
        try {
            await onMessagePosted(content);
            setContent("");
            setOpen(false);
        } catch (error: any) {

        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="cursor-pointer fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-2xl bg-black hover:bg-gray-800 text-white transition-transform hover:scale-110 z-50"
                    aria-label="New Message"
                >
                    <Plus className="h-8 w-8" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>寫下你的祝福</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                    <input
                        autoFocus
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-1 px-4 py-2 border-2 border-stone-800 rounded bg-[#f0e6d2] font-serif text-lg focus:outline-none focus:ring-2 focus:ring-stone-500"
                        placeholder="保持熱愛 奔赴山海 🌊"
                    />
                    <div className="text-right text-xs text-muted-foreground">
                        {content.length}/{MAX_LENGTH}
                    </div>
                    <Button
                        type="submit"
                        disabled={loading || content.length === 0 || content.length > MAX_LENGTH}
                        className="w-full group cursor-pointer disabled:cursor-not-allowed"
                    >
                        {loading ? "送出中..." : (
                            <div className="flex items-center justify-center gap-2">
                                <span>送出</span>
                                <Send className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                            </div>
                        )}
                    </Button>
                </form>
                {/* Visual Hint */}
                <div className="mt-2 text-xs text-center space-y-1">
                    <div className="text-stone-500">
                        💡 建議：簡短的祝福更令人印象深刻
                    </div>
                    <div className="text-amber-600 font-semibold flex items-center justify-center gap-1">
                        <span>⚠️</span>
                        <span>送出後將永久保留，無法刪除</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
