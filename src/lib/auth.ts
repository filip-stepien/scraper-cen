import bcrypt from 'bcrypt';
import { getConfig, saveConfig } from './config';
import { logger } from './logger';
import { ApiError } from '../errors/ApiError';
import { Cookie, HttpStatus } from '../types';
import jwt from 'jsonwebtoken';

export function credentialsValid(username?: string, password?: string) {
    if (!username || !password) {
        return false;
    }

    const config = getConfig().website.authorization;
    const usernameValid = username === config.username;
    const passwordValid = bcrypt.compareSync(password, config.passwordHash);
    return usernameValid && passwordValid;
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

export function createAuthCookie(username: string, password: string): Cookie {
    if (!credentialsValid(username, password)) {
        throw new ApiError(
            'Nieprawidłowe dane autoryzacji.',
            HttpStatus.UNAUTHORIZED
        );
    }

    const { cookieName, durationSeconds, secret } = getConfig().website.session;
    const cookieAgeMs = durationSeconds * 1000;

    const token = jwt.sign({ username }, secret, {
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
