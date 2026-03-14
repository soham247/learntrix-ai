import HomeForm from "@/components/home/HomeForm";

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-8 mt-4 shadow-sm backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          AI-Powered Learning
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-foreground mb-6 tracking-tight">
          Master any subject <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/60">in minutes.</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Transform YouTube videos and PDF documents into interactive flashcards, responsive quizzes, and intelligent chat assistants.
        </p>
      </div>

      <HomeForm />
    </div>
  );
}
