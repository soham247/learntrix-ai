"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { useAuth } from "@/components/providers/auth-provider";
import { Brain, Home, Layers, FileQuestion, MessageSquare, LogOut, LogIn, Loader2 } from "lucide-react";
import { useState } from "react";

const Icons = {
  Brain: () => <Brain className="w-5 h-5" />,
  Home: () => <Home className="w-4 h-4" />,
  Flashcards: () => <Layers className="w-4 h-4" />,
  Quiz: () => <FileQuestion className="w-4 h-4" />,
  Chat: () => <MessageSquare className="w-4 h-4" />,
};

export default function Navbar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const { user, loading, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

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

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    router.push("/auth");
    router.refresh();
    setSigningOut(false);
  };

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

          {/* Auth area */}
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-2 ml-1">
                  <span className="hidden sm:block text-xs text-muted-foreground max-w-[120px] truncate">
                    {user.user_metadata?.display_name || user.user_metadata?.full_name || user.email}
                  </span>
                  <Button
                    id="signout-btn"
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    title="Sign out"
                  >
                    {signingOut ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  id="signin-nav-btn"
                  variant="ghost"
                  className="rounded-full px-4 text-muted-foreground hover:text-foreground hover:bg-muted"
                  asChild
                >
                  <Link href="/auth" className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:block">Sign In</span>
                  </Link>
                </Button>
              )}
            </>
          )}

          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
