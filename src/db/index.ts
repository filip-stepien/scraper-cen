import { drizzle } from 'drizzle-orm/libsql';
import { getConfig } from '../lib/config';

const dbFileName = 'file:' + getConfig().db.fileName;

export const db = drizzle(dbFileName);
