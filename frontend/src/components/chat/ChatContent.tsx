"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessageComponent from "@/components/chat/ChatMessage";
import { chatStream, ChatMessage } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatContentProps {
    sessionId: string;
    children?: React.ReactNode;
}

export default function ChatContent({ sessionId, children }: ChatContentProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [streaming, setStreaming] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleSend = async () => {
        if (!input.trim() || !sessionId || streaming) return;

        const userMessage: ChatMessage = { role: "user", content: input.trim() };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setStreaming(true);

        const assistantMessage: ChatMessage = { role: "assistant", content: "" };
        setMessages((prev) => [...prev, assistantMessage]);

        try {
            await chatStream(
                sessionId,
                userMessage.content,
                messages,
                (chunk) => {
                    setMessages((prev) => {
                        const updated = [...prev];
                        const last = updated[updated.length - 1];
                        updated[updated.length - 1] = {
                            ...last,
                            content: last.content + chunk,
                        };
                        return updated;
                    });
                },
                () => {
                    setStreaming(false);
                }
            );
        } catch {
            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    role: "assistant",
                    content: "Sorry, something went wrong. Please try again.",
                };
                return updated;
            });
            setStreaming(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Messages */}
            <div
                className="flex-1 overflow-y-auto px-4 py-6"
                ref={scrollContainerRef}
            >
                <div className="max-w-3xl mx-auto flex flex-col items-center">
                    {messages.length === 0 && children}
                    <div className="w-full">
                        {messages.map((msg, idx) => (
                            <ChatMessageComponent
                                key={idx}
                                role={msg.role}
                                content={msg.content}
                            />
                        ))}
                        {streaming && (
                            <div className="flex justify-start mb-6">
                                <div className="glass bg-card text-card-foreground border border-border rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm flex items-center">
                                    <div className="flex gap-1.5 items-center h-2">
                                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                                        <div
                                            className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"
                                            style={{ animationDelay: "0.2s" }}
                                        />
                                        <div
                                            className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"
                                            style={{ animationDelay: "0.4s" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Input */}
            <div className="px-4 py-4 shrink-0">
                <div className="max-w-3xl mx-auto flex gap-3 relative backdrop-blur-md">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question about the content..."
                        rows={1}
                        className="flex-1 py-4 pl-5 pr-14 rounded-2xl resize-none shadow-sm min-h-15 bg-card border-border focus-visible:ring-primary"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || streaming}
                        size="icon"
                        className="absolute right-2 top-2 bottom-2 h-auto rounded-xl shadow-sm"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </>
    );
}
