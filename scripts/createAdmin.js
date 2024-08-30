// scripts/createAdmin.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../models/User"); // Adjust the path to your User model

dotenv.config(); // Load environment variables

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

async function createAdmin() {
  const name = "Admin";
  const email = "admin2@gmail.com";
  const password = "admin";

  try {
    let user = await User.findOne({ email });
    if (user) {
      console.log("Admin user already exists");
      return;
    }

    user = new User({
      name,
      email,
      password,
      role: "admin",
      status: "approved", // Admin is automatically approved
    });

    // Hash the password before saving
    // const salt = await bcrypt.genSalt(10);
    // user.password = await bcrypt.hash(password, salt);

    await user.save();
    console.log("Admin user created successfully");
    mongoose.disconnect(); // Close the connection after the user is created
  } catch (err) {
    console.error("Error creating admin user:", err);
    mongoose.disconnect();
  }
}

createAdmin();
