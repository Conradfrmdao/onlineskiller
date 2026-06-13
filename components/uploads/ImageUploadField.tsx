"use client";

import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, UploadCloud, X } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function ImageUploadField({
  name,
  label,
  value,
  onChange,
  purpose,
  help,
  compact = false,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  purpose: "logo" | "cover";
  help?: string;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function upload(file: File) {
    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("purpose", purpose);
      const response = await fetch("/api/uploads/image", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { url?: string; message?: string };

      if (!response.ok || !result.url) {
        throw new Error(result.message || "Image upload failed.");
      }

      onChange(result.url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div
        className={cn(
          "grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3",
          compact ? "sm:grid-cols-[5.5rem_1fr]" : "sm:grid-cols-[8rem_1fr]",
        )}
      >
        <div
          className={cn(
            "relative grid overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white",
            compact ? "aspect-square" : "aspect-[4/3]",
          )}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus className="m-auto size-7 text-slate-300" />
          )}
        </div>
        <div className="min-w-0">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? <LoaderCircle className="animate-spin" /> : <UploadCloud />}
              {uploading ? "Uploading..." : "Choose image"}
            </Button>
            {value ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
                <X /> Remove
              </Button>
            ) : null}
          </div>
          <Input
            id={name}
            name={name}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Or paste an image URL"
            className="mt-3 bg-white"
          />
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {help || "JPG, PNG, WebP, or AVIF. Maximum 4 MB."}
          </p>
        </div>
      </div>
      {message ? <Alert variant="destructive">{message}</Alert> : null}
    </div>
  );
}
