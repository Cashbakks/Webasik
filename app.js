// Module imports
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const expressLayouts = require('express-ejs-layouts');




// Add quiz routes


// Use quiz routes

// Route handlers
const mainRoutes = require('./routes/index');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const basketRoutes = require('./routes/basket');
const generateShoeRoutes = require("./routes/generate-shoe"); // Import the rou
const quizRoutes = require('./routes/quiz');  // Import quiz routes
// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));
// Session configuration
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: 'sessions',
});

app.use(
  session({
    secret: 'secret key', // Replace with your secure secret key
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// Middleware to make `user` available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null; // Pass the user if logged in, otherwise null
  next();
});

// Middleware configurations
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Setting EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', mainRoutes); // handles '/'
app.use('/users', userRoutes); // handles '/users/*'
app.use('/products', productRoutes); // handles '/products/*'
app.use('/admin', adminRoutes); // handles '/admin/*'
app.use('/basket', basketRoutes); // handles '/basket/*'
app.use("/generate", generateShoeRoutes);
// Redirect from /login to /users/login (adjust as necessary)
app.get('/login', (req, res) => res.redirect('/users/login'));
app.use("/quiz", quizRoutes);
// Error handling for undefined routes
// app.use((req, res) => {
//   res.status(404).send('Sorry, that route doesn\'t exist.');
// });

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
app.use(expressLayouts);
app.set('layout', '/views/partials/layout'); // Set the default layout

app.get('/register', (req, res) => {
    res.redirect('/users/register'); // Redirect /register to /users/register
});


