import dayjs from 'dayjs';
import { eq, desc, asc, inArray } from 'drizzle-orm';
import { db } from '../db/client';
import { pricesTable } from '../db/schema';
import { PriceHistory } from '../types';
import { logger } from './logger';
import { getEnvNumber } from './utils';

export async function savePrice(ean: string | null, price: number | null) {
    if (!ean || !price) {
        return;
    }

    const maxPricesCount = getEnvNumber('DB_MAX_PRICES_COUNT');
    const lastPrice = await db
        .select()
        .from(pricesTable)
        .where(eq(pricesTable.productEan, ean))
        .orderBy(desc(pricesTable.changedAt))
        .limit(1)
        .get();

    if (lastPrice && lastPrice.price === price) {
        return;
    }

    const now = new Date();
    await db
        .insert(pricesTable)
        .values({
            productEan: ean,
            price,
            changedAt: now
        })
        .run();

    const prices = await db
        .select()
        .from(pricesTable)
        .where(eq(pricesTable.productEan, ean))
        .orderBy(asc(pricesTable.changedAt))
        .all();

    if (prices.length > maxPricesCount) {
        const idsToDelete = prices
            .slice(0, prices.length - maxPricesCount)
            .map(p => p.id);

        await db
            .delete(pricesTable)
            .where(inArray(pricesTable.id, idsToDelete))
            .run();

        logger.debug(
            `Liczba cen produktu przekracza dozwolony limit (${maxPricesCount}). Najstarsza cena została usunięta.`
        );
    }

    logger.debug(`Dodano nową cenę ${price} dla produktu (ean: ${ean}).`);
}

export async function findPricesByProductEan(
    ean: string
): Promise<PriceHistory[]> {
    const prices = await db
        .select()
        .from(pricesTable)
        .where(eq(pricesTable.productEan, ean))
        .orderBy(asc(pricesTable.changedAt))
        .all();

    return prices.map(p => ({
        price: p.price,
        changedAt: dayjs(p.changedAt).unix()
    }));
}
