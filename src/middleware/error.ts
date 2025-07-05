import { NextFunction, Request, Response } from 'express';
import { logger } from '../lib/logger';
import { ErrorResponse, HttpStatus } from '../types';
import { ApiError } from '../errors/ApiError';

export function globalErrorHandler(
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Wystąpił nieznany błąd.';

    if (error instanceof ApiError) {
        statusCode = error.status;
        message = error.message;
    } else if (error instanceof Error) {
        logger.error(`Wystąpił nieoczekiwany błąd: ${error}`);
    }

    const errorResponse: ErrorResponse = {
        error: true,
        message
    };

    res.status(statusCode).json(errorResponse);
}
