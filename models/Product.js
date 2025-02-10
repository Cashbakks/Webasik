const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    imageUrl: String,
    type: { type: String, required: true }, // Add type field
    sizes: [Number], // Assuming sizes is an array of available shoe sizes
    model: String,
    company: String,
    color: String,
    category: { type: String, enum: ['Men', 'Women', 'Unisex'] }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
