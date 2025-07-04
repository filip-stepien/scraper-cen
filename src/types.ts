export type LoggerLogFunction = (...msg: string[]) => any;

export type Company = {
    id: number;
    name: string;
};

export type Product = {
    companyId: number;
    ean: string | null;
    name: string | null;
    category: string | null;
    imageUrl: string | null;
    url: string | null;
};

export type PriceHistory = {
    price: number;
    changedAt: number;
};

export type ProductWithPrices = Product & {
    prices: PriceHistory[];
};

export type PagedProductsResponse = {
    products: ProductWithPrices[];
    pageSize: number;
    pageNumber: number;
    totalCount: number;
    hasNextPage: boolean;
};

export type Logger = {
    debug: LoggerLogFunction;
    info: LoggerLogFunction;
    warn: LoggerLogFunction;
    error: LoggerLogFunction;
    fatal: LoggerLogFunction;
};

export type RequestResult = {
    data: any;
    error: { status: number | null; message: string } | null;
};

export type RequestFunction = (url: string) => Promise<RequestResult>;

export type ProductCallback = (
    product: Product,
    price: number | null
) => any | Promise<any>;

export type ScrapeFunction = () => (
    callback: ProductCallback
) => any | Promise<any>;

export type CompanyScrapersConfig = {
    companyName: string;
    scraper: ScrapeFunction;
}[];

export type ErrorResponse = {
    error: true;
    message: string;
};
