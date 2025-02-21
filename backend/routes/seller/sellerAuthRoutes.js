const express = require("express");
const {
    register,
    login,
    refreshAccessToken,
    protected,
    logout,
    updateProfile,
    getAllSeller
} = require("../../controllers/seller/sellerAuthController");
const { sellerAuthMiddleware } = require("../../Middleware/authMiddleware");
const { uploadSingle } = require("../../Middleware/multerMiddleware");
const router = express.Router();


router.post("/seller-register", register);
router.post("/seller-login", login);
router.post("/seller-refreshtoken" , refreshAccessToken);
router.post("/seller-logout" , sellerAuthMiddleware ,logout);
router.get("/seller-protected", sellerAuthMiddleware , protected);
router.put("/update-profile" , sellerAuthMiddleware , uploadSingle , updateProfile);
router.get("/admin/seller" , getAllSeller);

module.exports = router;