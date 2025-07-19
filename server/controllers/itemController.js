// [STUBBED FOR PUBLIC DEPLOYMENT]
// All Clover API logic is disabled. Restore this logic when enabling API functionality.
const cloverClient = require('../utils/cloverClient');

/**
 * Get all items with optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllItems = async (req, res) => {
  try {
    const { limit = 50, offset = 0, category, price_min, price_max } = req.query;
    
    const items = await cloverClient.getItems({
      limit: parseInt(limit),
      offset: parseInt(offset),
      category,
      price_min: price_min ? parseFloat(price_min) : undefined,
      price_max: price_max ? parseFloat(price_max) : undefined
    });

    res.json({
      success: true,
      data: items,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: items.length
      }
    });
  } catch (error) {
    console.error('Error fetching all items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch items',
      message: error.message
    });
  }
};

/**
 * Get items by category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const items = await cloverClient.getItemsByCategory(category, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: items,
      category,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: items.length
      }
    });
  } catch (error) {
    console.error(`Error fetching items for category ${req.params.category}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch items by category',
      message: error.message
    });
  }
};

/**
 * Search items by name or description
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const searchItems = async (req, res) => {
  try {
    const { q, limit = 50, offset = 0 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query parameter "q" is required'
      });
    }

    const items = await cloverClient.searchItems(q, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: items,
      query: q,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: items.length
      }
    });
  } catch (error) {
    console.error('Error searching items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search items',
      message: error.message
    });
  }
};

/**
 * Get single item by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await cloverClient.getItemById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error(`Error fetching item ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch item',
      message: error.message
    });
  }
};

/**
 * Get all available categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCategories = async (req, res) => {
  try {
    const categories = await cloverClient.getCategories();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      message: error.message
    });
  }
};

module.exports = {
  getAllItems,
  getItemsByCategory,
  searchItems,
  getItemById,
  getCategories
}; 