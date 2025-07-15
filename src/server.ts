import 'dotenv/config';
import express from 'express';
import { logger } from './lib/logger';
import { globalErrorHandler } from './middleware/error';
import { listProducts } from './controllers/products';
import { notFound } from './middleware/notFound';
import { checkAuth } from './middleware/checkAuth';
import { getConfig } from './lib/config';
import { signIn, signOut } from './controllers/auth';
import { scheduleScrape } from './lib/scrape';
import { registerEventListeners } from './lib/events';
import cookieParser from 'cookie-parser';
import { ping } from './controllers/status';
import { authRoutes } from './routes/auth';
import { productRoutes } from './routes/products';
import { registerCompanies } from './lib/companies';

async function startServer() {
    const { port } = getConfig().website;
    const app = express();

    app.use(express.json());
    app.use(cookieParser());
    app.use(authRoutes);
    app.use(productRoutes);
    app.use(notFound);
    app.use(globalErrorHandler);

    app.listen(port, error => {
        if (error) {
            throw new Error(
                `Błąd przy uruchamianiu serwera HTTP: ${error.message}`
            );
        } else {
            logger.info(`Serwer HTTP uruchomiony na porcie ${port}.`);
        }
    });

    await registerCompanies();
    await registerEventListeners();
    scheduleScrape();
}

startServer().catch(err => {
    logger.fatal(err instanceof Error ? err.message : err);
    process.exit(1);
});
