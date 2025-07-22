import { defineConfig } from 'drizzle-kit';
import { getConfig } from './src/lib/config';

export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema.ts',
    dialect: 'sqlite',
    dbCredentials: {
        url: 'file:' + getConfig().db.fileName
    }
});
