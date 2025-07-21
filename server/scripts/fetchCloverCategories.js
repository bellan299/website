// fetchCloverCategories.js
// Usage: node server/scripts/fetchCloverCategories.js
// Fetches and prints all Clover categories for mapping

const fetch = require('node-fetch');

const CLOVER_API_KEY = process.env.CLOVER_API_KEY;
const CLOVER_MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;

if (!CLOVER_API_KEY || !CLOVER_MERCHANT_ID) {
  console.error('Missing CLOVER_API_KEY or CLOVER_MERCHANT_ID in environment variables.');
  process.exit(1);
}

const CLOVER_API_BASE = `https://api.clover.com/v3/merchants/${CLOVER_MERCHANT_ID}`;

async function fetchCategories() {
  const url = `${CLOVER_API_BASE}/categories?limit=1000`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${CLOVER_API_KEY}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    console.error('Failed to fetch categories:', res.status, await res.text());
    process.exit(1);
  }
  const data = await res.json();
  if (!data.elements) {
    console.error('No categories found.');
    process.exit(1);
  }
  console.log('Clover Categories:');
  data.elements.forEach(cat => {
    console.log(`- ID: ${cat.id}, Name: ${cat.name}`);
  });
}

fetchCategories(); 