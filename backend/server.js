
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());

// Make uploaded images accessible
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configure image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

// POST /api/register
app.post("/api/register", upload.single("profileImage"), async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });

    if (existing) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      profileImage: req.file ? `/uploads/${req.file.filename}` : "",
    });

    res.status(201).json({
      message: "Registration successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error. Please try again.",
    });
  }
});

// GET /api/users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch users." });
  }
});

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on http://localhost:${process.env.PORT || 5000}`)
);
