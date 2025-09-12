const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Access denied, no token provided",
    });
  }

  const tokenKey = process.env.TOKEN_KEY;
  jwt.verify(token, tokenKey, (err) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid or expired token",
      });
    }

    next();
  });
}

module.exports = authenticateToken;
