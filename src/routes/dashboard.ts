import { Router } from 'express';
import { showDashboard } from '../controllers/dashboard';

export const dashboardRoutes = Router();

dashboardRoutes.get('/', showDashboard);
