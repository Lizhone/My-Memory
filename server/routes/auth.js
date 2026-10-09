import express from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes, createHash } from 'crypto';
import { Resend } from 'resend';
import pool from '../db.js';

const router = express.Router();

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const RESET_TOKEN_EXPIRY_MINUTES = 15;

// ==========================================
// REGISTER
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required'
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      return res.status(400).json({
        message: 'Name cannot be empty'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      });
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [cleanEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: 'Email already exists'
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email
      `,
      [cleanName, cleanEmail, hashedPassword]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Register error:', err);

    return res.status(500).json({
      message: 'Registration failed'
    });
  }
});

// ==========================================
// LOGIN
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password required'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const result = await pool.query(
      `
      SELECT id, name, email, password
      FROM users
      WHERE email = $1
      `,
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcryptjs.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);

    return res.status(500).json({
      message: 'Login failed'
    });
  }
});

// ==========================================
// FORGOT PASSWORD
// ==========================================
router.post('/forgot-password', async (req, res) => {
  try {
    const email =
      typeof req.body.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: 'Please enter a valid email address.'
      });
    }

    const genericMessage =
      'If an account exists for this email, a password-reset link will be sent.';

    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    // Do not reveal whether an account exists.
    if (result.rows.length === 0) {
      return res.json({ message: genericMessage });
    }

    if (!resend || !process.env.FRONTEND_URL ||
        !process.env.RESEND_FROM_EMAIL) {
      console.error('Password reset email configuration is incomplete.');

      return res.status(503).json({
        message: 'Password-reset email is temporarily unavailable.'
      });
    }

    const userId = result.rows[0].id;
    const rawToken = randomBytes(32).toString('hex');

    const tokenHash = createHash('sha256')
      .update(rawToken)
      .digest('hex');

    await pool.query(
      `
      UPDATE users
      SET password_reset_token_hash = $1,
          password_reset_expires =
            NOW() + ($2 * INTERVAL '1 minute')
      WHERE id = $3
      `,
      [tokenHash, RESET_TOKEN_EXPIRY_MINUTES, userId]
    );

    const resetUrl = new URL(
      '/reset-password',
      process.env.FRONTEND_URL
    );

    resetUrl.searchParams.set('token', rawToken);

    try {
      const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: email,
        subject: 'Reset your My Memory password',
        text: [
          'We received a request to reset your My Memory password.',
          '',
          `Use this link within ${RESET_TOKEN_EXPIRY_MINUTES} minutes:`,
          resetUrl.toString(),
          '',
          'If you did not request this, you can ignore this email.'
        ].join('\n')
      });

      if (error) {
        throw new Error(error.message || 'Email delivery failed');
      }
    } catch (emailError) {
      await pool.query(
        `
        UPDATE users
        SET password_reset_token_hash = NULL,
            password_reset_expires = NULL
        WHERE id = $1
        `,
        [userId]
      );

      console.error(
  'Password-reset email could not be sent:',
  emailError.message
);

      return res.status(503).json({
        message: 'Unable to send the reset email. Please try again later.'
      });
    }

    return res.json({ message: genericMessage });
  } catch (err) {
    console.error('Forgot-password error:', err.message);

    return res.status(500).json({
      message: 'Unable to process the request. Please try again.'
    });
  }
});

// ==========================================
// RESET PASSWORD
// ==========================================
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (
      typeof token !== 'string' ||
      !token ||
      typeof password !== 'string' ||
      password.length < 6
    ) {
      return res.status(400).json({
        message: 'A valid reset token and a password of at least 6 characters are required.'
      });
    }

    const tokenHash = createHash('sha256')
      .update(token)
      .digest('hex');

    const result = await pool.query(
      `
      SELECT id
      FROM users
      WHERE password_reset_token_hash = $1
        AND password_reset_expires > NOW()
      `,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: 'This reset link is invalid or has expired. Please request a new one.'
      });
    }

    const userId = result.rows[0].id;
    const hashedPassword = await bcryptjs.hash(password, 10);

    // The token is cleared after a successful reset and cannot be reused.
    const updated = await pool.query(
      `
      UPDATE users
      SET password = $1,
          password_reset_token_hash = NULL,
          password_reset_expires = NULL
      WHERE id = $2
        AND password_reset_token_hash = $3
        AND password_reset_expires > NOW()
      RETURNING id
      `,
      [hashedPassword, userId, tokenHash]
    );

    if (updated.rows.length === 0) {
      return res.status(400).json({
        message: 'This reset link is invalid or has expired. Please request a new one.'
      });
    }

    return res.json({
      message: 'Password reset successful. You can now sign in with your new password.'
    });
  } catch (err) {
    console.error('Reset-password error:', err.message);

    return res.status(500).json({
      message: 'Unable to reset your password. Please try again.'
    });
  }
});

export default router;