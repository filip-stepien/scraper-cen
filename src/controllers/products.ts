import { Request, Response } from 'express';
import { findProductsByCompany } from '../lib/products';
import { parseNumber } from '../lib/utils';
import { HttpStatus } from '../types';

export async function listProducts(req: Request, res: Response) {
    const defaultPageNumber = 1;
    const defaultPageSize = 10;

    const company = req.params.company;
    const pageNumber = req.query?.pageNumber;
    const pageSize = req.query?.pageSize;

    const parsedPageNumber = parseNumber(pageNumber, defaultPageNumber);
    const parsedPageSize = parseNumber(pageSize, defaultPageSize);

    const result = await findProductsByCompany(
        company,
        parsedPageSize,
        parsedPageNumber
    );

    res.status(HttpStatus.OK).json(result);
}
