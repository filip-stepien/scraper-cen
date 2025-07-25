import bcrypt from 'bcrypt';
import { getConfig, saveConfig } from './config';
import { logger } from './logger';
import { ApiError } from '../errors/ApiError';
import { Cookie, HttpStatus } from '../types';
import jwt from 'jsonwebtoken';

export function credentialsValid(password?: string) {
    if (!password) {
        return false;
    }

    const config = getConfig().website.authorization;
    return bcrypt.compareSync(password, config.passwordHash);
}

export function changeUsername(newUsername: string) {
    let config = getConfig();
    config.website.authorization.username = newUsername;
    saveConfig(config);
    logger.info('Zmieniono nazwę użytkownika.');
}

export function changePassword(newPassword: string) {
    const hashRounds = 10;
    let config = getConfig();

    config.website.authorization.passwordHash = bcrypt.hashSync(
        newPassword,
        hashRounds
    );
    saveConfig(config);
    logger.info('Zmieniono hasło.');
}

export function createAuthCookie(password: string): Cookie {
    if (!credentialsValid(password)) {
        throw new ApiError(
            'Nieprawidłowe dane autoryzacji.',
            HttpStatus.UNAUTHORIZED
        );
    }

    const { cookieName, durationSeconds, secret } = getConfig().website.session;
    const cookieAgeMs = durationSeconds * 1000;

    const token = jwt.sign({}, secret, {
        expiresIn: durationSeconds
    });

    return {
        name: cookieName,
        value: token,
        options: {
            httpOnly: true,
            maxAge: cookieAgeMs,
            sameSite: 'strict'
        }
    };
}

export function clearAuthCookie(): Cookie {
    const { cookieName } = getConfig().website.session;

    return {
        name: cookieName,
        value: '',
        options: {
            httpOnly: true,
            sameSite: 'strict',
            expires: new Date(0)
        }
    };
}
