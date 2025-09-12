const express = require("express");
const router = express.Router();

const authenticateToken = require("../middlewares/authMiddleware");

router.get("/dashboard", authenticateToken, (req, res) => {
  res.status(200).json({
    message: "Access granted!",
  });
});

router.get("/transactions", authenticateToken, (req, res) => {
  res.status(200).json({
    message: "Access granted!",
  });
});

router.get("/settings", authenticateToken, (req, res) => {
  res.status(200).json({
    message: "Access granted!",
  });
});

module.exports = router;
