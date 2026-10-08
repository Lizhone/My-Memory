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
// CORS CONFIGURATION
// =====================================================

const configuredFrontendUrl = (
  process.env.FRONTEND_URL || 'http://localhost:5173'
)
  .trim()
  .replace(/\/+$/, '')

const allowedOrigins = [
  configuredFrontendUrl,
  'http://localhost:5173',
  'http://localhost:5174',
].filter((origin, index, array) => array.indexOf(origin) === index)

const corsOptions = {
  origin: (origin, callback) => {
    // Requests such as direct server-to-server requests
    // may not contain an Origin header.
    if (!origin) {
      return callback(null, true)
    }

    const normalizedOrigin = origin
      .trim()
      .replace(/\/+$/, '')

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true)
    }

    console.error('CORS blocked origin:', origin)

    return callback(
      new Error(`CORS blocked origin: ${origin}`)
    )
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
  ],

  optionsSuccessStatus: 204,
}

// Enable CORS
app.use(cors(corsOptions))

// Explicitly handle preflight requests
app.options('*', cors(corsOptions))

// =====================================================
// BODY PARSER
// =====================================================

app.use(express.json())

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/health', (req, res) => {
  res.status(200).json({
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
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
  })
})

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error('Server error:', err)

  if (err.message?.startsWith('CORS blocked origin:')) {
    return res.status(403).json({
      message: 'CORS policy blocked this request',
    })
  }

  return res.status(500).json({
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
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

startServer()