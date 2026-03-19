import { Response } from 'express';

export function sendSuccess(res: Response, data: unknown, statusCode = 200, meta?: unknown) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function sendError(res: Response, message: string, statusCode = 400, code = 'BAD_REQUEST') {
  return res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}
