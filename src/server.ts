import 'dotenv/config';
import express from 'express';
import { logger } from './lib/logger';
import { globalErrorHandler } from './middleware/error';
import { listProducts } from './controllers/products';
import { notFound } from './middleware/notFound';
import { checkAuth } from './middleware/checkAuth';
import { getConfig } from './lib/config';
import cookieParser from 'cookie-parser';
import { signIn, signOut } from './controllers/auth';

const { port } = getConfig().website;
const app = express();

app.use(express.json());

app.use(cookieParser());

app.post('/signIn', signIn);

app.post('/signOut', checkAuth, signOut);

app.get('/products/:company', checkAuth, listProducts);

app.use(notFound);

app.use(globalErrorHandler);

app.listen(port, error => {
    if (error) {
        logger.fatal(`Błąd przy uruchamianiu serwera HTTP: ${error.message}`);
        process.exit(1);
    } else {
        logger.info(`Serwer HTTP uruchomiony na porcie ${port}.`);
    }
});
