const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig')

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "products", // Folder name in Cloudinary
        allowed_formats: ["jpg", "png", "webp", "gif"], // Allowed file formats
        transformation: [{ width: 500, height: 500, crop: "limit" }], // Optional resizing
    },
})

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only images (JPG, PNG, WebP, GIF) are allowed"), false);
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});

// Middleware for single file upload
const uploadSingle = upload.single("image");

module.exports = { uploadSingle };
