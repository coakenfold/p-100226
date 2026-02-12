import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@project/shared/constants';
import type { ApiErrorResponse } from '@project/shared/types';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  const isApiRequest = _req.path.startsWith('/api/');

  if (isApiRequest) {
    const body: ApiErrorResponse = {
      error: 'Not Found',
      message: `Route ${_req.method} ${_req.path} not found`,
      statusCode: HTTP_STATUS.NOT_FOUND,
    };
    res.status(HTTP_STATUS.NOT_FOUND).json(body);
    return;
  }

  res.status(HTTP_STATUS.NOT_FOUND).render('pages/404.njk', {
    title: 'Page Not Found',
  });
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode =
    err instanceof AppError
      ? err.statusCode
      : HTTP_STATUS.INTERNAL_SERVER_ERROR;

  const message =
    err instanceof AppError ? err.message : 'Internal Server Error';

  console.error(`[Error] ${statusCode} - ${err.message}`, {
    stack: err.stack,
    path: _req.path,
    method: _req.method,
  });

  const isApiRequest = _req.path.startsWith('/api/');

  if (isApiRequest) {
    const body: ApiErrorResponse = {
      error: statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR
        ? 'Internal Server Error'
        : err.name,
      message,
      statusCode,
    };
    res.status(statusCode).json(body);
    return;
  }

  res.status(statusCode).render('pages/error.njk', {
    title: 'Error',
    statusCode,
    message,
  });
}
