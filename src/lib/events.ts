import { eventListeners } from '../listeners';
import { PriceStat, ProductStat } from '../types';

export async function registerEventListeners() {
    await Promise.all(
        eventListeners.map(listener => {
            if (listener.register) {
                listener.register();
            }
        })
    );
}

export async function notifyScrapeStart(companyName: string) {
    await Promise.all(
        eventListeners.map(listener => {
            if (listener.events?.onScrapeStart) {
                listener.events.onScrapeStart(companyName);
            }
        })
    );
}

export async function notifyScrapeEnd(
    productStats: ProductStat[],
    priceStats: PriceStat[]
) {
    await Promise.all(
        eventListeners.map(listener => {
            if (listener.events?.onScrapeEnd) {
                listener.events.onScrapeEnd(productStats, priceStats);
            }
        })
    );
}
