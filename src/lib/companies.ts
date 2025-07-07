import { eq } from 'drizzle-orm';
import { db } from '../db';
import { companiesTable } from '../db/schema';
import { Company } from '../types';
import { scrapers } from '../scrapers';
import { logger } from './logger';

export async function findCompanyByName(
    companyName: string
): Promise<Company | null> {
    const company = await db
        .select()
        .from(companiesTable)
        .where(eq(companiesTable.name, companyName))
        .get();

    return company ?? null;
}

export async function saveCompany(companyName: string) {
    const exists = await findCompanyByName(companyName);
    if (!exists) {
        await db.insert(companiesTable).values({ name: companyName }).run();
        logger.debug(`Utworzono firmę "${companyName}" w bazie danych.`);
    }
}

export async function registerCompanies() {
    await Promise.all(
        scrapers.map(({ companyName }) => saveCompany(companyName))
    );
}
