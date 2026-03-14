"use client";

interface QuizQuestionProps {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  index: number;
  selectedAnswer: number | null;
  submitted: boolean;
  onSelect: (index: number, answer: number) => void;
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";

interface QuizQuestionProps {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  index: number;
  selectedAnswer: number | null;
  submitted: boolean;
  onSelect: (index: number, answer: number) => void;
}

export default function QuizQuestion({
  question,
  options,
  correctAnswer,
  explanation,
  index,
  selectedAnswer,
  submitted,
  onSelect,
}: QuizQuestionProps) {
  return (
    <Card className="w-full shadow-sm glass">
      <CardHeader>
        <CardTitle className="text-lg font-medium leading-relaxed flex items-start">
          <span className="text-muted-foreground font-semibold mr-2 shrink-0">{index + 1}.</span>
          <span>{question}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedAnswer !== null && selectedAnswer !== undefined ? selectedAnswer.toString() : undefined}
          onValueChange={(val) => !submitted && onSelect(index, parseInt(val))}
          disabled={submitted}
          className="space-y-3"
        >
          {options.map((option, optIdx) => {
            let optionClass = "border-border bg-card text-card-foreground";
            let Icon = null;

            if (submitted) {
              if (optIdx === correctAnswer) {
                optionClass =
                  "border-green-500 bg-green-500/10 text-green-600 ring-1 ring-green-500 shadow-sm dark:text-green-400 dark:border-green-400 dark:ring-green-400";
                Icon = <Check className="w-5 h-5 text-green-600 dark:text-green-400" />;
              } else if (optIdx === selectedAnswer && optIdx !== correctAnswer) {
                optionClass =
                  "border-red-500 bg-red-500/10 text-red-600 ring-1 ring-red-500 shadow-sm dark:text-red-400 dark:border-red-400 dark:ring-red-400";
                Icon = <X className="w-5 h-5 text-red-600 dark:text-red-400" />;
              } else {
                 optionClass = "border-border bg-muted/50 text-muted-foreground opacity-50";
              }
            } else if (optIdx === selectedAnswer) {
              optionClass =
                "border-primary bg-primary text-primary-foreground shadow-md";
            }

            return (
              <Label
                key={optIdx}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer font-normal group ${optionClass} ${!submitted ? "hover:border-primary/50" : ""
                  }`}
              >
                <div className="flex items-center gap-3 pt-0.5">
                  <RadioGroupItem
                    value={optIdx.toString()}
                    id={`q${index}-o${optIdx}`}
                    className="sr-only" // visually hide the actual radio circle if we want just a card, but maybe we let it show? Let's hide it and use our own indicator, or just use the whole card as a label
                  />
                  <span
                    className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-full border text-xs font-medium ${!submitted && optIdx === selectedAnswer
                        ? "border-primary-foreground/30 text-primary-foreground"
                        : "border-muted-foreground/30 group-hover:border-primary/50"
                      }`}
                  >
                    {Icon ? Icon : String.fromCharCode(65 + optIdx)}
                  </span>
                </div>
                <span
                  className={`pt-0.5 text-base leading-snug ${submitted && optIdx === selectedAnswer && optIdx !== correctAnswer
                      ? "line-through text-muted-foreground"
                      : ""
                    }`}
                >
                  {option}
                </span>
              </Label>
            );
          })}
        </RadioGroup>

        {submitted && (
          <div className="mt-6 p-5 bg-muted/50 rounded-xl border border-border relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Explanation
            </h4>
            <p className="text-sm text-foreground leading-relaxed">
              {explanation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
