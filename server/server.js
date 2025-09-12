const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5000;

// Middlewares
const app = express();
app.use(cors());
app.use(express.json());

// ===================
// CONNECT TO DATABASE
// ===================
const MONGO_URI = process.env.MONGO_URI;
const connectToDatabase = async () => {
  try {
    const res = await mongoose.connect(MONGO_URI);
    if (res) console.log("MongoDB connected Successfully!");
  } catch (err) {
    console.error("MongoDB could not connect!", err);
  }
};

connectToDatabase(); // calls the function to connect to the database

// ==============
// ROUTE HANDLING
// ==============

// Auth Routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// Protected Routes
const protectedRoutes = require("./routes/protected");
app.use("/", protectedRoutes);

// =================
// SERVE THE BACKEND
// =================
app.listen(PORT, () => {
  console.log(`The server is running at http://localhost:${PORT}`);
});
