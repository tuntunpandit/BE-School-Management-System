// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  // Extract token from the Bearer token format
  console.log("authHeader", authHeader);
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    next();
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = { authMiddleware, adminMiddleware };
