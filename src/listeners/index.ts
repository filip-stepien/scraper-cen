import { logger } from '../lib/logger';
import { EventListener } from '../types';
import { scrapeStateListener } from './scrapeStateListener';

export const eventListeners: EventListener[] = [
    {
        listenerName: 'test',
        events: {
            onScrapeStart: () => logger.debug('scrape start'),
            onScrapeEnd: () => logger.debug('scrape end')
        }
    },
    scrapeStateListener
];
