const express = require("express");
const router = express.Router();
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const GeneratedShoe = require("../models/Shoe");
const { isAuthenticated } = require('../middlewares/auth');

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const STABILITY_API_URL = "https://api.stability.ai/v2beta/stable-image/generate/core";

// Route to generate a shoe image
router.post("/shoe", isAuthenticated, async (req, res) => {
    try {
        const { description } = req.body;
        const userId = req.session.user._id; // Ensure user is logged in

        console.log("Generating shoe for:", userId, "with description:", description);

        // Create a FormData object
        const formData = new FormData();
        formData.append("prompt", `A futuristic sneaker, anime-style, colorful, stylish. ${description}`);
        formData.append("model", "stable-diffusion-xl-1024-v1-0");
        formData.append("width", "1024");
        formData.append("height", "1024");
        formData.append("output_format", "png");
        formData.append("style_preset", "anime"); // Using anime style preset

        // Call Stability AI API
        const response = await axios.post(
            STABILITY_API_URL,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${STABILITY_API_KEY}`,
                    ...formData.getHeaders()
                }
            }
        );

        // Validate API Response
        if (!response.data || (!response.data.image && !response.data.image_base64)) {
            console.error("Error: No image data returned from AI API");
            return res.status(500).json({ success: false, message: "No image data returned from AI API" });
        }

        let imageUrl;

        // If the response contains a direct image URL
        if (response.data.image) {
            imageUrl = response.data.image;
        } 
        // If the response contains base64 image data

        // Save to MongoDB
        const newGeneratedShoe = new GeneratedShoe({
            description,
            imageUrl,
            userId
        });

        await newGeneratedShoe.save();

        console.log("✅ Shoe generated successfully:", imageUrl);

       res.redirect("/generate/user-shoes");

    } catch (error) {
        console.error("❌ Error generating shoe image:", error.response ? error.response.data : error.message);
        res.status(500).json({ 
            success: false, 
            message: "Failed to generate shoe image.",
            error: error.response ? error.response.data : error.message
        });
    }
});

// Route to get all generated shoes for a user
router.get("/user-shoes", isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user._id;
        const generatedShoes = await GeneratedShoe.find({ userId });

        res.render("pages/generated-shoes", { shoes: generatedShoes });
    } catch (error) {
        console.error("❌ Error fetching generated shoes:", error);
        res.status(500).send("Error retrieving generated shoes.");
    }
});

module.exports = router;
