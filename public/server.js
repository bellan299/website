const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Clover API Configuration
// [STUBBED FOR PUBLIC DEPLOYMENT]
// All Clover API logic is disabled. Restore this logic when enabling API functionality.
// Remove or comment out any code that would use CLOVER_CONFIG or expose API keys.
const CLOVER_CONFIG = {
    BASE_URL: 'https://api.clover.com',
    MERCHANT_ID: process.env.CLOVER_MERCHANT_ID || null,
    API_KEY: process.env.CLOVER_API_KEY
};

// Helper function to make authenticated Clover API requests
async function makeCloverRequest(endpoint, params = {}) {
    try {
        const url = `${CLOVER_CONFIG.BASE_URL}${endpoint}`;
        const requestParams = { ...params };
        
        // Only add merchant_id if it exists
        if (CLOVER_CONFIG.MERCHANT_ID) {
            requestParams.merchant_id = CLOVER_CONFIG.MERCHANT_ID;
        }
        
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${CLOVER_CONFIG.API_KEY}`,
                'Content-Type': 'application/json'
            },
            params: requestParams
        });
        return response.data;
    } catch (error) {
        console.error('Clover API Error:', error.response?.data || error.message);
        throw error;
    }
}

// API Routes

// Get all products from Clover
app.get('/api/products', async (req, res) => {
    // If Clover API key or Merchant ID is missing, return empty list and log a warning
    if (!CLOVER_CONFIG.API_KEY || !CLOVER_CONFIG.MERCHANT_ID) {
        console.warn('Clover API Key or Merchant ID missing. Returning empty product list.');
        return res.json({
            success: true,
            products: [],
            categories: ['wine', 'spirits', 'beer', 'seltzer', 'thc']
        });
    }
    try {
        console.log('Fetching products from Clover...');
        
        // Get items (products) - try without merchant_id first
        let itemsResponse, categoriesResponse;
        
        try {
            itemsResponse = await makeCloverRequest('/v3/merchants/items', {
                expand: 'categories,tags,modifications'
            });
            categoriesResponse = await makeCloverRequest('/v3/merchants/categories');
        } catch (error) {
            // If that fails, try with merchant_id if available
            if (CLOVER_CONFIG.MERCHANT_ID) {
                itemsResponse = await makeCloverRequest(`/v3/merchants/${CLOVER_CONFIG.MERCHANT_ID}/items`, {
                    expand: 'categories,tags,modifications'
                });
                categoriesResponse = await makeCloverRequest(`/v3/merchants/${CLOVER_CONFIG.MERCHANT_ID}/categories`);
            } else {
                throw error;
            }
        }
        
        // Process and format the data
        const products = itemsResponse.elements || [];
        const categories = categoriesResponse.elements || [];
        
        // Create a map of category IDs to names
        const categoryMap = {};
        categories.forEach(category => {
            categoryMap[category.id] = category.name;
        });
        
        // Format products for frontend
        const formattedProducts = products
            .filter(item => item.available) // Only show available items
            .map(item => {
                // Determine category based on item tags or categories
                let category = 'other';
                if (item.categories && item.categories.elements && item.categories.elements.length > 0) {
                    const categoryId = item.categories.elements[0].id;
                    category = categoryMap[categoryId]?.toLowerCase() || 'other';
                }
                
                // Map Clover categories to our categories
                const categoryMapping = {
                    'wine': ['wine', 'red wine', 'white wine', 'rosé', 'sparkling'],
                    'spirits': ['spirits', 'whiskey', 'vodka', 'rum', 'gin', 'tequila', 'bourbon', 'scotch'],
                    'beer': ['beer', 'ale', 'lager', 'craft beer'],
                    'seltzer': ['seltzer', 'hard seltzer', 'spritzer'],
                    'thc': ['thc', 'cannabis', 'marijuana']
                };
                
                // Find matching category
                for (const [ourCategory, keywords] of Object.entries(categoryMapping)) {
                    if (keywords.some(keyword => category.includes(keyword))) {
                        category = ourCategory;
                        break;
                    }
                }
                
                return {
                    id: item.id,
                    name: item.name,
                    price: item.price / 100, // Clover prices are in cents
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
                    stockQuantity: item.stockCount || 0,
                    sku: item.sku || '',
                    available: item.available
                };
            });
        
        console.log(`Successfully fetched ${formattedProducts.length} products`);
        res.json({
            success: true,
            products: formattedProducts,
            categories: Object.keys(categoryMapping)
        });
        
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch products from Clover',
            details: error.message
        });
    }
});

// Get products by category
app.get('/api/products/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const response = await axios.get(`http://localhost:${PORT}/api/products`);
        const products = response.data.products.filter(p => p.category === category);
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get best sellers
app.get('/api/products/bestsellers', async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:${PORT}/api/products`);
        const bestSellers = response.data.products.filter(p => p.isBestSeller);
        res.json({ success: true, products: bestSellers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get new arrivals
app.get('/api/products/newarrivals', async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:${PORT}/api/products`);
        const newArrivals = response.data.products.filter(p => p.isNewArrival);
        res.json({ success: true, products: newArrivals });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        cloverConfigured: !!(CLOVER_CONFIG.MERCHANT_ID && CLOVER_CONFIG.API_KEY)
    });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Jp\'s Liquor.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
    console.log(`🔑 Clover Merchant ID: ${CLOVER_CONFIG.MERCHANT_ID ? 'Configured' : 'Missing'}`);
    console.log(`🔑 Clover API Key: ${CLOVER_CONFIG.API_KEY ? 'Configured' : 'Missing'}`);
});

module.exports = app; 