export function getEnv(env: string): string {
    const value = process.env[env];

    if (!value) {
        throw new Error(`Missing required environment variable: ${env}`);
    }

    return value;
}
