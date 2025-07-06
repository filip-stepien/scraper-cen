import { Request, Response } from 'express';
import { HttpStatus } from '../types';

export function ping(_req: Request, res: Response) {
    res.status(HttpStatus.OK).end();
}
