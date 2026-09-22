import { supabase } from "@/integrations/supabase/client";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export type StoredFile = { path: string; url: string; name: string };

export function validateFile(file: File, opts?: { imagesOnly?: boolean; maxSize?: number }) {
  const maxSize = opts?.maxSize ?? MAX_FILE_SIZE;
  if (file.size > maxSize) {
    return `"${file.name}" is larger than ${Math.round(maxSize / 1024 / 1024)}MB.`;
  }
  if (opts?.imagesOnly && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `"${file.name}" must be a JPG, PNG or WEBP image.`;
  }
  return null;
}

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
}

export async function uploadFile(file: File, folder: string): Promise<StoredFile> {
  const path = `${folder}/${crypto.randomUUID()}-${safeName(file.name)}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;

  const { data, error: signError } = await supabase.storage
    .from("media")
    .createSignedUrl(path, TEN_YEARS);
  if (signError || !data) throw signError ?? new Error("Could not create file URL");

  return { path, url: data.signedUrl, name: file.name };
}

export async function deleteFile(path: string) {
  const { error } = await supabase.storage.from("media").remove([path]);
  if (error) throw error;
}

export function pathFromUrl(url: string) {
  const match = url.match(/\/media\/(.+?)(\?|$)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}
