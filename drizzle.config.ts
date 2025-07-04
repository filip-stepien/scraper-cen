import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { getEnvString } from './src/lib/utils';

export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema.ts',
    dialect: 'sqlite',
    dbCredentials: {
        url: getEnvString('DB_FILE_NAME')
    }
});
