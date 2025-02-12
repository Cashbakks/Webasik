const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    imageUrl: { type: String },
    type: { type: String },
    sizes: { type: [Number], default: [] },
    model: { type: String },
    company: { type: String },
    color: { type: String },
    category: { type: String, enum: ["Men", "Women", "Unisex"], required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin who created this product
}, { timestamps: true }); // Auto-generate createdAt & updatedAt timestamps

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
