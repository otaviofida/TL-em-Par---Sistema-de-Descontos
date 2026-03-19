import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

const logoStorage = multer.diskStorage({
  destination: path.join(UPLOADS_DIR, 'logos'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const coverStorage = multer.diskStorage({
  destination: path.join(UPLOADS_DIR, 'covers'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const avatarStorage = multer.diskStorage({
  destination: path.join(UPLOADS_DIR, 'avatars'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

const imageFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato inválido. Use JPG, PNG, WebP ou SVG.'));
  }
};

export const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
});

export const uploadCover = multer({
  storage: coverStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
});
