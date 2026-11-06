import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query, get, run } from "../db/index.js";
import { config } from "../config/env.js";

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

export async function registerUser({ name, email, password, role = "customer" }) {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existing = await get("SELECT id FROM users WHERE LOWER(email) = ?", [normalizedEmail]);
  if (existing) {
    const error = new Error("A user with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const now = new Date().toISOString();
  const insertResult = await run(
    `INSERT INTO users (name, email, password_hash, role, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [name.trim(), normalizedEmail, passwordHash, role, now]
  );

  const userId = insertResult.lastInsertRowid;
  const user = {
    id: userId,
    name: name.trim(),
    email: normalizedEmail,
    role,
    createdAt: now,
  };

  const token = generateToken(user);
  return { user, token };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  const userRecord = await get(
    "SELECT id, name, email, password_hash, role, created_at FROM users WHERE LOWER(email) = ?",
    [normalizedEmail]
  );

  if (!userRecord) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, userRecord.password_hash);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const user = {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    role: userRecord.role,
    createdAt: userRecord.created_at,
  };

  const token = generateToken(user);
  return { user, token };
}

export async function getUserById(id) {
  const userRecord = await get(
    "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
    [id]
  );
  if (!userRecord) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    role: userRecord.role,
    createdAt: userRecord.created_at,
  };
}

