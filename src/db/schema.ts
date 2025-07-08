import { relations } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const productsTableFields = {
    ean: text('ean').primaryKey(),
    companyId: integer('company_id').notNull(),
    name: text('name'),
    category: text('category'),
    imageUrl: text('imageUrl'),
    url: text('url')
};

export const pricesTableFields = {
    id: integer('id').primaryKey({ autoIncrement: true }),
    productEan: text('product_ean').notNull(),
    price: real('price').notNull(),
    changedAt: integer('changed_at', { mode: 'timestamp' }).notNull()
};

export const companiesTableFields = {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull().unique()
};

export const productsTable = sqliteTable('products', productsTableFields);

export const pricesTable = sqliteTable('prices', pricesTableFields);

export const companiesTable = sqliteTable('companies', companiesTableFields);

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
