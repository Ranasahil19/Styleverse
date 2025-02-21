// /routes/productRoutes.js

const express = require('express');
const { insertProducts, getAllProduct, getAllProducts, fetchProductById, getFilters, addProduct, updateProductById, deleteProductById } = require('../../controllers/product/productController');
const { getBadges} = require('../../controllers/product/badgeController')
const { uploadSingle } = require("../../Middleware/multerMiddleware");
const router = express.Router();

router.post("/api/products", uploadSingle ,addProduct);

// Update a product by its ID
router.put("/api/products/:id",uploadSingle , updateProductById);

// Delete a product by its ID

router.delete("/api/products/:id", deleteProductById);

// POST route to insert products
router.post('/api/insert', insertProducts);

// GET route to fetch all products
router.get('/api/products/:category', getAllProduct);

router.get('/api/products', getAllProducts);

router.get('/products/:id', fetchProductById);

router.get('/api/badge', getBadges);

router.get('/api/filters', getFilters);
module.exports = router;
