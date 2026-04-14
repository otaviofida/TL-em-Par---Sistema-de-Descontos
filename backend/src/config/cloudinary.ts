import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

if (env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

export const isCloudinaryConfigured = !!env.CLOUDINARY_CLOUD_NAME;

export async function uploadToCloudinary(
  filePath: string,
  folder: string,
): Promise<string> {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: `tlempar/${folder}`,
    transformation: [
      { width: 800, height: 800, crop: 'limit', quality: 'auto', format: 'webp' },
    ],
  });
  return result.secure_url;
}

export async function deleteFromCloudinary(publicUrl: string): Promise<void> {
  try {
    // Extract public ID from URL
    const parts = publicUrl.split('/');
    const uploadIdx = parts.indexOf('upload');
    if (uploadIdx === -1) return;
    const publicId = parts.slice(uploadIdx + 2).join('/').replace(/\.[^.]+$/, '');
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Silently fail — image may already be deleted
  }
}
