const CLOVER_CONFIG = {
  BASE_URL: 'https://api.clover.com',
  MERCHANT_ID: process.env.CLOVER_MERCHANT_ID || null,
  API_KEY: process.env.CLOVER_API_KEY
};

async function makeCloverRequest(endpoint, params = {}) {
  try {
    const url = new URL(`${CLOVER_CONFIG.BASE_URL}${endpoint}`);
    const requestParams = { ...params };
    if (CLOVER_CONFIG.MERCHANT_ID) {
      requestParams.merchant_id = CLOVER_CONFIG.MERCHANT_ID;
    }
    Object.keys(requestParams).forEach(key => {
      url.searchParams.append(key, requestParams[key]);
    });
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${CLOVER_CONFIG.API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Clover API Error:', error.message);
    throw error;
  }
}

async function fetchAllCloverPages(endpoint, params = {}) {
  let allElements = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const pageParams = { ...params, limit, offset };
    const data = await makeCloverRequest(endpoint, pageParams);
    if (data.elements && data.elements.length > 0) {
      allElements = allElements.concat(data.elements);
      if (data.elements.length < limit) break; // Last page
      offset += limit;
    } else {
      break;
    }
  }
  return allElements;
}

export default async function handler(req, res) {
  if (!CLOVER_CONFIG.API_KEY || !CLOVER_CONFIG.MERCHANT_ID) {
    return res.status(200).json({
      success: true,
      products: [],
      categories: ['wine', 'spirits', 'beer', 'seltzer', 'thc']
    });
  }
  try {
    let products, categories, stocks;
    try {
      products = await fetchAllCloverPages(`/v3/merchants/${CLOVER_CONFIG.MERCHANT_ID}/items`, { expand: 'categories,tags,modifications' });
      categories = await fetchAllCloverPages(`/v3/merchants/${CLOVER_CONFIG.MERCHANT_ID}/categories`);
      stocks = await fetchAllCloverPages(`/v3/merchants/${CLOVER_CONFIG.MERCHANT_ID}/item_stocks`);
    } catch (error) {
      throw error;
    }
    // Map itemId to stock quantity
    const stockMap = {};
    stocks.forEach(stock => {
      if (stock.item && stock.quantity !== undefined) {
        stockMap[stock.item.id] = stock.quantity;
      }
    });
    const categoryMap = {};
    categories.forEach(category => {
      categoryMap[category.id] = category.name;
    });
    const categoryMapping = {
      'wine': [
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
      ],
      'spirits': ['spirits', 'whiskey', 'vodka', 'rum', 'gin', 'tequila', 'bourbon', 'scotch'],
      'beer': ['beer', 'ale', 'lager', 'craft beer'],
      'seltzer': ['seltzer', 'hard seltzer', 'spritzer'],
      'thc': ['thc', 'cannabis', 'marijuana']
    };
    const formattedProducts = products
      .filter(item => item.available)
      .map(item => {
        let category = 'other';
        if (item.categories && item.categories.elements && item.categories.elements.length > 0) {
          const categoryId = item.categories.elements[0].id;
          category = categoryMap[categoryId]?.toLowerCase() || 'other';
        }
        for (const [ourCategory, keywords] of Object.entries(categoryMapping)) {
          if (keywords.some(keyword => category.includes(keyword))) {
            category = ourCategory;
            break;
          }
        }
        return {
          id: item.id,
          name: item.name,
          price: item.price / 100,
          category: category,
          description: item.description || '',
          image: item.image || null,
          isBestSeller: item.tags?.elements?.some(tag => 
            tag.name.toLowerCase().includes('best seller') || 
            tag.name.toLowerCase().includes('popular')
          ) || false,
          isNewArrival: item.tags?.elements?.some(tag => 
            tag.name.toLowerCase().includes('new') || 
            tag.name.toLowerCase().includes('arrival')
          ) || false,
          stockQuantity: stockMap[item.id] ?? 0,
          sku: item.sku || '',
          available: item.available
        };
      });
    res.status(200).json({
      success: true,
      products: formattedProducts,
      categories: Object.keys(categoryMapping)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products from Clover',
      details: error.message
    });
  }
} 