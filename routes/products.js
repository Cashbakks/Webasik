const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
// Add product (accessible only by admins)
router.post('/add', isAdmin, async (req, res) => {
    try {
        const { name, price, description, imageUrl, sizes, model, company, color, category } = req.body;
        const newProduct = new Product({ 
            name, 
            price, 
            description, 
            imageUrl, 
            sizes: sizes.split(',').map(size => Number(size.trim())), // Assuming sizes are sent as comma-separated values
            model,
            company, 
            color, 
            category 
        });
        await newProduct.save();
        res.redirect('/');
    } catch (error) {
        console.error('Error adding product:', error);
        res.sendStatus(500);
    }
});

// Delete product (accessible only by admins)
router.get('/delete/:id', isAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (error) {
        console.error('Error deleting product:', error);
        res.sendStatus(500);
    }
});


router.get('/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404).send('Product not found');
        } else {
            res.render('pages/product-detail', { title: product.name, product });
        }
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).send('Error processing your request');
    }
});


module.exports = router;

