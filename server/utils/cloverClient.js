const axios = require('axios');

class CloverClient {
  constructor() {
    this.apiKey = process.env.CLOVER_API_KEY;
    this.merchantId = process.env.CLOVER_MERCHANT_ID;
    this.locationId = process.env.CLOVER_LOCATION_ID;
    this.baseURL = 'https://api.clover.com';
    
    if (!this.apiKey || !this.merchantId) {
      throw new Error('CLOVER_API_KEY and CLOVER_MERCHANT_ID are required');
    }
  }

  /**
   * Get all items with optional filtering
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Array of items
   */
  async getItems(options = {}) {
    try {
      const params = new URLSearchParams({
        limit: options.limit || 1000,
        offset: options.offset || 0
      });

      if (this.locationId) {
        params.append('locationId', this.locationId);
      }

      if (options.expand) {
        params.append('expand', options.expand);
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

      return this.formatItems(response.data.elements || []);
    } catch (error) {
      console.error('Error fetching items from Clover:', error.message);
      throw error;
    }
  }

  /**
   * Get items by category
   * @param {string} category - Category name or ID
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Array of items
   */
  async getItemsByCategory(category, options = {}) {
    try {
      const params = new URLSearchParams({
        limit: options.limit || 1000,
        offset: options.offset || 0,
        expand: 'categories'
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

      const allItems = response.data.elements || [];
      const filteredItems = allItems.filter(item => {
        const categories = item.categories?.elements || [];
        return categories.some(cat => 
          cat.id === category || 
          cat.name?.toLowerCase().includes(category.toLowerCase())
        );
      });

      return this.formatItems(filteredItems);
    } catch (error) {
      console.error('Error fetching items by category from Clover:', error.message);
      throw error;
    }
  }

  /**
   * Search items by name or description
   * @param {string} query - Search query
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Array of items
   */
  async searchItems(query, options = {}) {
    try {
      const params = new URLSearchParams({
        limit: options.limit || 1000,
        offset: options.offset || 0,
        expand: 'categories'
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

      const allItems = response.data.elements || [];
      const searchQuery = query.toLowerCase();
      const filteredItems = allItems.filter(item => 
        item.name?.toLowerCase().includes(searchQuery) ||
        item.description?.toLowerCase().includes(searchQuery)
      );

      return this.formatItems(filteredItems);
    } catch (error) {
      console.error('Error searching items from Clover:', error.message);
      throw error;
    }
  }

  /**
   * Get single item by ID
   * @param {string} id - Item ID
   * @returns {Promise<Object>} Item object
   */
  async getItemById(id) {
    try {
      const params = new URLSearchParams({
        expand: 'categories,tags,modifications'
      });

      const response = await axios.get(
        `${this.baseURL}/v3/merchants/${this.merchantId}/items/${id}?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return this.formatItem(response.data);
    } catch (error) {
      console.error('Error fetching item by ID from Clover:', error.message);
      throw error;
    }
  }

  /**
   * Get all categories
   * @returns {Promise<Array>} Array of categories
   */
  async getCategories() {
    try {
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
    } catch (error) {
      console.error('Error fetching categories from Clover:', error.message);
      throw error;
    }
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