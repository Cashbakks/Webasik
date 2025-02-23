const mongoose = require("mongoose");

const generatedShoeSchema = new mongoose.Schema({
    description: { type: String, required: true }, // User input description
    imageUrl: { type: String, required: true }, // AI-generated image URL
    createdAt: { type: Date, default: Date.now }, // Timestamp of creation
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } // Reference to the user
});

const GeneratedShoe = mongoose.model("GeneratedShoe", generatedShoeSchema);
module.exports = GeneratedShoe;
