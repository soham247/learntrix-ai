import Link from "next/link";
import FlashcardsContent from "@/components/flashcards/FlashCardContent";

export default async function FlashcardsPage({
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
    <FlashcardsContent sessionId={sessionId} loadingChildren={
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded-lg w-1/3 mx-auto" />
          <div className="h-72 glass bg-card/50 rounded-3xl border border-border" />
        </div>
        <p className="mt-8 text-sm font-medium text-muted-foreground">Generating flashcards...</p>
      </div>
    } />
  );
}
