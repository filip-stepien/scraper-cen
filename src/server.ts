import 'dotenv/config';
import express from 'express';
import { getEnvString } from './lib/utils';
import { logger } from './lib/logger';
import { globalErrorHandler } from './middleware/error';
import { listProducts } from './controllers/products';
import { notFound } from './middleware/notFound';

const app = express();
const port = getEnvString('WEBSITE_PORT');

app.get('/products/:company', listProducts);

app.use(notFound);

app.use(globalErrorHandler);

app.listen(port, error => {
    if (error) {
        logger.error(`Błąd przy uruchamianiu serwera HTTP: ${error.message}`);
        process.exit(1);
    } else {
        logger.info(`Serwer HTTP uruchomiony na porcie ${port}.`);
    }
});
