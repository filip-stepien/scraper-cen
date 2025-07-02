import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { getEnv } from './src/lib/utils';

export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema.ts',
    dialect: 'sqlite',
    dbCredentials: {
        url: getEnv('DB_FILE_NAME')
    }
});
