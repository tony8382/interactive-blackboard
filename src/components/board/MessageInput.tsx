"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { messageService } from "@/services";
import { Plus, Send } from "lucide-react";

export function MessageInput({ onMessagePosted }: { onMessagePosted: () => void }) {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    // const { toast } = useToast(); // If toast is available

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        if (content.length > 8) {
            alert("字數不能超過8個字！"); // Max 8 chars
            return;
        }

        setLoading(true);
        try {
            await messageService.postMessage(content);
            setContent("");
            setOpen(false);
            onMessagePosted();
            // toast({ title: "留言成功！" });
        } catch (error: any) {
            alert(error.message);
            // toast({ title: "留言失敗", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-2xl bg-black hover:bg-gray-800 text-white transition-transform hover:scale-110 z-50"
                    aria-label="New Message"
                >
                    <Plus className="h-8 w-8" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>寫下你的留言 (最多8個字)</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                    <Input
                        placeholder="說點什麼..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        maxLength={20} // Allow typing a bit more to let them delete
                        className="text-lg"
                        autoFocus
                    />
                    <div className="text-right text-xs text-muted-foreground">
                        {content.length}/8
                    </div>
                    <Button type="submit" disabled={loading || content.length === 0 || content.length > 8}>
                        {loading ? "送出中..." : <><Send className="mr-2 h-4 w-4" /> 送出</>}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
