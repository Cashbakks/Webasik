const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const currencyConversionSchema = new mongoose.Schema({
    baseCurrency: String,
    targetCurrency: String,
    amount: Number,
    convertedAmount: Number,
    conversionRate: Number,
    date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    basket: {
        items: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                quantity: { type: Number, required: true }
            }
        ],
        totalPrice: { type: Number, default: 0 }
    },
    conversions: { type: Array, default: [] }, // Store user currency conversions
    discountPercentage: { type: Number, default: 0 }, // Discount percentage
    discountedTotalPrice: { type: Number, default: 0 } // Total price after discount
}, { timestamps: true }); // ✅ Auto-add createdAt & updatedAt timestamps

// Method to calculate the discounted price based on the user's discount
userSchema.methods.calculateDiscountedPrice = function() {
    const discount = this.discountPercentage / 100; // Convert percentage to decimal
    const totalPrice = this.basket.totalPrice;
    const discountedTotalPrice = totalPrice - (totalPrice * discount);

    this.discountedTotalPrice = discountedTotalPrice;
};

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Compare password method
userSchema.methods.comparePassword = function(candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};

const User = mongoose.model('User', userSchema);
module.exports = User;
