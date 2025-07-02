export type LoggerLogFunction = (msg: string) => any;

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

export type Product = {
    ean: string;
    name: string;
    category: string;
    price: number;
};

export type ProductCallback = (product: Product) => any | Promise<any>;

export type ScrapeFunction = () => (
    callback: ProductCallback
) => any | Promise<any>;

export enum ProductChangeStatus {
    Added = 'added',
    Updated = 'updated',
    Unchanged = 'unchanged',
    Error = 'error'
}
