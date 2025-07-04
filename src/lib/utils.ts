import { logger } from './logger';

export function getEnvString(env: string): string {
    const value = process.env[env];

    if (!value) {
        logger.fatal(
            `Brak wymaganej zmiennej środowiskowej ${env}. `,
            `Upewnij się, że zmienna ${env} jest zdefiniowana w pliku ".env".`
        );
        process.exit(1);
    }

    return value;
}

export function getEnvNumber(env: string): number {
    const valueStr = getEnvString(env);
    const valueNum = Number(valueStr);

    if (isNaN(valueNum)) {
        logger.fatal(
            `Zmienna środowiskowa ${env} ma nieprawidłową wartość (oczekiwano liczby): "${valueStr}"`
        );
        process.exit(1);
    }

    return valueNum;
}

export function parseNumber(value: unknown, defaultValue: number): number {
    const parsed = Number(value);
    if (isNaN(parsed)) return defaultValue;
    return parsed;
}
