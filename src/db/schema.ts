import { relations } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const productsTable = sqliteTable('products', {
    ean: text('ean').primaryKey(),
    companyId: integer('company_id').notNull(),
    name: text('name'),
    category: text('category'),
    imageUrl: text('imageUrl'),
    url: text('url')
});

export const pricesTable = sqliteTable('prices', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    productEan: text('product_ean').notNull(),
    price: real('price').notNull(),
    changedAt: integer('changed_at', { mode: 'timestamp' }).notNull()
});

export const companiesTable = sqliteTable('companies', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull().unique()
});

export const productsRelations = relations(productsTable, ({ many, one }) => ({
    prices: many(pricesTable),
    company: one(companiesTable, {
        fields: [productsTable.companyId],
        references: [companiesTable.id]
    })
}));

export const pricesRelations = relations(pricesTable, ({ one }) => ({
    product: one(productsTable, {
        fields: [pricesTable.productEan],
        references: [productsTable.ean]
    })
}));

export const companiesRelations = relations(companiesTable, ({ many }) => ({
    products: many(productsTable)
}));
