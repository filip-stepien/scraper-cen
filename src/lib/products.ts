import { eq, and, sql, asc, AnyColumn, desc, SQL, like } from 'drizzle-orm';
import { pricesTable, productsTable } from '../db/schema';
import { db } from '../db';
import { findCompanyByName } from './companies';
import { findPricesByProductEan } from './prices';
import { logger } from './logger';
import { ApiError } from '../errors/ApiError';
import {
    HttpStatus,
    PagedProductsResponse,
    Product,
    ProductWithPrices,
    ProductStatus,
    RequestParamEntry
} from '../types';
import dayjs from 'dayjs';

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
    companyName: string,
    filteringWhereExpressions?: SQL[]
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
        .where(
            and(
                eq(productsTable.companyId, company.id),
                ...(filteringWhereExpressions ?? [])
            )
        )
        .get();

    return Number(result?.count ?? 0);
}

export function getValidSortingFields() {
    return ['name', 'ean', 'category', 'changedAt', 'price'];
}

export function getValidFilteringFields() {
    return ['name', 'ean', 'category', 'changedAt', 'price'];
}

function parseProductParam(
    paramStr?: string,
    shouldParse?: (key: string) => boolean,
    valueTransform?: (value: string) => string
): RequestParamEntry[] | null {
    if (!paramStr) {
        return null;
    }

    const sortingOptions: RequestParamEntry[] = paramStr
        .split(',')
        .map(part => {
            const rawKeyValues = part.split(':');
            const keyRaw = rawKeyValues.at(0);
            const valueRaw = rawKeyValues.at(1);

            if (!keyRaw || !valueRaw) {
                return null;
            }

            const keyParsed = shouldParse?.(keyRaw);

            if (!keyParsed) {
                return null;
            }

            const valueParsed = valueTransform
                ? valueTransform(valueRaw)
                : valueRaw;

            return { key: keyRaw, value: valueParsed };
        })
        .filter((sort): sort is RequestParamEntry => Boolean(sort));

    return sortingOptions.length >= 1 ? sortingOptions : null;
}

export async function findProductsByCompany(
    companyName: string,
    pageSize: number,
    pageNumber: number,
    sortByParam?: string,
    filterByParam?: string
): Promise<PagedProductsResponse> {
    const company = await findCompanyByName(companyName);
    if (!company) {
        throw new ApiError(
            `Podana firma nie istnieje w bazie danych.`,
            HttpStatus.NOT_FOUND
        );
    }

    if (pageSize < 1 || pageNumber < 1) {
        throw new ApiError(
            `Parametry stronnicowania są nieprawidłowe.`,
            HttpStatus.BAD_REQUEST
        );
    }

    const sorting = parseProductParam(
        sortByParam,
        key => getValidSortingFields().includes(key),
        value => (value.trim().toLowerCase() === 'desc' ? 'desc' : 'asc')
    );

    if (sortByParam && !sorting) {
        throw new ApiError(
            'Parametry sortowania są nieprawidłowe.',
            HttpStatus.BAD_REQUEST
        );
    }

    const filtering = parseProductParam(
        filterByParam,
        key => getValidFilteringFields().includes(key),
        value => value.trim()
    );

    if (filterByParam && !filtering) {
        throw new ApiError(
            'Parametr filtrowania jest nieprawidłowy.',
            HttpStatus.BAD_REQUEST
        );
    }

    const offset = (pageNumber - 1) * pageSize;

    const latestChangedDates = db
        .select({
            productEan: pricesTable.productEan,
            changedAt: sql<Date>`MAX(${pricesTable.changedAt})`.as('changedAt')
        })
        .from(pricesTable)
        .groupBy(pricesTable.productEan)
        .as('latest_dates');

    const latestPrices = db
        .select({
            productEan: pricesTable.productEan,
            price: pricesTable.price,
            changedAt: pricesTable.changedAt
        })
        .from(pricesTable)
        .innerJoin(
            latestChangedDates,
            and(
                eq(pricesTable.productEan, latestChangedDates.productEan),
                eq(pricesTable.changedAt, latestChangedDates.changedAt)
            )
        )
        .as('latest_prices');

    const partialProductsFields = {
        ean: productsTable.ean,
        companyId: productsTable.companyId,
        name: productsTable.name,
        category: productsTable.category,
        imageUrl: productsTable.imageUrl,
        url: productsTable.url,
        price: latestPrices.price,
        changedAt: latestPrices.changedAt
    };

    let filteringWhereExpressions: SQL[] = [];
    if (filtering) {
        filteringWhereExpressions = filtering.map(({ key, value }) => {
            const column = partialProductsFields[key] as AnyColumn;
            return like(column, `%${value}%`);
        });
    }

    let orderingExpressions: SQL[] = [];
    if (sorting) {
        orderingExpressions = sorting
            .flatMap(({ key, value }) => {
                if (Object.keys(partialProductsFields).includes(key)) {
                    const column = partialProductsFields[key] as AnyColumn;
                    const nullsLastExpr = sql`CASE WHEN ${column} IS NULL THEN 1 ELSE 0 END ASC`;
                    const columnSortExpr =
                        value === 'asc' ? asc(column) : desc(column);

                    return [nullsLastExpr, columnSortExpr];
                }
            })
            .filter((expr): expr is SQL => Boolean(expr));
    }

    const sortedAndFilteredProducts = await db
        .select(partialProductsFields)
        .from(productsTable)
        .leftJoin(latestPrices, eq(productsTable.ean, latestPrices.productEan))
        .orderBy(...orderingExpressions)
        .where(
            and(
                eq(productsTable.companyId, company.id),
                ...filteringWhereExpressions
            )
        )
        .limit(pageSize)
        .offset(offset);

    const totalCountResult = await db
        .select({ totalCount: sql`count(*)` })
        .from(productsTable)
        .leftJoin(latestPrices, eq(productsTable.ean, latestPrices.productEan))
        .orderBy(...orderingExpressions)
        .where(
            and(
                eq(productsTable.companyId, company.id),
                ...filteringWhereExpressions
            )
        );

    const totalCount = Number(totalCountResult.at(0)?.totalCount) ?? 0;

    const productsResponse: ProductWithPrices[] = await Promise.all(
        sortedAndFilteredProducts.map(async product => {
            const prices = await findPricesByProductEan(product.ean);
            const changedAt = dayjs(product.changedAt).unix();
            return { ...product, changedAt, prices };
        })
    );

    const hasNextPage = pageNumber * pageSize < totalCount;

    return {
        products: productsResponse,
        pageSize,
        pageNumber,
        totalCount,
        hasNextPage
    };
}
