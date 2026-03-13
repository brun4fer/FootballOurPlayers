"use client";

import { useMemo, useState } from "react";

import { Label } from "@/components/ui/label";

type ImageUploadPreviewProps = {
  id: string;
  name: string;
  label: string;
  defaultImageUrl?: string | null;
  required?: boolean;
};

export function ImageUploadPreview({
  id,
  name,
  label,
  defaultImageUrl,
  required = false,
}: ImageUploadPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImageUrl ?? null);

  const fallbackText = useMemo(
    () => (defaultImageUrl ? "Imagem atual" : "Sem imagem"),
    [defaultImageUrl],
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        name={name}
        type="file"
        accept="image/*"
        required={required}
        className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-border file:bg-card file:px-3 file:py-1.5 file:text-foreground"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) {
            setPreviewUrl(defaultImageUrl ?? null);
            return;
          }
          setPreviewUrl(URL.createObjectURL(file));
        }}
      />
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={label}
          className="h-14 w-14 rounded-md border border-border/60 object-cover"
        />
      ) : (
        <p className="text-xs text-muted-foreground">{fallbackText}</p>
      )}
    </div>
  );
}
