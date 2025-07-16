import 'dotenv/config';
import express from 'express';
import { logger } from './lib/logger';
import { globalErrorHandler } from './middleware/error';
import { notFound } from './middleware/notFound';
import { getConfig } from './lib/config';
import { scheduleScrape } from './lib/scrape';
import { registerEventListeners } from './lib/events';
import cookieParser from 'cookie-parser';
import { authRoutes } from './routes/auth';
import { productRoutes } from './routes/products';
import { registerCompanies } from './lib/companies';
import { dashboardRoutes } from './routes/dashboard';
import { getPublicPath } from './lib/utils';

async function startServer() {
    const { port } = getConfig().website;
    const app = express();

    app.use(express.static(getPublicPath()));
    app.use(express.json());
    app.use(cookieParser());
    app.use(authRoutes);
    app.use(productRoutes);
    app.use(dashboardRoutes);
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

    try {
        await registerCompanies();
        await registerEventListeners();
        scheduleScrape();
    } catch (e) {
        console.warn(e);
    }
}

startServer().catch(err => {
    logger.fatal(err instanceof Error ? err.message : err);
    process.exit(1);
});
