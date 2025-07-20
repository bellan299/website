const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

class Importer {
  constructor() {
    this.apiKey = process.env.CLOVER_API_KEY;
    this.merchantId = process.env.CLOVER_MERCHANT_ID;
    this.locationId = process.env.CLOVER_LOCATION_ID;
    this.baseURL = 'https://api.clover.com';
    
    if (!this.apiKey || !this.merchantId) {
      throw new Error('CLOVER_API_KEY and CLOVER_MERCHANT_ID are required');
    }
  }

  async import() {
    try {
      console.log('🔄 Starting inventory import from Clover...');
      
      // Fetch all items
      const items = await this.fetchAllItems();
      console.log(`📦 Found ${items.length} items`);
      
      // Fetch categories
      const categories = await this.fetchCategories();
      console.log(`📂 Found ${categories.length} categories`);
      
      // Create summary
      const summary = this.createSummary(items, categories);
      
      // Save data
      await this.saveData(items, categories, summary);
      
      console.log('✅ Inventory import completed successfully!');
      return items;
    } catch (error) {
      console.error('❌ Import failed:', error.message);
      throw error;
    }
  }

  async fetchAllItems() {
    const items = [];
    let offset = 0;
    const limit = 100;
    
    while (true) {
      const params = new URLSearchParams({
        limit,
        offset,
        expand: 'categories,tags'
      });

      if (this.locationId) {
        params.append('locationId', this.locationId);
      }

      const response = await axios.get(
        `${this.baseURL}/v3/merchants/${this.merchantId}/items?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const batch = response.data.elements || [];
      items.push(...batch);
      
      if (batch.length < limit) break;
      offset += limit;
    }
    
    return this.formatItems(items);
  }

  async fetchCategories() {
    const response = await axios.get(
      `${this.baseURL}/v3/merchants/${this.merchantId}/categories`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.elements || [];
  }

  formatItems(items) {
    return items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price || 0,
      priceType: item.priceType,
      defaultTaxRates: item.defaultTaxRates,
      unitName: item.unitName,
      cost: item.cost,
      isRevenue: item.isRevenue,
      stockCount: item.stockCount,
      modifiedTime: item.modifiedTime,
      categories: item.categories?.elements || [],
      tags: item.tags?.elements || [],
      modifications: item.modifications?.elements || [],
      imageUrl: item.imageUrl,
      available: item.available !== false
    }));
  }

  createSummary(items, categories) {
    const categoryCounts = {};
    const tagCounts = {};
    let totalValue = 0;
    let availableItems = 0;

    items.forEach(item => {
      // Category counts
      item.categories.forEach(cat => {
        categoryCounts[cat.name] = (categoryCounts[cat.name] || 0) + 1;
      });

      // Tag counts
      item.tags.forEach(tag => {
        tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
      });

      // Value and availability
      if (item.available) {
        availableItems++;
        totalValue += (item.price || 0) * (item.stockCount || 0);
      }
    });

    return {
      totalItems: items.length,
      availableItems,
      totalCategories: categories.length,
      totalValue: Math.round(totalValue * 100) / 100,
      categoryCounts,
      tagCounts,
      lastUpdated: new Date().toISOString()
    };
  }

  async saveData(items, categories, summary) {
    const dataDir = path.join(__dirname, '..', 'data');
    
    // Ensure data directory exists
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }

    // Save inventory
    await fs.writeFile(
      path.join(dataDir, 'inventory.json'),
      JSON.stringify(items, null, 2)
    );

    // Save categories
    await fs.writeFile(
      path.join(dataDir, 'categories.json'),
      JSON.stringify(categories, null, 2)
    );

    // Save summary
    await fs.writeFile(
      path.join(dataDir, 'summary.json'),
      JSON.stringify(summary, null, 2)
    );

    console.log('💾 Data saved to server/data/');
  }
}

module.exports = Importer;

// Run the import if this file is executed directly
if (require.main === module) {
  const importer = new Importer();
  importer.import()
    .then(() => {
      console.log('🎉 Import completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Import failed:', error.message);
      process.exit(1);
    });
} 