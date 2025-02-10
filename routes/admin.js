const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const User = require('../models/User');
const Product = require('../models/Product');

// Admin Dashboard
router.get('/dashboard', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const users = await User.find({});
        const products = await Product.find({});
        res.render('pages/admin', { title: 'Admin Dashboard', users, products });
    } catch (error) {
        console.error('Error accessing admin dashboard:', error);
        res.sendStatus(500);
    }
});

// Add a new product
router.post('/add-product', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { name, price, description, imageUrl } = req.body;
        const newProduct = new Product({ name, price, description, imageUrl });
        await newProduct.save();
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).send('Error processing your request');
    }
});

// Delete a product
router.post('/delete-product/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send('Error processing your request');
    }
});

// Edit a product (Render Edit Page)
router.get('/edit-product/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.render('pages/edit-product', { title: 'Edit Product', product });
    } catch (error) {
        console.error('Error rendering edit product page:', error);
        res.status(500).send('Error processing your request');
    }
});

// Update product
router.post('/edit-product/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { name, price, description, imageUrl, type, sizes, model, company, color, category } = req.body;

        // Parsing sizes to convert from comma-separated string to array of numbers if needed
        const sizesArray = sizes.split(',').map(size => parseInt(size.trim()));

        await Product.findByIdAndUpdate(req.params.id, {
            name,
            price,
            description,
            imageUrl,
            type,
            sizes: sizesArray, // Make sure sizes are stored as an array of numbers
            model,
            company,
            color,
            category
        });

        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Error processing your request');
    }
});


// Delete a user
router.post('/delete-user/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Error processing your request');
    }
});
router.post('/promote-user', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { userId } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Promote the user to admin
        user.isAdmin = true;
        await user.save();

        res.send(`${user.username} has been promoted to admin.`);
    } catch (error) {
        console.error('Error promoting user to admin:', error);
        res.status(500).send('Internal server error');
    }
});
router.post('/remove-admin/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const userId = req.params.id;

        // Find the user by ID and update the isAdmin field
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check to ensure the current admin cannot remove themselves as admin
        if (req.session.user._id === userId) {
            return res.status(400).send('You cannot remove admin privileges from yourself.');
        }

        user.isAdmin = false;
        await user.save();

        console.log(`Admin privileges removed from user: ${user.username}`);
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error removing admin privileges:', error);
        res.status(500).send('An error occurred while removing admin privileges.');
    }
});
module.exports = router;
