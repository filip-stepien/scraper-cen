import { EventListener } from '../types';
import { changeScraperState } from '../lib/scrape';

function onScrapeStart(companyName: string) {
    changeScraperState({ status: 'scraping', source: companyName });
}

function onScrapeEnd() {
    changeScraperState({ status: 'idle' });
}

export const scrapeStateListener: EventListener = {
    listenerName: 'scrapeStateListener',
    events: {
        onScrapeStart,
        onScrapeEnd
    }
};
