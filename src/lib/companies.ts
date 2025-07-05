import { eq } from 'drizzle-orm';
import { db } from '../db';
import { companiesTable } from '../db/schema';
import { Company } from '../types';

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
    }
}
