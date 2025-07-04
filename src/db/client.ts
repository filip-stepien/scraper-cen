import { drizzle } from 'drizzle-orm/libsql';
import { getEnvString } from '../lib/utils';

export const db = drizzle(getEnvString('DB_FILE_NAME'));
