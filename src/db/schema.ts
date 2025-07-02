import { int, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const productsTable = sqliteTable('products', {
    id: int().primaryKey({ autoIncrement: true }),
    ean: text('ean'),
    name: text('name'),
    category: text('category'),
    price: real('price'),
    previousPrice: real('previous_price'),
    change_date: integer('change_date', { mode: 'timestamp' })
});
