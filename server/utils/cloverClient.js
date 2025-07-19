const axios = require('axios');

// [STUBBED FOR PUBLIC DEPLOYMENT]
// All Clover API logic is disabled. Restore this logic when enabling API functionality.
class CloverClient {
  constructor() {
    // Stubbed: Do not check for env vars or assign real keys
    this.apiKey = null;
    this.merchantId = null;
    this.locationId = null;
  }

  /**
   * Get all items with optional filtering
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Array of items
   */
  async getItems(options = {}) {
    // Return empty array or mock data
    return [];
  }

  /**
   * Get items by category
   * @param {string} category - Category name or ID
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Array of items
   */
  async getItemsByCategory(category, options = {}) {
    // Return empty array or mock data
    return [];
  }

  /**
   * Search items by name or description
   * @param {string} query - Search query
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Array of items
   */
  async searchItems(query, options = {}) {
    // Return empty array or mock data
    return [];
  }

  /**
   * Get single item by ID
   * @param {string} id - Item ID
   * @returns {Promise<Object>} Item object
   */
  async getItemById(id) {
    // Return null or mock data
    return null;
  }

  /**
   * Get all categories
   * @returns {Promise<Array>} Array of categories
   */
  async getCategories() {
    // Return empty array or mock data
    return [];
  }

  /**
   * Format a single item for consistent response
   * @param {Object} item - Raw item from Clover API
   * @returns {Object} Formatted item
   */
  formatItem(item) {
    if (!item) return null;

    return {
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
    };
  }

  /**
   * Format multiple items for consistent response
   * @param {Array} items - Array of raw items from Clover API
   * @returns {Array} Array of formatted items
   */
  formatItems(items) {
    return items.map(item => this.formatItem(item)).filter(Boolean);
  }
}

module.exports = new CloverClient(); 