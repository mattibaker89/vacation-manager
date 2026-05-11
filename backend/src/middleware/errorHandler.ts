import { Request, Response, NextFunction } from 'express';

// Express identifies error-handling middleware by its 4-argument signature.
// _req and _next are unused but required for Express to recognise this as an error handler.
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
}
