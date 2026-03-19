"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/layout/mode-toggle";

import { Brain, Home, Layers, FileQuestion, MessageSquare } from "lucide-react";

const Icons = {
  Brain: () => <Brain className="w-5 h-5" />,
  Home: () => <Home className="w-4 h-4" />,
  Flashcards: () => <Layers className="w-4 h-4" />,
  Quiz: () => <FileQuestion className="w-4 h-4" />,
  Chat: () => <MessageSquare className="w-4 h-4" />,
};

export default function Navbar() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const navLinks = [
    { href: "/", label: "Home", icon: <Icons.Home /> },
    ...(sessionId
      ? [
        {
          href: `/flashcards?session_id=${sessionId}`,
          label: "Flashcards",
          icon: <Icons.Flashcards />,
        },
        {
          href: `/quiz?session_id=${sessionId}`,
          label: "Quiz",
          icon: <Icons.Quiz />,
        },
        {
          href: `/chat?session_id=${sessionId}`,
          label: "Chat",
          icon: <Icons.Chat />,
        },
      ]
      : []),
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4 backdrop-blur-md">
      <div className="glass rounded-full px-4 py-3 flex items-center justify-between border border-border shadow-sm">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:scale-105 transition-transform">
            <Icons.Brain />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground hidden sm:block">
            Learntrix
          </span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              className="rounded-full px-4 text-muted-foreground hover:text-foreground hover:bg-muted"
              asChild
            >
              <Link href={link.href} className="flex items-center gap-2">
                {link.icon}
                <span className="hidden sm:block">{link.label}</span>
              </Link>
            </Button>
          ))}
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
