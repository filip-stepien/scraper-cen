import { scrapers } from '../scrapers';
import { PriceStat, ProductStat, ScraperState } from '../types';
import { getConfig } from './config';
import { logger } from './logger';
import { isValidCron } from 'cron-validator';
import cron from 'node-cron';
import cronstrue from 'cronstrue/i18n';
import { notifyScrapeEnd, notifyScrapeStart } from './events';

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

        logger.debug(
            `Rozpoczęto pobieranie danych ze strony "${companyName}".`
        );

        // await scrape(async (product, price) => {
        //     const productStatus = await saveProduct(product);
        //     const priceStatus = await savePrice(product.ean, price);

        //     productStat.stats[productStatus]++;
        //     priceStat.stats[priceStatus]++;
        // });

        await new Promise(r => setTimeout(r, 10000));

        logger.debug(
            `Zakończono pobieranie danych ze strony "${companyName}".`
        );
        logger.debug(
            `Statystyki produktów dla "${companyName}": ` +
                `\n- dodane: ${productStat.stats.created}, ` +
                `\n- zmienione: ${productStat.stats.updated}, ` +
                `\n- bez zmian: ${productStat.stats.unchanged}`
        );

        logger.debug(
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
    const cronSchedule = getConfig().scrape.cron;
    if (!isValidCron(cronSchedule, { seconds: true })) {
        throw new Error(`Harmonogram "${cronSchedule}" jest nieprawidłowy.`);
    }

    cron.schedule(cronSchedule, () => {
        if (scraperState.status === 'idle') {
            scrape();
        } else {
            logger.warn(
                'Pominięto wykonanie zadania z harmonogramu - pobieranie danych nadal trwa!'
            );
        }
    });

    const cronHumanReadable = cronstrue
        .toString(cronSchedule, {
            locale: 'pl'
        })
        .toLowerCase();

    logger.info(
        `Zarejestrowano proces pobierania danych z harmonogramem: "${cronHumanReadable}".`
    );
}
