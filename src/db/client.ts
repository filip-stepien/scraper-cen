import { drizzle } from 'drizzle-orm/libsql';
import { getEnv } from '../lib/utils';

export const db = drizzle(getEnv('DB_FILE_NAME'));
