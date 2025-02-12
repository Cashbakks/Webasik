const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User'); // Import the User model

// Add an item to the basket
router.post('/add', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/users/login');
    }

    try {
        const { productId, quantity } = req.body;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        const basket = user.basket || { items: [], totalPrice: 0 };

        // Check if the product already exists in the basket
        const existingItem = basket.items.find(item => item.productId.toString() === productId);
        if (existingItem) {
            existingItem.quantity += parseInt(quantity, 10);
        } else {
            basket.items.push({ productId, quantity: parseInt(quantity, 10) });
        }

        // Recalculate total price
        basket.totalPrice = basket.items.reduce(
            (sum, item) => sum + product.price * item.quantity,
            0
        );

        user.basket = basket;
        await user.save();

        res.redirect('/basket');
    } catch (error) {
        console.error('Error adding item to basket:', error);
        res.status(500).send('Error processing your request');
    }
});

// Render the basket page
router.get('/', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/users/login');
    }

    try {
        // Fetch user and populate basket and conversions
        const user = await User.findById(req.session.user._id)
            .populate('basket.items.productId')
            .lean(); // Use .lean() to return a plain JS object (avoids Mongoose issues)

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('pages/basket', {
            user,  // Pass the user object to the template
            basket: user.basket || { items: [], totalPrice: 0 }  // Ensure basket exists
        });

    } catch (error) {
        console.error('Error fetching basket:', error);
        res.status(500).send('Error processing your request');
    }
});


// Remove an item from the basket
router.post('/remove', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('You must be logged in to remove items from the basket');
    }

    try {
        const { productId } = req.body;
        const user = await User.findById(req.session.user._id);

        user.basket.items = user.basket.items.filter(item => item.productId.toString() !== productId);

        // Recalculate total price
        user.basket.totalPrice = user.basket.items.reduce(
            (sum, item) => sum + item.productId.price * item.quantity,
            0
        );

        await user.save();

        res.redirect('/basket');
    } catch (error) {
        console.error('Error removing item from basket:', error);
        res.status(500).send('Error processing your request');
    }
});

// Clear the basket
router.post('/clear', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('You must be logged in to clear the basket');
    }

    try {
        const user = await User.findById(req.session.user._id);

        user.basket = { items: [], totalPrice: 0 };
        await user.save();

        res.redirect('/basket');
    } catch (error) {
        console.error('Error clearing basket:', error);
        res.status(500).send('Error processing your request');
    }
});
// Update item quantity in the basket
router.post('/update', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('You must be logged in to update the basket');
    }

    try {
        const { productId, quantity } = req.body;
        const user = await User.findById(req.session.user._id).populate('basket.items.productId');

        const basket = user.basket;

        // Find the item in the basket and update its quantity
        const item = basket.items.find(item => item.productId._id.toString() === productId);

        if (item) {
            item.quantity = parseInt(quantity, 10);
            if (item.quantity <= 0) {
                // Remove the item if quantity is zero or less
                basket.items = basket.items.filter(item => item.productId._id.toString() !== productId);
            }
        }

        // Recalculate total price
        basket.totalPrice = basket.items.reduce(
            (sum, item) => sum + item.productId.price * item.quantity,
            0
        );

        user.basket = basket;
        await user.save();

        res.redirect('/basket');
    } catch (error) {
        console.error('Error updating basket:', error);
        res.status(500).send('Error processing your request');
    }
});


require('dotenv').config();


// Middleware to parse incoming JSON data
// Fetch basket and pass total price to frontend
const axios = require('axios');
const API_KEY = process.env.EXCHANGE_RATE_API_KEY;
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/pair`;

// Currency conversion route
router.get('/convert-currency', async (req, res) => {
    const { baseCurrency, targetCurrency, amount } = req.query;

    try {
        // Fetch conversion data from API
        const url = `${BASE_URL}/${baseCurrency}/${targetCurrency}/${amount}`;
        const response = await axios.get(url);

        if (response.data.result !== "success") {
            throw new Error(response.data["error-type"]);
        }

        const conversionRate = response.data.conversion_rate;
        const convertedAmount = response.data.conversion_result;

        // Ensure user is logged in
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: "User not logged in" });
        }

        // Find the user in MongoDB and save conversion
        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Save the conversion in MongoDB
        user.conversions.push({
            baseCurrency,
            targetCurrency,
            amount: parseFloat(amount),
            convertedAmount,
            conversionRate,
            date: new Date()
        });

        await user.save();

        res.json({
            success: true,
            conversionRate,
            convertedAmount,
            message: "Conversion saved successfully."
        });

    } catch (error) {
        console.error("Error fetching exchange rate:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve exchange rate." });
    }
});

module.exports = router;

