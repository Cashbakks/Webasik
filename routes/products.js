const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
// Add product (accessible only by admins)
router.post("/add-product", isAuthenticated, async (req, res) => {
    try {
        const { name, price, description, imageUrl,imageUrl1,imageUrl2, type, sizes, model, company, color, category } = req.body;

        const newProduct = new Product({
            name,
            price,
            description,
            imageUrl,
            imageUrl1,
            imageUrl2,
            type,
            sizes: sizes.split(',').map(size => Number(size.trim())), 
            model,
            company,
            color,
            category,
            createdBy: req.session.user._id // Assign the logged-in user as the creator
        });

        await newProduct.save();
        res.redirect("/admin/dashboard"); // Redirect to dashboard or another page
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).send("Error creating product.");
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

