"use client";

import { useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file && file.type === "application/pdf") {
        setFileName(file.name);
        onFileSelect(file);
      }
    },
    [onFileSelect, disabled]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const file = e.target.files?.[0];
      if (file) {
        setFileName(file.name);
        onFileSelect(file);
      }
    },
    [onFileSelect, disabled]
  );

  return (
    <Card
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed bg-card/50 transition-all ${dragActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-accent/50"
        } ${disabled ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
    >
      <input
        type="file"
        accept=".pdf"
        onChange={handleChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <CardContent className="flex flex-col items-center justify-center p-8 gap-4">
        <div
          className={`p-4 rounded-full transition-colors ${dragActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            }`}
        >
          <UploadCloud className="w-8 h-8" />
        </div>
        <div className="text-center">
          {fileName ? (
            <p className="text-sm font-medium text-foreground">
              {fileName}
            </p>
          ) : (
            <>
              <p className="text-sm font-medium text-foreground mb-1">
                Drop your PDF here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">Up to 50MB</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
