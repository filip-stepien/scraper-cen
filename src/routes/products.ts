import { Router } from 'express';
import { checkAuth } from '../middleware/checkAuth';
import {
    listProducts,
    listValidProductFilteringFields,
    listValidProductSortingFields
} from '../controllers/products';

export const productRoutes = Router();

productRoutes.get('/products/:company', checkAuth, listProducts);

productRoutes.get(
    '/products/valid-fields/sorting',
    checkAuth,
    listValidProductSortingFields
);

productRoutes.get(
    '/products/valid-fields/filtering',
    checkAuth,
    listValidProductFilteringFields
);
