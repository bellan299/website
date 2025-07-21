const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const CLOVER_API_KEY = process.env.CLOVER_API_KEY;
const CLOVER_MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;
const BASE_URL = 'https://api.clover.com';

if (!CLOVER_API_KEY || !CLOVER_MERCHANT_ID) {
  throw new Error('CLOVER_API_KEY and CLOVER_MERCHANT_ID are required');
}

const categoryMapping = [
  'wine', 'red wine', 'white wine', 'rosé', 'rose', 'sparkling',
  'dessert wine', 'port', 'sherry', 'zinfandel', 'cabernet', 'merlot',
  'pinot', 'chardonnay', 'malbec', 'sauvignon', 'riesling', 'moscato',
  'syrah', 'shiraz', 'bordeaux', 'chianti', 'tempranillo', 'sangiovese',
  'grenache', 'barolo', 'barbaresco', 'nebbiolo', 'gewürztraminer',
  'chenin blanc', 'viognier', 'semillon', 'grüner', 'prosecco', 'cava',
  'champagne', 'lambrusco', 'vermouth', 'ice wine', 'pet nat', 'petillant',
  'frizzante', 'vouvray', 'beaujolais', 'gamay', 'carignan', 'mourvedre',
  'petite sirah', 'petit verdot', 'cabernet franc', 'albariño', 'verdejo',
  'garnacha', 'fiano', 'falanghina', 'gavi', 'soave', 'trebbiano', 'verdicchio',
  'valpolicella', 'amarone', 'ripasso', 'primitivo', 'aglianico', 'nero d’avola',
  'carmenere', 'torrontes', 'bonarda', 'tannat', 'pinotage', 'viura', 'macabeo',
  'godello', 'loureiro', 'arinto', 'baga', 'touriga', 'trincadeira', 'antao vaz',
  'moscatel', 'muscat', 'vinho verde', 'txakoli', 'txakolina', 'malvasia', 'picpoul',
  'marsanne', 'roussanne', 'claret', 'clarete', 'rosato', 'rosado', 'sparkling wine'
];

async function fetchAllPages(endpoint, params = {}) {
  let allElements = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append('limit', limit);
    url.searchParams.append('offset', offset);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value);
    }
    const response = await axios.get(url.toString(), {
      headers: {
        'Authorization': `Bearer ${CLOVER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    const data = response.data;
    if (data.elements && data.elements.length > 0) {
      allElements = allElements.concat(data.elements);
      if (data.elements.length < limit) break;
      offset += limit;
      await new Promise(r => setTimeout(r, 300));
    } else {
      break;
    }
  }
  return allElements;
}

(async () => {
  try {
    console.log('Fetching Clover items, categories, and stocks...');
    const [items, categories, stocks] = await Promise.all([
      fetchAllPages(`/v3/merchants/${CLOVER_MERCHANT_ID}/items`, { expand: 'categories,tags,modifications' }),
      fetchAllPages(`/v3/merchants/${CLOVER_MERCHANT_ID}/categories`),
      fetchAllPages(`/v3/merchants/${CLOVER_MERCHANT_ID}/item_stocks`)
    ]);
    const categoryMap = {};
    categories.forEach(cat => { categoryMap[cat.id] = cat.name.toLowerCase(); });
    const stockMap = {};
    stocks.forEach(stock => {
      if (stock.item && stock.quantity !== undefined) {
        stockMap[stock.item.id] = stock.quantity;
      }
    });
    // Filter for wine products
    const wineProducts = items.filter(item => {
      if (!item.available) return false;
      if (!item.categories || !item.categories.elements || item.categories.elements.length === 0) return false;
      // Check all categories for wine keywords
      return item.categories.elements.some(cat => {
        const catName = categoryMap[cat.id] || '';
        return categoryMapping.some(keyword => catName.includes(keyword));
      });
    }).map(item => ({
      id: item.id,
      name: item.name,
      price: item.price / 100,
      description: item.description || '',
      image: item.image || null,
      stockQuantity: stockMap[item.id] ?? 0,
      sku: item.sku || '',
      available: item.available,
      categories: (item.categories?.elements || []).map(cat => categoryMap[cat.id] || cat.id),
      tags: (item.tags?.elements || []).map(tag => tag.name)
    }));
    // Remove duplicates by item.id
    const uniqueWineProducts = Object.values(wineProducts.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {}));
    // Save to file
    const dataDir = path.join(__dirname, '..', 'data');
    try { await fs.access(dataDir); } catch { await fs.mkdir(dataDir, { recursive: true }); }
    const outPath = path.join(dataDir, 'wine_inventory.json');
    await fs.writeFile(outPath, JSON.stringify(uniqueWineProducts, null, 2));
    console.log(`✅ Exported ${uniqueWineProducts.length} wine products to ${outPath}`);
    // Log a sample
    console.log('Sample:', uniqueWineProducts.slice(0, 3));
  } catch (err) {
    console.error('❌ Export failed:', err.message);
    process.exit(1);
  }
})(); 