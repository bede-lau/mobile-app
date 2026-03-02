import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';

const AVATARS_BUCKET = 'avatars';
const BODY_SCANS_BUCKET = 'body-scans';

export async function uploadBodyScanImages(
  userId: string,
  scanId: string,
  images: string[] // base64 encoded
): Promise<string[]> {
  const urls: string[] = [];

  for (let i = 0; i < images.length; i++) {
    const filePath = `${userId}/${scanId}/frame_${i}.jpg`;
    const { error } = await supabase.storage
      .from(BODY_SCANS_BUCKET)
      .upload(filePath, decode(images[i]), {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;
    urls.push(filePath);
  }

  return urls;
}

export async function uploadAvatar(
  userId: string,
  base64Image: string
): Promise<string> {
  const filePath = `${userId}/avatar.jpg`;
  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(filePath, decode(base64Image), {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
