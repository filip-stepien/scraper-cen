import { eq } from 'drizzle-orm';
import { productsTable } from '../db/schema';
import { Product, ProductChangeStatus } from '../types';
import { db } from '../db/client';
import { logger } from './logger';

export async function insertOrUpdateProduct(
    product: Product
): Promise<ProductChangeStatus> {
    const now = new Date();

    if (!product.ean) {
        logger.error(
            `Produkt ${
                product.name ? `"${product.name}"` : '<brak nazwy produktu>'
            } nie ma numeru EAN i nie może zostać zaktualizowany w bazie.`
        );

        return ProductChangeStatus.Error;
    }

    try {
        const existing = await db
            .select()
            .from(productsTable)
            .where(eq(productsTable.ean, product.ean))
            .limit(1);

        if (existing.length === 0) {
            const newProduct: typeof productsTable.$inferInsert = {
                ean: product.ean,
                name: product.name,
                category: product.category,
                price: product.price,
                previousPrice: null,
                change_date: now
            };

            await db.insert(productsTable).values(newProduct);
            logger.debug(`Dodano nowy produkt do bazy: "${product.name}".`);
            return ProductChangeStatus.Added;
        }

        const oldProduct = existing[0];
        const changed =
            oldProduct.price !== product.price ||
            oldProduct.name !== product.name ||
            oldProduct.category !== product.category;

        if (!changed) {
            logger.debug(`Produkt "${product.name}" nie wymaga aktualizacji.`);
            return ProductChangeStatus.Unchanged;
        }

        await db
            .update(productsTable)
            .set({
                price: product.price,
                previousPrice: oldProduct.price,
                name: product.name,
                category: product.category,
                change_date: now
            })
            .where(eq(productsTable.id, oldProduct.id));

        logger.debug(`Zaktualizowano produkt z bazy: "${product.name}".`);
        return ProductChangeStatus.Updated;
    } catch (error) {
        logger.error(
            `Błąd bazy danych przy operacji na produkcie "${product.name}". Błąd: ${error}`
        );

        return ProductChangeStatus.Error;
    }
}
