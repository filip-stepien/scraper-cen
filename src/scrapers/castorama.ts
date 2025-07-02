import { RequestFunction, ProductCallback, ScrapeFunction } from '../types';
import { createRequestInstance } from '../lib/request';
import { getEnv } from '../lib/utils';
import { logger } from '../lib/logger';

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
        sessionId: getEnv('CASTORAMA_SESSION_ID')
    });

    const requestUrl = getEnv('CASTORAMA_PRODUCT_REQUEST_URL');
    const fullUrl = `${requestUrl}?${queryParams.toString()}`;
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
                    logger.error(
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

function createCategoryProductsIterator(
    httpGetFn: RequestFunction,
    categoryId: string
) {
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
                callback({
                    ean: product?.attributes?.ean,
                    category: product?.attributes?.primaryCategoryName,
                    name: product?.attributes?.name,
                    price: product?.attributes?.pricing?.currentPrice
                        ?.amountIncTax
                });
            }

            currentPage = products?.meta?.paging?.nextPage;
        } while (currentPage);
    };
}

export const getCastoramaScraper: ScrapeFunction = () => {
    const { httpGetFn } = createRequestInstance(
        getEnv('CASTORAMA_AUTH_HEADER')
    );

    const forEachCategory = createCategoriesIterator(httpGetFn);

    const forEachProduct = async (callback: ProductCallback) => {
        await forEachCategory(async categoryId => {
            const forEachCategoryProduct = createCategoryProductsIterator(
                httpGetFn,
                categoryId
            );
            await forEachCategoryProduct(callback);
        });
    };

    return forEachProduct;
};
