import { eq, sql } from 'drizzle-orm';
import { productsTable } from '../db/schema';
import { db } from '../db';
import {
    HttpStatus,
    PagedProductsResponse,
    Product,
    ProductWithPrices,
    ProductStatus
} from '../types';
import { findCompanyByName } from './companies';
import { findPricesByProductEan } from './prices';
import { logger } from './logger';
import { ApiError } from '../errors/ApiError';

export async function saveProduct(product: Product): Promise<ProductStatus> {
    const { ean, name, category, imageUrl, companyId, url } = product;

    if (!ean) {
        throw new Error(
            `Produkt ${
                name ? `"${name}"` : '<nie odczytano prawidłowej nazwy>'
            } nie ma numeru EAN i nie może zostać zaktualizowany w bazie.`
        );
    }

    const existing = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.ean, ean))
        .limit(1)
        .get();

    if (!existing) {
        await db
            .insert(productsTable)
            .values({
                ean,
                category,
                imageUrl,
                url,
                name,
                companyId
            })
            .run();

        logger.debug(`Dodano "${name}" do bazy danych (ean: "${ean}").`);
        return ProductStatus.CREATED;
    }

    const changed =
        existing.category !== category ||
        existing.name !== name ||
        existing.imageUrl !== imageUrl ||
        existing.url !== url;

    if (!changed) {
        return ProductStatus.UNCHANGED;
    }

    await db
        .update(productsTable)
        .set({
            name,
            category,
            imageUrl,
            url
        })
        .where(eq(productsTable.ean, ean))
        .run();

    logger.debug(`Zaktualizowano produkt "${name}" (ean: ${ean}).`);
    return ProductStatus.UPDATED;
}

export async function countProductsByCompany(
    companyName: string
): Promise<number> {
    const company = await findCompanyByName(companyName);
    if (!company) {
        throw new Error(
            `Błąd podczas pobierania ilości produktów firmy "${companyName}": firma nie istnieje w bazie danych.`
        );
    }

    const result = await db
        .select({ count: sql`count(*)` })
        .from(productsTable)
        .where(eq(productsTable.companyId, company.id))
        .get();

    return Number(result?.count ?? 0);
}

export async function findProductsByCompany(
    companyName: string,
    pageSize: number,
    pageNumber: number
): Promise<PagedProductsResponse> {
    const company = await findCompanyByName(companyName);
    if (!company) {
        throw new ApiError(
            `Podana firma nie istnieje w bazie danych.`,
            HttpStatus.BAD_REQUEST
        );
    }

    if (pageSize < 1 || pageNumber < 1) {
        throw new ApiError(
            `Parametry stronnicowania są nieprawidłowe.`,
            HttpStatus.BAD_REQUEST
        );
    }

    const offset = (pageNumber - 1) * pageSize;
    const totalCount = await countProductsByCompany(companyName);
    const products = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.companyId, company.id))
        .limit(pageSize)
        .offset(offset)
        .all();

    const productsWithPrices: ProductWithPrices[] = await Promise.all(
        products.map(async product => {
            const prices = await findPricesByProductEan(product.ean);
            return { ...product, prices };
        })
    );

    const hasNextPage = pageNumber * pageSize < totalCount;

    return {
        products: productsWithPrices,
        pageSize,
        pageNumber,
        totalCount,
        hasNextPage
    };
}
