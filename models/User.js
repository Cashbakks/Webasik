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
    conversions: { type: Array, default: [] } // Store user currency conversions
}, { timestamps: true }); // ✅ Auto-add createdAt & updatedAt timestamps





userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};

const User = mongoose.model('User', userSchema);
module.exports = User;
