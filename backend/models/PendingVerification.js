const mongoose = require("mongoose");

const PendingVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  password: { type: String, required: true }, // Hashed password
  verificationCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // Auto-delete after 10 minutes
});

module.exports = mongoose.model("PendingVerification", PendingVerificationSchema, "PendingRegister");
