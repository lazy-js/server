import { Request, Response, NextFunction } from 'express';
import {
  handeleZodError,
  errorResponse,
  AppError,
  generalErrors,
} from '@lazy-js/utils';
export function globalErrorHandler(
  err: any,
  _: Request,
  res: Response,
  __: NextFunction,
) {
  if (Array.isArray(err.errors)) {
    const zodError = handeleZodError(err);
    return res.status(zodError.statusCode || 500).json(errorResponse(zodError));
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode || 500).json(errorResponse(err));
  } else {
    return res
      .status(500)
      .json(errorResponse(new AppError(generalErrors.INTERNAL_SERVER_ERROR)));
  }
}
