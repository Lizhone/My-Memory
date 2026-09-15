# My Memory - Full-Stack AI-Powered Personal Memory Application

## Quick Start

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- npm or yarn

### Setup Instructions

#### 1. Database Setup (PostgreSQL)

If you don't have PostgreSQL installed, download it from: https://www.postgresql.org/download/

After installation, create a database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE my_memory;

# Create user (optional, for security)
CREATE USER my_memory_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE my_memory TO my_memory_user;

\q
```

#### 2. Configure Environment Variables

Update `.env` in the project root with your PostgreSQL connection details:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/my_memory
PORT=3000
NODE_ENV=development
JWT_SECRET=your_secure_jwt_secret
CLAUDE_API_KEY=your_claude_api_key
FRONTEND_URL=http://localhost:5174
```

Get your Claude API key from: https://console.anthropic.com/

#### 3. Install Dependencies

```bash
# Install root dependencies (optional)
npm install

# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

#### 4. Start the Application

**Option A: Start both services separately**

Terminal 1 (Frontend):
```bash
cd client
npm run dev
```

Terminal 2 (Backend):
```bash
cd server
npm run dev
```

**Option B: Start both services at once (from root)**
```bash
npm run dev
```

Frontend runs on: `http://localhost:5174`
Backend runs on: `http://localhost:3000`

### First Time Use

1. Open http://localhost:5174
2. Click "Sign Up" to create an account
3. Add your first memory by clicking "Add a Memory"
4. The AI will extract information automatically
5. Ask questions about your memories using "Ask AI"

## Project Structure

```
my-memory/
├── client/                 # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/    # Reusable components (Sidebar, etc.)
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client
│   │   └── App.jsx        # Main app component
│   └── package.json
├── server/                # Express.js backend
│   ├── routes/            # API routes
│   ├── services/          # Business logic (AI)
│   ├── middleware/        # Auth middleware
│   ├── db.js              # Database connection
│   └── server.js          # Main server file
├── .env                   # Environment variables (git-ignored)
└── .env.example           # Example env file
```

## Features

### Priority 1 (MVP - Implemented)
- ✅ User registration and login
- ✅ Add memories with natural language
- ✅ AI extracts structured information
- ✅ View all memories with search and filter
- ✅ Ask AI questions about memories
- ✅ View detailed memory information
- ✅ Delete memories

### Priority 2 (Additional)
- Reminders management
- Edit memories
- Advanced search

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Axios, React Router
- **Backend**: Express.js, PostgreSQL, JWT, bcryptjs
- **AI**: Claude API (via backend)
- **Auth**: JWT tokens

## Security

- API keys stored in `.env` (not exposed to frontend)
- Passwords hashed with bcryptjs
- JWT authentication on all protected routes
- CORS configured
- User data isolation (each user can only access their own data)

## Troubleshooting

### PostgreSQL Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env matches your setup
- Verify username/password

### API Key Error
- Get your Claude API key from https://console.anthropic.com/
- Add it to .env as CLAUDE_API_KEY

### Frontend Can't Connect to Backend
- Ensure backend is running on port 3000
- Check VITE_API_URL in client/.env points to http://localhost:3000/api
- Check CORS configuration in server/server.js

## Notes for One-Day MVP

This implementation prioritizes:
- Working core functionality over perfection
- Simple database structure
- Basic but complete UI
- Essential features only

For production use, consider:
- Vector database for better memory search
- More sophisticated reminder notifications
- Caching layer
- Database migrations
- Comprehensive error logging
