import 'dotenv/config';
import { getCastoramaScraper } from './scrapers/castorama';
import { saveProduct } from './lib/products';
import { logger } from './lib/logger';
import { saveCompany } from './lib/companies';
import { scrapers } from './scrapers';
import { savePrice } from './lib/prices';

async function main() {
    await Promise.all(
        scrapers.map(({ companyName }) => saveCompany(companyName))
    );

    const castoramaScraper = getCastoramaScraper();

    logger.info('Scrapowanie rozpoczęte.');

    await castoramaScraper(async (product, price) => {
        await saveProduct(product);
        await savePrice(product.ean, price);
    });

    logger.info('Scrapowanie zakończone.');
}

main();
