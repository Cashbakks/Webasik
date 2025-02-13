const express = require("express");
const router = express.Router();
const axios = require("axios");
const FormData = require("form-data");
const GeneratedShoe = require("../models/Shoe");
const { isAuthenticated } = require("../middlewares/auth");

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const IMGBB_API_KEY = "0d2667a69910c43da78cc15b75422cbe"; // Your ImgBB API Key
const STABILITY_API_URL = "https://api.stability.ai/v2beta/stable-image/generate/core";
const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

// Function to Upload Base64 to ImgBB
const uploadBase64ToImgBB = async (base64Image) => {
    try {
        const response = await axios.post(IMGBB_UPLOAD_URL, null, {
            params: {
                key: IMGBB_API_KEY,
                image: base64Image, // Upload the Base64 image
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        return response.data.data.url; // Return the direct image URL
    } catch (error) {
        console.error("❌ ImgBB Upload Error:", error.response ? error.response.data : error.message);
        return null;
    }
};

// Route to generate a shoe image
router.post("/shoe", isAuthenticated, async (req, res) => {
    try {
        const { description } = req.body;
        const userId = req.session.user._id; // Ensure user is logged in

        console.log("🚀 Generating shoe for:", userId, "with description:", description);

        // Create FormData for Stability AI request
        const formData = new FormData();
        formData.append("prompt", `a shoe model, ${description}`);
        formData.append("model", "stable-diffusion-xl-1024-v1-0");
        formData.append("width", "1024");
        formData.append("height", "1024");
        formData.append("output_format", "png");
        formData.append("style_preset", "anime"); // Using anime style preset

        // Call Stability AI API
        const response = await axios.post(STABILITY_API_URL, formData, {
            headers: {
                Authorization: `Bearer ${STABILITY_API_KEY}`,
                ...formData.getHeaders(),
            },
        });

        // Validate API Response
        if (!response.data || (!response.data.image && !response.data.image_base64)) {
            console.error("❌ Error: No image data returned from AI API");
            return res.status(500).json({ success: false, message: "No image data returned from AI API" });
        }

        let imageUrl;

        // If Stability AI returns a direct image URL
        if (response.data.image) {
            imageUrl = uploadBase64ToImgBB(response.data.image);
        } 
        // If Stability AI returns Base64 data
        else if (response.data.image_base64) {
            console.log("🔄 Converting Base64 to Image URL...");
            imageUrl = await uploadBase64ToImgBB(response.data.image_base64); // Upload Base64 to ImgBB

            if (!imageUrl) {
                console.error("❌ ImgBB Conversion Failed");
                return res.status(500).json({ success: false, message: "Failed to convert Base64 to image URL." });
            }
        }

        // Save generated shoe to MongoDB
        const newGeneratedShoe = new GeneratedShoe({
            description,
            imageUrl,
            userId,
        });

        await newGeneratedShoe.save();

        console.log("✅ Shoe generated successfully:", imageUrl);
        res.redirect("/generate/user-shoes");

    } catch (error) {
        console.error("❌ Error generating shoe image:", error.response ? error.response.data : error.message);
        res.status(500).json({ 
            success: false, 
            message: "Failed to generate shoe image.",
            error: error.response ? error.response.data : error.message,
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
