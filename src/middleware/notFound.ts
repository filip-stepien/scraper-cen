import { Request, Response } from 'express';
import { ErrorResponse } from '../types';

export async function notFound(_req: Request, res: Response) {
    const error: ErrorResponse = {
        error: true,
        message: 'Nie znaleziono zasobu'
    };

    res.status(404).json(error);
}
