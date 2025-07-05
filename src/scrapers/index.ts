import { getCastoramaScraper } from './castorama';
import { CompanyScraper } from '../types';

export const scrapers: CompanyScraper[] = [
    {
        companyName: 'castorama',
        scraper: getCastoramaScraper
    }
];
