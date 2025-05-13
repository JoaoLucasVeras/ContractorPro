import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access denied, no token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// GET /users/me — Must be ABOVE /:id route
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID in token" });
    }

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

    if (!user) return res.status(404).json({ error: "User not found" });

    const { password, ...safeUser } = user;

    res.status(200).json(safeUser);
  } catch (err) {
    console.error("Error in /me route:", err);
    res.status(500).json({ error: "Server error while fetching user" });
  }
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await db.collection("users").find({}).toArray();
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user by ID — must be after /me
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user" });
  }
});

// Register a new user
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, email, username, password, isAdmin = false } = req.body;

    if (!firstName || !lastName || !email || !username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check for existing email or username
    const existingUser = await db.collection("users").findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({ error: "Email is already in use" });
      }
      if (existingUser.username === username) {
        return res.status(409).json({ error: "Username is already in use" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      isAdmin,
    };

    const result = await db.collection("users").insertOne(newUser);
    res.status(201).json({ message: "User created", userId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error adding user" });
  }
});

// Login route (UPDATED to include userId in response)
router.post("/login", async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    const user = await db.collection("users").findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, username: user.username, isAdmin: user.isAdmin || false },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      userId: user._id.toString() // Ensure the userId is a string for frontend
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
