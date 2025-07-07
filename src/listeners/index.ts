import { logger } from '../lib/logger';
import { EventListener } from '../types';
import { scrapeStateListener } from './scrapeStateListener';

export const eventListeners: EventListener[] = [scrapeStateListener];
