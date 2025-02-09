const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { isAuthenticated } = require('../middlewares/auth');


router.get('/register', (req, res) => {
    res.render('pages/register', { title: 'Register' });
});




router.post('/register', async (req, res) => {
    try {
        const { username, password, adminCode } = req.body;

        console.log('Registering user:', username);

        const isAdmin = adminCode === process.env.ADMIN_CODE;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Generated Hashed Password:', hashedPassword);

        // Save the new user
        const newUser = new User({ username, password: password, isAdmin });
        await newUser.save();

        console.log('Saved User:', newUser);
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




// Logout Route
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

module.exports = router;
