// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controllers/authController");
// Example controller

router.post("/signup", register);
router.post("/login", login);
// router.post("/logout", logout);

module.exports = router; // ✅ MUST export the router
