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
module.exports = router;
