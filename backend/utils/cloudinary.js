const cloudinary = require("../config/cloudinaryConfig");

// Upload Base64 image to Cloudinary
const uploadBase64ToCloudinary = async (base64Image) => {
    try {
        const result = await cloudinary.uploader.upload(base64Image, {
            folder: "products",
            resource_type: "image", // Ensure Cloudinary treats it as an image
        });
        return result; // Returns Cloudinary secure URL
    } catch (error) {
        console.error("Cloudinary Base64 upload error:", error);
        throw new Error("Image upload failed");
    }
};

module.exports = { uploadBase64ToCloudinary };
