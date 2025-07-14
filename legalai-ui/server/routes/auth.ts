import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import { generateToken, AuthRequest } from "../middleware/auth";
import type {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  UserResponse,
  User,
} from "@shared/api";

// In-memory user storage (replace with database in production)
interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
}

const users: StoredUser[] = [];
let nextUserId = 1;

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const userResponse: User = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const token = generateToken(userResponse);

    // Frontend expects just { token: string }
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const handleSignup: RequestHandler = async (req, res) => {
  try {
    const { email, password, name }: SignupRequest = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "Email, password, and name are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser: StoredUser = {
      id: nextUserId.toString(),
      email: email.toLowerCase(),
      name,
      passwordHash,
      createdAt: new Date(),
    };

    users.push(newUser);
    nextUserId++;

    // Generate token
    const userResponse: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };

    const token = generateToken(userResponse);

    // Frontend expects just { token: string }
    res.status(201).json({ token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const handleGetUser: RequestHandler = (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const response: UserResponse = {
      user: req.user,
    };

    res.json(response);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
