import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types';

export function globalErrorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    const message =
        err instanceof Error ? err.message : 'Wystąpił nieznany błąd.';

    const error: ErrorResponse = {
        error: true,
        message
    };

    res.status(500).json(error);
}
