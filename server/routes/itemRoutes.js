const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const CLOVER_API_KEY = process.env.CLOVER_API_KEY;
const CLOVER_MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;
const CLOVER_API_BASE = `https://api.clover.com/v3/merchants/${CLOVER_MERCHANT_ID}`;

// Category mapping
const CATEGORY_MAP = {
  Beer: 'beer',
  Wine: 'wine',
  Spirits: 'spirits',
  Seltzer: 'seltzer',
  THC: 'thc',
  Nonalcoholic: 'nonalcoholic',
};
const EXCLUDED_CATEGORIES = ['Cigars', 'Misc', 'Bags/NonAlcoholic/Bottles'];

// Simple in-memory cache
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

router.get('/api/products', async (req, res) => {
  try {
    // Serve from cache if fresh
    if (cachedData && Date.now() - cacheTimestamp < CACHE_DURATION) {
      return res.json(cachedData);
    }

    // Fetch categories
    const catRes = await fetch(`${CLOVER_API_BASE}/categories?limit=1000`, {
      headers: { Authorization: `Bearer ${CLOVER_API_KEY}` },
    });
    const catData = await catRes.json();
    const catIdToName = {};
    catData.elements.forEach(cat => { catIdToName[cat.id] = cat.name; });

    // Fetch items
    const itemRes = await fetch(`${CLOVER_API_BASE}/items?expand=categories&limit=1000`, {
      headers: { Authorization: `Bearer ${CLOVER_API_KEY}` },
    });
    const itemData = await itemRes.json();
    const items = (itemData.elements || []).filter(item => {
      // Exclude items in excluded categories
      const itemCats = (item.categories || []).map(cat => catIdToName[cat.id]);
      return !itemCats.some(cat => EXCLUDED_CATEGORIES.includes(cat));
    }).filter(item => {
      // Only include in-stock items
      return item.available === true || item.stockCount > 0;
    }).map(item => {
      // Map to site section
      const itemCats = (item.categories || []).map(cat => catIdToName[cat.id]);
      let section = null;
      for (const cat of itemCats) {
        if (CATEGORY_MAP[cat]) {
          section = CATEGORY_MAP[cat];
          break;
        }
      }
      return { ...item, section };
    });

    // Group by section
    const grouped = {};
    for (const item of items) {
      if (!item.section) continue;
      if (!grouped[item.section]) grouped[item.section] = [];
      grouped[item.section].push(item);
    }

    cachedData = grouped;
    cacheTimestamp = Date.now();
    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 