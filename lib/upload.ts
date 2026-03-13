import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

function normalizeExtension(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  if (ALLOWED_EXTENSIONS.has(ext)) {
    return ext;
  }
  return ".png";
}

export async function saveImageUpload(
  value: FormDataEntryValue | null,
  folder: "players" | "teams",
) {
  if (!(value instanceof File) || value.size <= 0) {
    return null;
  }

  const extension = normalizeExtension(value.name);
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  const outputPath = path.join(uploadDir, fileName);

  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await value.arrayBuffer());
  await writeFile(outputPath, buffer);

  return `/uploads/${folder}/${fileName}`;
}
