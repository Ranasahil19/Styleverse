const express = require('express');
const {addCategory, deleteCategory, getCategories} = require('../../controllers/category/categoryController');

const router = express.Router();

// Add a New Category
router.post('/api/categories', addCategory);

// Delete a Category
router.delete('/api/categories/:id', deleteCategory);

// Get All Categories
 router.get('/api/category', getCategories);

module.exports = router;