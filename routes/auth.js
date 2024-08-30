// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const router = express.Router();

// Register route
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({ name, email, password, role });

    await user.save();

    res
      .status(201)
      .json({ msg: "User registered, pending approval from admin" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    if (user.status === "pending") {
      return res.status(403).json({ msg: "Account not approved by admin" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const payload = { userId: user._id, role: user.role };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Approve user by admin
router.put(
  "/approve/:id",
  [authMiddleware, adminMiddleware],
  async (req, res) => {
    try {
      let user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      user.status = "approved";
      await user.save();

      res.json({ msg: "User approved successfully" });
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// Fetch all users (Admin only)
router.get("/users", [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
