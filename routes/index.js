const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
require('dotenv').config();
// Home page route
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.render('pages/home', { products });
    } catch (error) {
        console.error('Error accessing the home page:', error);
        res.sendStatus(500);
    }
});
router.get('/', (req, res) => {
    res.render('pages/home', {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
        user: req.session.user || null,
    });
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
router.get('/home/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.render('pages/product', { title: product.name, product });
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).send('Error processing your request');
    }
});

module.exports = router;
