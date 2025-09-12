const express = require("express");

const {
  login,
  signup,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authControllers");
const authenticateToken = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/change-password", changePassword);

router.post("/reset-password", resetPassword);

module.exports = router;
