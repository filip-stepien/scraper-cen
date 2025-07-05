import { Request, Response } from 'express';
import { HttpStatus } from '../types';
import { clearAuthCookie, createAuthCookie } from '../lib/auth';

export function signIn(req: Request, res: Response) {
    const username = req.body?.username;
    const password = req.body?.password;
    const { name, value, options } = createAuthCookie(username, password);
    res.status(HttpStatus.OK).cookie(name, value, options).end();
}

export function signOut(_req: Request, res: Response) {
    const { name, value, options } = clearAuthCookie();
    res.status(HttpStatus.OK).cookie(name, value, options).end();
}
