import { Request, Response } from 'express';
import { getPublicPath } from '../lib/utils';
import path from 'path';

export function showDashboard(_req: Request, res: Response) {
    res.sendFile(path.join(getPublicPath(), 'index.html'));
}
