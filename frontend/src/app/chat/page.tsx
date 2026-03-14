import Link from "next/link";
import { MessageSquare } from "lucide-react";
import ChatContent from "@/components/chat/ChatContent";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : undefined;

  if (!sessionId) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">
          No session found.{" "}
          <Link href="/" className="text-foreground font-medium hover:underline">
            Go home
          </Link>{" "}
          to process content first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto -mb-12">
      <ChatContent sessionId={sessionId}>
        <div className="text-center py-20 w-full">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <MessageSquare className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2 tracking-tight">
            Chat with your content
          </h2>
          <p className="text-muted-foreground font-medium">
            Ask questions about the material you uploaded
          </p>
        </div>
      </ChatContent>
    </div>
  );
}
