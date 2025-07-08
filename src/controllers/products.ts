import { Request, Response } from 'express';
import {
    findProductsByCompany,
    getValidFilteringFields,
    getValidSortingFields
} from '../lib/products';
import { parseNumber } from '../lib/utils';
import { HttpStatus } from '../types';

export async function listProducts(req: Request, res: Response) {
    const defaultPageNumber = 1;
    const defaultPageSize = 10;

    const query = req.query;
    const company = req.params.company;
    const pageNumber = query?.pageNumber;
    const pageSize = query?.pageSize;
    const sortBy = query?.sortBy;
    const filterBy = query?.filterBy;

    const parsedPageNumber = parseNumber(pageNumber, defaultPageNumber);
    const parsedPageSize = parseNumber(pageSize, defaultPageSize);

    const result = await findProductsByCompany(
        company,
        parsedPageSize,
        parsedPageNumber,
        sortBy?.toString(),
        filterBy?.toString()
    );

    res.status(HttpStatus.OK).json(result);
}

export async function listValidProductSortingFields(
    _req: Request,
    res: Response
) {
    res.status(HttpStatus.OK).json(getValidSortingFields());
}

export async function listValidProductFilteringFields(
    _req: Request,
    res: Response
) {
    res.status(HttpStatus.OK).json(getValidFilteringFields());
}
