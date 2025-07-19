const puppeteer = require('puppeteer');
const fs = require('fs');

// Configuration
const SEARCH_QUERY = "JP's Liquor Wine and Beer of Lino Lakes";
const GOOGLE_SHOPPING_URL = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(SEARCH_QUERY)}`;
const SELLER_NAME = "JP's Liquor Wine and Beer of Lino Lakes";
const OUTPUT_FILE = 'jps-liquor-products.json';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(GOOGLE_SHOPPING_URL, { waitUntil: 'networkidle2' });

  let products = [];
  let hasNextPage = true;
  let pageNum = 1;

  while (hasNextPage) {
    // Wait for product cards to load
    await page.waitForSelector('div.sh-dgr__grid-result');

    // Extract product data
    const pageProducts = await page.evaluate((SELLER_NAME) => {
      const cards = Array.from(document.querySelectorAll('div.sh-dgr__grid-result'));
      return cards.map(card => {
        const name = card.querySelector('h4')?.innerText || '';
        const price = card.querySelector('.T14wmb')?.innerText || '';
        const store = card.querySelector('.aULzUe.IuHnof')?.innerText || '';
        const link = card.querySelector('a.shntl')?.href || '';
        const image = card.querySelector('img')?.src || '';
        return { name, price, store, link, image };
      }).filter(product => product.store === SELLER_NAME);
    }, SELLER_NAME);

    products = products.concat(pageProducts);

    // Check for next page
    const nextButton = await page.$('a#pnnext');
    if (nextButton) {
      await Promise.all([
        page.click('a#pnnext'),
        page.waitForNavigation({ waitUntil: 'networkidle2' })
      ]);
      pageNum++;
    } else {
      hasNextPage = false;
    }
  }

  await browser.close();

  // Save to JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(products, null, 2));
  console.log(`✅ Scraped ${products.length} products. Results saved to ${OUTPUT_FILE}`);
})(); 