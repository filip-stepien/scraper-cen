import 'dotenv/config';
import { getCastoramaScraper } from './scrapers/castorama';
import { saveProduct } from './lib/products';
import { logger } from './lib/logger';
import { saveCompaniesFromConfig } from './lib/companies';
import { companyScrapers } from './config/companyScrapers';
import { savePrice } from './lib/prices';

async function main() {
    await saveCompaniesFromConfig(companyScrapers);

    const castoramaScraper = getCastoramaScraper();

    logger.info('Scrapowanie rozpoczęte.');

    await castoramaScraper(async (product, price) => {
        await saveProduct(product);
        await savePrice(product.ean, price);
    });

    logger.info('Scrapowanie zakończone.');
}

main();
