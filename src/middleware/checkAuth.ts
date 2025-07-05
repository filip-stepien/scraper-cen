import { Request, Response, NextFunction } from 'express';
import { getConfig } from '../lib/config';
import { HttpStatus } from '../types';
import { ApiError } from '../errors/ApiError';
import jwt from 'jsonwebtoken';

export function checkAuth(req: Request, _res: Response, next: NextFunction) {
    const config = getConfig();
    if (!config.website.authorization.enabled) {
        return next();
    }

    const { cookieName, secret } = config.website.session;
    const token = req.cookies[cookieName];

    try {
        jwt.verify(token, secret);
        next();
    } catch (err) {
        throw new ApiError(
            'Sesja wygasła lub jest nieprawidłowa.',
            HttpStatus.UNAUTHORIZED
        );
    }
}
