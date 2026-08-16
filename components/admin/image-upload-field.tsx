"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, X } from "lucide-react";
import { FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function ImageUploadField({
  label,
  defaultUrl,
  onFileChange,
  aspect = "aspect-square",
}: {
  label: string;
  defaultUrl?: string | null;
  onFileChange: (file: File | null) => void;
  aspect?: string;
}) {
  const [preview, setPreview] = useState<string | null>(defaultUrl ?? null);
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onFileChange(file);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    if (file) {
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setPreview(url);
    } else {
      objectUrlRef.current = null;
      setPreview(defaultUrl ?? null);
    }
  };

  const handleClear = () => {
    onFileChange(null);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-3">
        <div
          className={`flex ${aspect} w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted`}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary local preview/served path, not an optimizable static import
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            onChange={handleChange}
            className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted/70"
          />
          {preview ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-fit text-muted-foreground"
              onClick={handleClear}
            >
              <X className="size-3.5" />
              Remove
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
