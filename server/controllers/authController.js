import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_vision_intelligence_production_secure_token_2025';
const TOKEN_EXPIRY = '7d';

/**
 * Generates signed JWT payload
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

/**
 * POST /api/auth/register
 */
export async function register(req, res) {
  try {
    const { email, password, fullName, role } = req.validatedBody;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows && existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    // Hash password with salt rounds >= 10
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const assignedRole = role || 'operator';

    // Insert new user
    const insertResult = await query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role, created_at`,
      [normalizedEmail, passwordHash, fullName.trim(), assignedRole]
    );

    const newUser = insertResult.rows[0];
    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'Account registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role,
        createdAt: newUser.created_at
      },
      token
    });
  } catch (err) {
    console.error('[Register Error]', err);
    return res.status(500).json({ error: 'Server error during registration. Please try again.' });
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.validatedBody;
    const normalizedEmail = email.toLowerCase().trim();

    // Query user by email
    const result = await query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password credentials.' });
    }

    const user = result.rows[0];

    // Verify password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password credentials.' });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error('[Login Error]', err);
    return res.status(500).json({ error: 'Server error during authentication.' });
  }
}

/**
 * GET /api/auth/me
 */
export async function getMe(req, res) {
  try {
    const result = await query(
      'SELECT id, email, full_name, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const user = result.rows[0];
    return res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      createdAt: user.created_at
    });
  } catch (err) {
    console.error('[GetMe Error]', err);
    return res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
}

