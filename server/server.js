import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import { initializeDatabase } from './db.js'

import authRoutes from './routes/auth.js'
import memoriesRoutes from './routes/memories.js'
import aiRoutes from './routes/ai.js'
import remindersRoutes from './routes/reminders.js'

import { authenticateToken } from './middleware/auth.js'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 3000

// =====================================================
// CORS
// =====================================================

const frontendUrl = (
  process.env.FRONTEND_URL || 'http://localhost:5173'
)
  .trim()
  .replace(/\/+$/, '')

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no Origin header
      // such as server-to-server requests.
      if (!origin) {
        return callback(null, true)
      }

      const requestOrigin = origin
        .trim()
        .replace(/\/+$/, '')

      if (requestOrigin === frontendUrl) {
        return callback(null, true)
      }

      return callback(
        new Error(`CORS blocked origin: ${origin}`)
      )
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// =====================================================
// BODY PARSER
// =====================================================

app.use(express.json())

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'My Memory API is running',
  })
})

// =====================================================
// AUTH ROUTES
// =====================================================

app.use('/api/auth', authRoutes)

// =====================================================
// PROTECTED ROUTES
// =====================================================

app.use(
  '/api/memories',
  authenticateToken,
  memoriesRoutes
)

app.use(
  '/api/ai',
  authenticateToken,
  aiRoutes
)

app.use(
  '/api/reminders',
  authenticateToken,
  remindersRoutes
)

// =====================================================
// ERROR HANDLING
// =====================================================

app.use((err, req, res, next) => {
  console.error('Error:', err)

  if (err.message?.startsWith('CORS blocked origin:')) {
    return res.status(403).json({
      message: 'CORS policy blocked this request',
    })
  }

  res.status(500).json({
    message: 'Internal server error',
  })
})

// =====================================================
// START SERVER
// =====================================================

const startServer = async () => {
  try {
    await initializeDatabase()

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`My Memory API running on port ${PORT}`)
      console.log(`Frontend origin allowed: ${frontendUrl}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

startServer()