import { getCastoramaScraper } from '../scrapers/castorama';
import { CompanyScrapersConfig } from '../types';

export const companyScrapers: CompanyScrapersConfig = [
    {
        companyName: 'castorama',
        scraper: getCastoramaScraper
    }
];
