import fs from 'fs';
import axios from 'axios';

const BASE_URL = 'https://www.castorama.pl';

const PRODUCT_REQUEST_URL =
    'https://api.kingfisher.com/prod/v1/product-search-bff/products/CAPL';

const AUTH_HEADER =
    'Atmosphere atmosphere_app_id=kingfisher-EPgbIZbIpBzipu0bKltAFm1xler30LKmaF4vJH96';

const SESSION_ID = 'c58a8cd3-7003-4740-9fc0-039b581b4db4';

// async function getBrowserWithContext() {
//     const browser = await firefox.launch({ headless: true });
//     const context = await browser.newContext();
//     return { browser, context };
// }

// async function getNewPage(browserContext: BrowserContext, url: string) {
//     const page = await browserContext.newPage();
//     await page.goto(url, { waitUntil: 'load' });
//     return { page, content: await page.content() };
// }

// async function getLinks(browserContext: BrowserContext, baseUrl: string) {
//     const { page, content } = await getNewPage(browserContext, baseUrl);
//     const dom = new JSDOM(content);
//     const anchors = dom.window.document.querySelectorAll('a');

//     await page.close();
//     return Array.from(anchors)
//         .map(a => a.getAttribute('href'))
//         .filter(href => href?.endsWith('.cat'))
//         .filter(Boolean)
//         .map(url =>
//             url!.startsWith(baseUrl) ? url : baseUrl + url
//         ) as string[];
// }

function createRequestInstance() {
    return axios.create({
        headers: {
            Authorization: AUTH_HEADER
        }
    });
}

async function requestProductsFromCategory(
    requestInstance: ReturnType<typeof createRequestInstance>,
    categoryId: string,
    page: number = 1,
    pageSize: number = 1
): Promise<any | null> {
    const queryParams = new URLSearchParams({
        channelApiVersion: 'v2',
        'filter[category]': categoryId,
        include: 'content',
        'page[number]': page.toString(),
        'page[size]': pageSize.toString(),
        sessionId: SESSION_ID
    });

    const fullUrl = `${PRODUCT_REQUEST_URL}?${queryParams.toString()}`;

    try {
        const response = await requestInstance.get(fullUrl);
        return response.data;
    } catch (error: any) {
        console.error(
            `Request for category ${categoryId} failed. Error: ${error.message}`
        );
        return null;
    }
}

async function getCategoryIds(
    requestInstance: ReturnType<typeof createRequestInstance>
) {
    const maxMisses = 100;
    const minId = 2917;
    const maxId = 10000;

    let misses = 0;
    for (let id = minId; id < maxId; id++) {
        const fullId = 'CAPL_' + id.toString().padStart(7, '0');
        const data = await requestProductsFromCategory(requestInstance, fullId);

        const isCategory = data?.meta?.isCategory;
        const url = data?.meta?.canonicalPath;

        let fileData: string;

        if (isCategory) {
            fileData = `✅ ${fullId} ${url}`;
            misses = 0;
        } else {
            fileData = `❌ ${fullId}`;
            misses++;
        }

        if (misses >= maxMisses) {
            console.log(
                `Stopped fetching categories after ${maxMisses} missing category ID's.`
            );
            break;
        }

        console.log(fileData);
        fs.appendFileSync('ids.txt', fileData + '\n');
    }
}

async function scrape() {
    const requestInstance = createRequestInstance();
    await getCategoryIds(requestInstance);
}

scrape();
