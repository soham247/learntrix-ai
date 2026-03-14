"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Brain, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-4 mb-6 items-end ${isUser ? "flex-row-reverse ml-auto" : "flex-row"}`}>
      <Avatar className="w-8 h-8 shrink-0 mb-1 shadow-sm">
        <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-muted border border-border text-muted-foreground"}>
          {isUser ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4 text-primary" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={`rounded-2xl px-5 py-3.5 shadow-sm overflow-hidden ${isUser
          ? "max-w-[85%] bg-primary text-primary-foreground rounded-br-sm"
          : "w-full max-w-[85%] auto-rows-auto glass bg-card text-card-foreground border-border rounded-bl-sm border prose prose-sm dark:prose-invert wrap-break-words text-[15px] leading-relaxed prose-code:before:content-none prose-code:after:content-none"
          }`}
      >
        {isUser ? (
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap m-0">{content}</p>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
