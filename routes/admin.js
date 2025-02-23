const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const bcrypt = require('bcryptjs');
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

router.post('/add-product', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { name, price, description, imageUrl, type, sizes, model, company, color, category } = req.body;
        console.log("Authenticated User:", req.session.user);

        const newProduct = new Product({
            name,
            price,
            description,
            imageUrl,
            type,
            sizes: sizes.split(',').map(size => parseInt(size.trim())),
            model,
            company,
            color,
            category,
            createdBy: req.session.user._id, // Store the admin's ID
        });

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

router.post('/add-user', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { name, surname, email, username, password, isAdmin } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('User already exists.');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name,
            surname,
            email,
            username,
            password: hashedPassword,
            isAdmin: isAdmin === 'true', // Convert string "true" to boolean true
        });

        await newUser.save();

        console.log(`New user created: ${username}`);
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).send('Error processing request.');
    }
});

module.exports = router;
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
router.get('/edit-user/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('pages/edit-user', { user });
    } catch (error) {
        console.error('Error rendering edit user page:', error);
        res.status(500).send('Error processing your request');
    }
});


// Route to update user details, including username & password
router.post('/edit-user/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { name, surname, email, username, password, isAdmin } = req.body;

        // Find the user and update details
        const user = await User.findByIdAndUpdate(req.params.id, {
            name,
            surname,
            email,
            username,
            isAdmin: isAdmin === 'true',
            updatedAt: new Date() // Update timestamp manually
        }, { new: true });

        if (password) {
            user.password = await bcrypt.hash(password, 10);
            await user.save();
        }

        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Error updating user');
    }
});
router.get('/analytics', async (req, res) => {
    try {
        const users = await User.find({}, 'username basket conversions');
        const products = await Product.find({}, 'name');

        let shoePopularity = {};
        let highestTotalUser = null;
        let lowestTotalUser = null;
        let mostConversionsUser = null;
        let leastConversionsUser = null;

        let maxTotalPrice = -Infinity;
        let minTotalPrice = Infinity;
        let maxConversions = -Infinity;
        let minConversions = Infinity;

        users.forEach(user => {
            // Find Highest & Lowest Total Price Users
            if (user.basket && user.basket.totalPrice > maxTotalPrice) {
                maxTotalPrice = user.basket.totalPrice;
                highestTotalUser = user;
            }
            if (user.basket && user.basket.totalPrice < minTotalPrice) {
                minTotalPrice = user.basket.totalPrice;
                lowestTotalUser = user;
            }

            // Count Purchases for Popular Shoes
            user.basket.items.forEach(item => {
                const product = products.find(p => p._id.equals(item.productId));
                const productName = product ? product.name : "Unknown Product";
                shoePopularity[productName] = (shoePopularity[productName] || 0) + item.quantity;
            });

            // Find Users with Most & Least Conversions
            const userConversions = user.conversions?.length || 0;
            if (userConversions > maxConversions) {
                maxConversions = userConversions;
                mostConversionsUser = user;
            }
            if (userConversions < minConversions) {
                minConversions = userConversions;
                leastConversionsUser = user;
            }
        });

        // Sort Shoes by Popularity (Top 5)
        const sortedShoePopularity = Object.entries(shoePopularity)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        res.render('pages/analytics', {
            userData: users,
            sortedShoePopularity,
            highestTotalUser,
            lowestTotalUser,
            mostConversionsUser,
            leastConversionsUser
        });
    } catch (error) {
        console.error('Error fetching analytics data:', error);
        res.status(500).send('Error fetching analytics data');
    }
});

router.get("/products", async (req, res) => {
    try {
        const products = await Product.find().populate('createdBy', 'username'); // Populate with the user's username
        res.render("pages/products", { products });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Error fetching products.");
    }
});
module.exports = router;
