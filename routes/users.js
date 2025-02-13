const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { isAuthenticated } = require('../middlewares/auth'); // Import middleware

router.get('/register', (req, res) => {
    res.render('pages/register', { title: 'Register' });
});

router.post('/register', async (req, res) => {
    try {
        const { name, surname, email, username, password, adminCode } = req.body;

        // Ensure all fields are filled
        if (!name || !surname || !email || !username || !password) {
            return res.render('pages/register', { errorMessage: 'All fields are required!' });
        }

        // Check if username or email already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.render('pages/register', { errorMessage: 'Username or email already exists!' });
        }

        const isAdmin = adminCode === process.env.ADMIN_CODE;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the new user
        const newUser = new User({ name, surname, email, username, password: password, isAdmin });
        await newUser.save();

        res.redirect('/users/login');
    } catch (error) {
        console.error('Error during registration:', error);
        res.render('pages/register', { errorMessage: 'An error occurred during registration.' });
    }
});


router.get('/login', (req, res) => {
    res.render('pages/login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log('Login attempt for username:', username);

        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found:', username);
            return res.redirect('/users/login?message=Invalid username or password&type=error');
        }

        console.log('Stored Hashed Password:', user.password);

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password Match:', isMatch);

        if (!isMatch) {
            console.log('Password mismatch for username:', username);
            return res.redirect('/users/login?message=Invalid username or password&type=error');
        }

        // Save session
        req.session.user = { _id: user._id, username: user.username, isAdmin: user.isAdmin };
        console.log('User logged in successfully:', req.session.user);

        res.redirect('/');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal server error');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

router.get('/profile', isAuthenticated, async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/users/login');
    }

    try {
        // Fetch the complete user details from the database
        const user = await User.findById(req.session.user._id);
        if (!user) {
            throw new Error('User not found');
        }
        // Pass the full user object to the profile page
        res.render('pages/profile', { user: user });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).send('Unable to fetch user details');
    }
});


router.post('/profile', isAuthenticated, async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/users/login');
    }

    const userId = req.session.user._id;
    const { name, surname, email, username, password } = req.body;

    try {
        const updateData = { name, surname, email, username, updatedAt: new Date() }; // ✅ Set updatedAt time

        // Hash password if user is updating it
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Update user in database
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

        // Refresh session data
        req.session.user = updatedUser;
        res.redirect('/profile');
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).send('Failed to update profile');
    }
});





module.exports = router;
