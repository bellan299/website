const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

/**
 * @route   GET /api/items
 * @desc    Get all items with optional filtering
 * @access  public
 */
router.get('/', itemController.getAllItems);

/**
 * @route   GET /api/items/category/:category
 * @desc    Get items by category
 * @access  public
 */
router.get('/category/:category', itemController.getItemsByCategory);

/**
 * @route   GET /api/items/search
 * @desc    Search items by name or description
 * @access  public
 */
router.get('/search', itemController.searchItems);

/**
 * @route   GET /api/items/:id
 * @desc    Get single item by ID
 * @access  public
 */
router.get('/:id', itemController.getItemById);

/**
 * @route   GET /api/items/categories
 * @desc    Get all available categories
 * @access  public
 */
router.get('/categories', itemController.getCategories);

module.exports = router; 