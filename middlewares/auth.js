const User = require('../models/User');

module.exports.isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        console.log('User is not logged in');
        return res.status(401).send('You must be logged in to access this page.');
    }
    next();
};

module.exports.isAdmin = (req, res, next) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        console.log('Access denied. User is not admin:', req.session.user);
        return res.status(403).send('You must be logged in as admin to access this page.');
    }
    next();
};

module.exports.isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).send('You must be logged in to access this page.');
    }
    next();
};
