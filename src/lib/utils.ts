import path from 'path';

export function parseNumber(value: unknown, defaultValue: number): number {
    const parsed = Number(value);
    if (isNaN(parsed)) return defaultValue;
    return parsed;
}

export function getPublicPath() {
    return path.join(process.cwd(), 'public');
}
