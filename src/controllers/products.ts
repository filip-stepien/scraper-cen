import { NextFunction, Request, Response } from 'express';
import { findProductsByCompany } from '../lib/products';
import { parseNumber } from '../lib/utils';

export async function listProducts(
    req: Request<{ company: string }>,
    res: Response,
    next: NextFunction
) {
    try {
        const defaultPageNumber = 1;
        const defaultPageSize = 10;

        const company = req.params.company;
        const { pageNumber, pageSize } = req.query;

        const parsedPageNumber = parseNumber(pageNumber, defaultPageNumber);
        const parsedPageSize = parseNumber(pageSize, defaultPageSize);

        const result = await findProductsByCompany(
            company,
            parsedPageSize,
            parsedPageNumber
        );

        res.json(result);
    } catch (error) {
        next(error);
    }
}
