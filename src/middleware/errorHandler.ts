import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/errors.js';
import { ZodError } from 'zod';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Bad Request', issues: err.issues });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal Server Error' });
}
