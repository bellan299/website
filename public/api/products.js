// Dummy change to force Vercel redeploy
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

// In-memory cache
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAllCloverPages(endpoint, params = {}) {
  let allElements = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const pageParams = { ...params, limit, offset };
    let data;
    try {
      data = await makeCloverRequest(endpoint, pageParams);
    } catch (err) {
      console.error(`Error fetching page at offset ${offset} for ${endpoint}:`, err);
      break;
    }
    if (data.elements && data.elements.length > 0) {
      allElements = allElements.concat(data.elements);
      if (data.elements.length < limit) break; // Last page
      offset += limit;
      await delay(300); // Add delay to avoid rate limit
    } else {
      break;
    }
  }
  console.log(`Fetched ${allElements.length} elements from ${endpoint}`);
  return allElements;
}

export default async function handler(req, res) {
  // TEMP: Disable all Clover API calls to avoid hitting rate limits
  return res.status(200).json({
    success: true,
    products: [],
    categories: ['wine', 'spirits', 'beer', 'seltzer', 'thc'],
    message: 'Clover API calls are temporarily disabled to avoid rate limits.'
  });
} 