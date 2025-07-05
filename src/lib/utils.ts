export function parseNumber(value: unknown, defaultValue: number): number {
    const parsed = Number(value);
    if (isNaN(parsed)) return defaultValue;
    return parsed;
}
