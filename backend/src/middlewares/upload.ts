import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import { isCloudinaryConfigured, uploadToCloudinary } from '../config/cloudinary.js';
import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const TEMP_DIR = path.resolve(process.cwd(), 'uploads', 'tmp');

// Ensure temp dir exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// When Cloudinary is configured, store to temp and upload. Otherwise local storage.
function createStorage(subfolder: string) {
  if (isCloudinaryConfigured) {
    return multer.diskStorage({
      destination: TEMP_DIR,
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${randomUUID()}${ext}`);
      },
    });
  }
  const dest = path.join(UPLOADS_DIR, subfolder);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  return multer.diskStorage({
    destination: dest,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${randomUUID()}${ext}`);
    },
  });
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

const imageFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato inválido. Use JPG, PNG, WebP ou SVG.'));
  }
};

export const uploadLogo = multer({
  storage: createStorage('logos'),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
});

export const uploadCover = multer({
  storage: createStorage('covers'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

export const uploadAvatar = multer({
  storage: createStorage('avatars'),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
});

/**
 * Middleware that uploads the file to Cloudinary after multer saves it to temp.
 * Adds `req.cloudinaryUrl` with the resulting URL.
 * If Cloudinary is not configured, sets the local URL instead.
 */
export function cloudinaryUpload(folder: string, localPrefix: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.file) return next();

    if (isCloudinaryConfigured) {
      try {
        const url = await uploadToCloudinary(req.file.path, folder);
        // Remove temp file
        fs.unlink(req.file.path, () => {});
        (req as any).cloudinaryUrl = url;
      } catch (err) {
        fs.unlink(req.file.path, () => {});
        return next(err);
      }
    } else {
      (req as any).cloudinaryUrl = `/uploads/${localPrefix}/${req.file.filename}`;
    }
    next();
  };
}
