import { scrapers } from '../scrapers';
import { PriceStat, ProductStat, ScraperState } from '../types';
import { getConfig } from './config';
import { logger } from './logger';
import { isValidCron } from 'cron-validator';
import cron from 'node-cron';
import cronstrue from 'cronstrue/i18n';
import { notifyScrapeEnd, notifyScrapeStart } from './events';
import { savePrice } from './prices';
import { saveProduct } from './products';

let scraperState: ScraperState = { status: 'idle' };

export function getScraperState() {
    return scraperState;
}

export function changeScraperState(newState: ScraperState) {
    if (scraperState.status !== newState.status) {
        logger.debug(
            `Zmiana stanu aplikacji: "${scraperState.status}" -> "${newState.status}".`
        );
    }

    scraperState = newState;
}

async function scrape() {
    const productStats: ProductStat[] = [];
    const priceStats: PriceStat[] = [];

    for (const { companyName, scraperFactory } of scrapers) {
        const productStat: ProductStat = {
            companyName,
            stats: {
                created: 0,
                unchanged: 0,
                updated: 0
            }
        };

        const priceStat: PriceStat = {
            companyName,
            stats: {
                created: 0,
                unchanged: 0
            }
        };

        const scrape = scraperFactory();

        await notifyScrapeStart(companyName);

        logger.info(`Rozpoczęto pobieranie danych ze strony "${companyName}".`);

        await scrape(async (product, price) => {
            const productStatus = await saveProduct(product);
            const priceStatus = await savePrice(product.ean, price);

            productStat.stats[productStatus]++;
            priceStat.stats[priceStatus]++;
        });

        logger.info(`Zakończono pobieranie danych ze strony "${companyName}".`);
        logger.info(
            `Statystyki produktów dla "${companyName}": ` +
                `\n- dodane: ${productStat.stats.created}, ` +
                `\n- zmienione: ${productStat.stats.updated}, ` +
                `\n- bez zmian: ${productStat.stats.unchanged}`
        );

        logger.info(
            `Statystyki cen dla "${companyName}": ` +
                `\n- dodane: ${priceStat.stats.created}, ` +
                `\n- bez zmian: ${priceStat.stats.unchanged}`
        );

        productStats.push(productStat);
        priceStats.push(priceStat);
    }

    await notifyScrapeEnd(productStats, priceStats);
}

export function scheduleScrape() {
    const config = getConfig().scrape;
    const cronSchedule = config.cron;
    const runOnAppStart = config.runOnAppStart;
    const scheduleOnAppStart = config.scheduleOnAppStart;

    if (!isValidCron(cronSchedule, { seconds: false })) {
        throw new Error(`Harmonogram "${cronSchedule}" jest nieprawidłowy.`);
    }

    const runScrape = () => {
        if (scraperState.status === 'idle') {
            scrape();
        } else {
            logger.warn(
                'Pominięto wykonanie zadania z harmonogramu - pobieranie danych nadal trwa!'
            );
        }
    };

    if (runOnAppStart) {
        runScrape();
    }

    if (scheduleOnAppStart) {
        cron.schedule(cronSchedule, runScrape);

        const cronHumanReadable = cronstrue
            .toString(cronSchedule, {
                locale: 'pl'
            })
            .toLowerCase();

        logger.info(
            `Zarejestrowano proces pobierania danych z harmonogramem: "${cronHumanReadable}".`
        );
    } else {
        logger.warn(
            `Harmonogram pobierania danych został wyłączony zgodnie z konfiguracją.`
        );
    }
}
