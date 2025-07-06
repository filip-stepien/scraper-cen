import { Router } from 'express';
import { checkAuth } from '../middleware/checkAuth';
import { listProducts } from '../controllers/products';

export const productRoutes = Router();

productRoutes.get('/products/:company', checkAuth, listProducts);
