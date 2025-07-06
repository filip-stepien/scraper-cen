import { Router } from 'express';
import { checkAuth } from '../middleware/checkAuth';
import { signIn, signOut } from '../controllers/auth';
import { ping } from '../controllers/status';

export const authRoutes = Router();

authRoutes.post('/auth/signIn', signIn);
authRoutes.post('/auth/signOut', checkAuth, signOut);
authRoutes.get('/auth/check', checkAuth, ping);
