"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import { generateQuiz } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Question {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface QuizContentProps {
  sessionId: string;
  loadingChildren: React.ReactNode;
}

export default function QuizContent({ sessionId, loadingChildren }: QuizContentProps) {
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const { data: questions = [], isLoading: loading, error } = useQuery<Question[]>({
    queryKey: ['quiz', sessionId],
    queryFn: async () => {
      const data = await generateQuiz(sessionId);
      return data.questions;
    },
    enabled: !!sessionId,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  // Initialize answers array when questions load
  useEffect(() => {
    if (questions.length > 0 && answers.length === 0) {
      setAnswers(new Array(questions.length).fill(null));
    }
  }, [questions, answers.length]);

  const handleSelect = (qIndex: number, answer: number) => {
    // Prevent changing answer if already answered
    if (answers[qIndex] !== null) return;

    const newAnswers = [...answers];
    newAnswers[qIndex] = answer;
    setAnswers(newAnswers);
  };


  const score = submitted
    ? answers.reduce<number>(
      (acc, answer, idx) =>
        answer === questions[idx].correct_answer ? acc + 1 : acc,
      0
    )
    : 0;

  if (loading) {
    return <>{loadingChildren}</>;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <p className="text-sm font-medium text-destructive">{error instanceof Error ? error.message : "Failed to load quiz"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
          Quiz
        </h1>
        <p className="text-muted-foreground font-medium">
          {submitted
            ? "Quiz Complete — Review your answers"
            : `Question ${currentQuestionIndex + 1} of ${questions.length}`}
        </p>
      </div>

      {/* Score Banner */}
      {submitted && (
        <div className="mb-10 p-8 glass bg-card/90 rounded-3xl border border-border text-center shadow-sm">
          <p className="text-5xl font-extrabold tracking-tight text-foreground mb-2">
            {score} <span className="text-2xl text-muted-foreground">/ {questions.length}</span>
          </p>
          <p className="text-sm font-medium text-muted-foreground">
            {score === questions.length
              ? "Perfect score! Outstanding."
              : score >= questions.length * 0.7
                ? "Great job! Almost there."
                : "Keep studying! Review the flashcards."}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {submitted ? (
          questions.map((q, idx) => (
            <QuizQuestion
              key={idx}
              question={q.question}
              options={q.options}
              correctAnswer={q.correct_answer}
              explanation={q.explanation}
              index={idx}
              selectedAnswer={answers[idx]}
              submitted={true}
              onSelect={handleSelect}
            />
          ))
        ) : (
          questions.length > 0 && (
            <QuizQuestion
              key={currentQuestionIndex}
              question={questions[currentQuestionIndex].question}
              options={questions[currentQuestionIndex].options}
              correctAnswer={questions[currentQuestionIndex].correct_answer}
              explanation={questions[currentQuestionIndex].explanation}
              index={currentQuestionIndex}
              selectedAnswer={answers[currentQuestionIndex]}
              submitted={answers[currentQuestionIndex] !== null}
              onSelect={handleSelect}
            />
          )
        )}
      </div>

      {!submitted && answers[currentQuestionIndex] !== null && (
        <Button
          onClick={() => {
            if (currentQuestionIndex === questions.length - 1) {
              setSubmitted(true);
            } else {
              setCurrentQuestionIndex((curr) => curr + 1);
            }
          }}
          size="lg"
          className="mt-10 w-full py-6 text-md rounded-2xl font-medium"
        >
          {currentQuestionIndex === questions.length - 1 ? "View Results" : "Next Question"}
        </Button>
      )}

      <div className="flex justify-center gap-6 mt-16 pt-8 border-t border-border">
        <Link
          href={`/flashcards?session_id=${sessionId}`}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Review Flashcards
        </Link>
        <div className="w-px h-4 bg-border my-auto" />
        <Link
          href={`/chat?session_id=${sessionId}`}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 group"
        >
          Chat with Content
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
