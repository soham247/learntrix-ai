"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/layout/mode-toggle";

const Icons = {
  Brain: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" /><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" /><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" /><path d="M17.599 6.5a3 3 0 0 0 .399-1.375" /></svg>,
  Home: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  Flashcards: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" x2="21" y1="9" y2="9" /><line x1="9" x2="9" y1="21" y2="9" /></svg>,
  Quiz: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
  Chat: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
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
