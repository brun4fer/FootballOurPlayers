"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ImageUrlInputProps = {
  id: string;
  name: string;
  label: string;
  defaultImageUrl?: string | null;
  placeholder?: string;
};

export function ImageUrlInput({
  id,
  name,
  label,
  defaultImageUrl,
  placeholder = "https://exemplo.com/imagem.png",
}: ImageUrlInputProps) {
  const [imageUrl, setImageUrl] = useState(defaultImageUrl ?? "");
  const previewUrl = useMemo(() => imageUrl.trim(), [imageUrl]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type="text"
        inputMode="url"
        value={imageUrl}
        placeholder={placeholder}
        onChange={(event) => setImageUrl(event.target.value)}
      />
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={label}
          className="h-14 w-14 rounded-md border border-border/60 object-cover"
        />
      ) : (
        <p className="text-xs text-muted-foreground">Sem imagem</p>
      )}
    </div>
  );
}
