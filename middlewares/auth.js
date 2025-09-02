const User = require('../models/User');

module.exports.isAuthenticated = (req, res, next) => {
    if (!req.session || !req.session.user) {
        console.log('User is not logged in');
        return res.status(401).redirect("/login"); // Redirect to login page if not authenticated
    }
    req.user = req.session.user; // Attach user data to request object
    next();
};
;

module.exports.isAdmin = (req, res, next) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        console.log('Access denied. User is not admin:', req.session.user);
        return res.status(403).send('You must be logged in as admin to access this page.');
    }
    next();
};