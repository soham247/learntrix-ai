"use client";

import { useState } from "react";
import Link from "next/link";
import FlashCard from "@/components/flashcards/FlashCard";
import { generateFlashcards } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Flashcard {
  front: string;
  back: string;
}

interface FlashCardContentProps {
  sessionId: string;
  loadingChildren: React.ReactNode;
}

export default function FlashcardsContent({ sessionId, loadingChildren }: FlashCardContentProps) {
  const [current, setCurrent] = useState(0);

  const { data: flashcards = [], isLoading: loading, error } = useQuery<Flashcard[]>({
    queryKey: ['flashcards', sessionId],
    queryFn: async () => {
      const data = await generateFlashcards(sessionId);
      return data.flashcards;
    },
    enabled: !!sessionId,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  if (loading) {
    return <>{loadingChildren}</>;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <p className="text-sm font-medium text-destructive">{error instanceof Error ? error.message : "Failed to load flashcards"}</p>
        </div>
      </div>
    );
  }

  if (!flashcards.length) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
          Flashcards
        </h1>
        <p className="text-muted-foreground font-medium">
          {flashcards.length} cards generated — click to flip
        </p>
      </div>

      <FlashCard
        key={current}
        front={flashcards[current].front}
        back={flashcards[current].back}
        index={current}
        total={flashcards.length}
      />

      {/* Navigation */}
      <div className="flex items-center justify-center gap-6 mt-10">
        <Button
          variant="outline"
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
          className="px-6 py-6 rounded-xl font-medium"
        >
          Previous
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          {current + 1} / {flashcards.length}
        </span>
        <Button
          onClick={() =>
            setCurrent(Math.min(flashcards.length - 1, current + 1))
          }
          disabled={current === flashcards.length - 1}
          className="px-8 py-6 rounded-xl font-medium"
        >
          Next
        </Button>
      </div>

      {/* Links to other sections */}
      <div className="flex justify-center gap-6 mt-16 pt-8 border-t border-border">
        <Link
          href={`/quiz?session_id=${sessionId}`}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 group"
        >
          Take Quiz <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        <div className="w-px h-4 bg-border my-auto" />
        <Link
          href={`/chat?session_id=${sessionId}`}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 group"
        >
          Chat with Content <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
