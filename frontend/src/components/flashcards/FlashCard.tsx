"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CornerDownLeft } from "lucide-react";

interface FlashCardProps {
  front: string;
  back: string;
  index: number;
  total: number;
}

export default function FlashCard({ front, back, index, total }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="perspective w-full max-w-lg mx-auto group">
      <div
        onClick={() => setFlipped(!flipped)}
        className={`relative w-full h-72 cursor-pointer transition-transform duration-700 preserve-3d ${flipped ? "rotate-y-180" : ""
          }`}
      >
        {/* Front */}
        <Card className="absolute inset-0 backface-hidden glass bg-card/90 flex flex-col justify-between group-hover:border-primary/50 transition-colors shadow-sm">
          <CardContent className="p-8 flex flex-col justify-between h-full">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Card {index + 1} of {total}
            </span>
            <p className="text-xl font-medium text-foreground text-center leading-relaxed">
              {front}
            </p>
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                Tap to reveal
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </CardContent>
        </Card>
        {/* Back */}
        <Card className="absolute inset-0 backface-hidden rotate-y-180 glass bg-accent flex flex-col justify-between shadow-sm">
          <CardContent className="p-8 flex flex-col justify-between h-full hover:border-primary/50 border border-transparent rounded-xl transition-colors">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Answer
            </span>
            <p className="text-lg text-foreground text-center leading-relaxed">
              {back}
            </p>
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 text-xs font-medium text-foreground bg-background px-3 py-1 rounded-full border border-border">
                <CornerDownLeft className="w-3 h-3" />
                Tap to turn back
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
