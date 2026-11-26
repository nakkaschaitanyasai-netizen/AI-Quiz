import bcrypt from "bcrypt";
import User from "../models/Users.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { username, email, password, role = "student" } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ ok: false, error: "All fields are required" });
    }

    const safeRole = role === "teacher" ? "teacher" : "student";

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ ok: false, error: "Email already registered" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: safeRole,
    });

    await newUser.save();

    res.status(201).json({
      ok: true,
      message: "User registered successfully",
      userId: newUser._id,
      role: newUser.role,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message || "User registration failed",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) {
      return res.status(401).json({ ok: false, message: "User not found" });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ ok: false, message: "Invalid password" });
    }

    const payload = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role || "student",
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      ok: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || "student",
      },
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message || "Login failed" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ ok: true, message: "Logout successful" });
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }
    res.status(200).json({ ok: true, user });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ ok: false, message: "Error occurred while fetching user" });
  }
};
