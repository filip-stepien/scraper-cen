import { RequestFunction, ProductCallback, ScraperFactory } from '../types';
import { createRequestInstance } from '../lib/request';
import { findCompanyByName } from '../lib/companies';
import { getConfig } from '../lib/config';
import { logger } from '../lib/logger';

const { productRequestUrl, authHeader, sessionId } =
    getConfig().companies.castorama;

async function requestProductsFromCategory(
    httpGetFn: RequestFunction,
    categoryId: string,
    page: number = 1,
    pageSize: number = 48
): Promise<any | null> {
    const queryParams = new URLSearchParams({
        channelApiVersion: 'v2',
        'filter[category]': categoryId,
        include: 'content',
        'page[number]': page.toString(),
        'page[size]': pageSize.toString(),
        sessionId
    });

    const fullUrl = `${productRequestUrl}?${queryParams.toString()}`;
    return httpGetFn(fullUrl);
}

function createCategoriesIterator(httpGetFn: RequestFunction) {
    const maxMisses = 100;
    const minId = 0;
    const maxId = 9999999;

    return async (callback: (categoryId: string) => void | Promise<void>) => {
        let misses = 0;
        for (let id = minId; id < maxId; id++) {
            const fullId = 'CAPL_' + id.toString().padStart(7, '0');
            const { data, error } = await requestProductsFromCategory(
                httpGetFn,
                fullId,
                1,
                1
            );
            const isCategory = data?.meta?.isCategory;

            if (isCategory && !error) {
                misses = 0;
                await callback(fullId);
            } else {
                if (error) {
                    logger.warn(
                        `Błąd podczas pobierania produktów kategorii "${fullId}". Status HTTP: ${error.status}.`
                    );
                }
                misses++;
            }

            if (misses >= maxMisses) {
                break;
            }
        }
    };
}

async function createCategoryProductsIterator(
    httpGetFn: RequestFunction,
    categoryId: string
) {
    const companyName = 'castorama';
    const company = await findCompanyByName(companyName);

    if (!company) {
        throw new Error(
            `Błąd przy tworzeniu iteratora: ${companyName} nie istnieje w bazie danych.`
        );
    }

    return async (callback: ProductCallback) => {
        let currentPage = 1;
        do {
            const products = await requestProductsFromCategory(
                httpGetFn,
                categoryId,
                currentPage
            );

            const productsData = products?.data?.data ?? [];

            for (const product of productsData) {
                const attr = product?.attributes;

                callback(
                    {
                        ean: attr?.ean ?? null,
                        companyId: company.id,
                        category: attr?.primaryCategoryName ?? null,
                        name: attr?.name ?? null,
                        imageUrl: attr?.mediaObjects?.at(0)?.url ?? null,
                        url: attr?.url?.shareableUrl ?? null
                    },
                    attr?.pricing?.currentPrice?.amountIncTax
                );
            }

            currentPage = products?.meta?.paging?.nextPage;
        } while (currentPage);
    };
}

export const getCastoramaScraper: ScraperFactory = () => {
    const { httpGetFn } = createRequestInstance(authHeader);
    const forEachCategory = createCategoriesIterator(httpGetFn);
    const forEachProduct = async (callback: ProductCallback) => {
        await forEachCategory(async categoryId => {
            const forEachCategoryProduct = await createCategoryProductsIterator(
                httpGetFn,
                categoryId
            );
            await forEachCategoryProduct(callback);
        });
    };

    return forEachProduct;
};
