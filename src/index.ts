import 'dotenv/config';
import { getCastoramaScraper } from './scrapers/castorama';
import { insertOrUpdateProduct } from './lib/products';
import { ProductChangeStatus } from './types';
import { logger } from './lib/logger';

async function main() {
    const castoramaScraper = getCastoramaScraper();

    const stats: Record<ProductChangeStatus, number> = {
        added: 0,
        updated: 0,
        unchanged: 0,
        error: 0
    };

    logger.info('Scrapowanie rozpoczęte.');

    await castoramaScraper(async product => {
        const result = await insertOrUpdateProduct(product);
        stats[result]++;
    });

    logger.info('Scrapowanie zakończone. Statystyki:');
    logger.info(`Dodane: ${stats.added}`);
    logger.info(`Zaktualizowane: ${stats.updated}`);
    logger.info(`Niezmienione: ${stats.unchanged}`);
    logger.info(`Błędy: ${stats.error}`);
}

main();
