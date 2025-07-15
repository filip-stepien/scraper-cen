import { CookieOptions } from 'express';

export type RequestParamEntry = {
    key: string;
    value: string;
};

export type FilteringOption = {
    field: string;
    query: string;
};

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
    price: number | null;
    changedAt: number | null;
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

export type ScraperFactory = () => (
    callback: ProductCallback
) => any | Promise<any>;

export type NotificatorRegister = () => Promise<void> | void;

export type NotificatorNotify = (
    productStats: ProductStat[],
    priceStats: PriceStat[]
) => Promise<void> | void;

export type Notificator = {
    providerName: string;
    register: NotificatorRegister;
    notify: NotificatorNotify;
};

export type StateSubscriber = {
    subscriberName: string;
};

export type ErrorResponse = {
    error: true;
    message: string;
};

export enum ProductStatus {
    UPDATED = 'updated',
    UNCHANGED = 'unchanged',
    CREATED = 'created'
}

export enum PriceStatus {
    UNCHANGED = 'unchanged',
    CREATED = 'created'
}

export type ProductStat = {
    companyName: string;
    stats: Record<ProductStatus, number>;
};

export type PriceStat = {
    companyName: string;
    stats: Record<PriceStatus, number>;
};

export enum HttpStatus {
    OK = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500
}

export type Cookie = {
    name: string;
    value: string;
    options: CookieOptions;
};

export type CompanyScraper = {
    companyName: string;
    scraperFactory: ScraperFactory;
};

export type ScraperState =
    | { status: 'idle' }
    | { status: 'scraping'; source: string };

export type AppEvents = {
    onScrapeStart?: (companyName: string) => void | Promise<void>;
    onScrapeEnd?: (
        productStats: ProductStat[],
        priceStats: PriceStat[]
    ) => void | Promise<void>;
};

export type EventListener = {
    listenerName: string;
    register?: () => void | Promise<void>;
    events?: AppEvents;
};

export type Config = {
    website: {
        port: number;
        authorization: {
            enabled: boolean;
            username: string;
            passwordHash: string;
        };
        session: {
            secret: string;
            cookieName: string;
            durationSeconds: number;
        };
    };
    scrape: {
        cron: '0 0 * * *';
        runOnAppStart: boolean;
        scheduleOnAppStart: boolean;
    };
    db: {
        fileName: string;
        maxPricesCount: number;
    };
    companies: {
        castorama: {
            productRequestUrl: string;
            authHeader: string;
            sessionId: string;
        };
    };
};
