const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuthenticated } = require('../middlewares/auth');
// Render the registration page
router.get('/register', (req, res) => {
    res.render('pages/register', {
        title: 'Register', // Pass the title for the page
    });
});

// Handle registration form submission
router.post('/register', async (req, res) => {
    try {
        const { username, password, adminCode } = req.body;

        console.log('Registering user:', username);

        // Hash the password
        // const hashedPassword = await bcrypt.hash(password, 10);

        // Check if the admin code matches
        const isAdmin = adminCode === process.env.ADMIN_CODE;

        // Save the new user to the database
        const newUser = new User({ username, password: password, isAdmin });
        await newUser.save();

        console.log('User successfully registered:', newUser);
        res.redirect('/users/login');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('An error occurred during registration.');
    }
});

router.get('/login', (req, res) => {
    res.render('pages/login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log('Login attempt for:', username);

        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found:', username);
            return res.status(400).send('Invalid username or password');
        }

        // Save user data in the session
        req.session.user = { _id: user._id, username: user.username, isAdmin: user.isAdmin };
        console.log('User logged in successfully:', req.session.user);

        res.redirect('/');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal server error');
    }
});




// Logout Route
router.get('/logout', (req, res) => {
    // Destroy the session and redirect to the homepage
    req.session.destroy(() => {
        res.redirect('/');
    });
});


router.get('/profile', isAuthenticated, (req, res) => {
    res.render('pages/profile', { user: req.session.user });
});
router.post('/profile', isAuthenticated, async (req, res) => {
    try {
        const { username, password } = req.body;
        const userId = req.session.user._id;

        const updateData = {};
        if (username) updateData.username = username;
        if (password) updateData.password = password; // No hashing for simplicity

        // Update the user in the database
        await User.findByIdAndUpdate(userId, updateData);

        // Update session data
        if (username) req.session.user.username = username;

        res.redirect('/users/profile');
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send('Internal server error');
    }
});
module.exports = router;
