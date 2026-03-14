"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/home/FileUpload";
import { processVideo, processPdf } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, FileText, AlertCircle, Loader2, ArrowRight } from "lucide-react";

export default function HomeForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"youtube" | "pdf">("youtube");

  const handleProcess = async () => {
    setError(null);
    setLoading(true);

    try {
      let result;
      if (activeTab === "youtube") {
        if (!url.trim()) {
          setError("Please enter a YouTube URL.");
          setLoading(false);
          return;
        }
        result = await processVideo(url);
      } else {
        if (!pdfFile) {
          setError("Please select a PDF file.");
          setLoading(false);
          return;
        }
        result = await processPdf(pdfFile);
      }

      router.push(`/flashcards?session_id=${result.session_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-3xl p-2 sm:p-4 mb-20 relative shadow-sm border border-border bg-card/50">
      <div className="relative bg-card/90 backdrop-blur-xl rounded-2xl border border-border overflow-hidden p-4 sm:p-8">
        {/* Tab Selector */}
        <div className="flex p-1 bg-muted rounded-xl mb-8 border border-border">
          <button
            onClick={() => setActiveTab("youtube")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "youtube"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Link className="w-4 h-4" /> YouTube Video
          </button>
          <button
            onClick={() => setActiveTab("pdf")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "pdf"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4" /> PDF Document
          </button>
        </div>

        {/* YouTube Input */}
        {activeTab === "youtube" && (
          <div className="mb-8">
            <label className="block text-sm font-medium text-foreground mb-3">
              Paste Video Link
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
                <Link className="w-4 h-4" />
              </div>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                disabled={loading}
                className="pl-11 py-6 rounded-xl border-border bg-background focus-visible:ring-primary shadow-sm"
              />
            </div>
          </div>
        )}

        {/* PDF Upload */}
        {activeTab === "pdf" && (
          <div className="mb-8">
            <label className="block text-sm font-medium text-foreground mb-3">
              Upload Document
            </label>
            <FileUpload onFileSelect={setPdfFile} disabled={loading} />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive font-medium leading-relaxed">
              {error}
            </p>
          </div>
        )}

        {/* Process Button */}
        <Button
          onClick={handleProcess}
          disabled={loading}
          size="lg"
          className="w-full py-6 rounded-xl text-md font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing contents...
            </>
          ) : (
            <>
              Generate Learning Material
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
