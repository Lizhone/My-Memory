# PostgreSQL Setup for Windows

## Quick Setup

### Option 1: Install PostgreSQL from EDB (Recommended for Windows)

1. Download PostgreSQL installer from: https://www.postgresql.org/download/windows/
   - Choose the latest version (15.x or 16.x)
   - Download from EDB

2. Run the installer (`postgresql-16.x-x64.exe`)
   - Choose installation directory
   - Choose superuser password (remember this!)
   - Choose port (default: 5432)
   - Choose components (default OK)
   - Finish installation

3. After installation, PostgreSQL service should be running automatically
   - Check Windows Services: `Services.msc` → look for "postgresql"
   - Should show status "Running"

### Option 2: Using Windows Subsystem for Linux (WSL) + apt

If you prefer WSL:
```bash
wsl
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

### Option 3: Docker (If you have Docker installed)

```bash
docker run --name my-memory-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=my_memory \
  -p 5432:5432 \
  -d postgres:latest
```

## Verify Installation

Open PowerShell and run:

```powershell
# Test PostgreSQL connection
psql -U postgres -c "SELECT version();"
```

You should see the PostgreSQL version.

## Create Database

```bash
# Connect to PostgreSQL as admin
psql -U postgres

# In the psql prompt, run:
CREATE DATABASE my_memory;

# Verify
\l

# Exit
\q
```

## Update .env

After PostgreSQL is running, update `.env` in your project root:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/my_memory
PORT=3000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this
CLAUDE_API_KEY=your_claude_api_key_from_console.anthropic.com
FRONTEND_URL=http://localhost:5174
```

## Verify Connection from Node.js

After updating .env, try starting the backend:

```bash
cd server
npm run dev
```

You should see:
```
Database initialized successfully
Server running on http://localhost:3000
```

## Troubleshooting

### "psql: command not found"
- Add PostgreSQL to PATH:
  - Right-click "This PC" → Properties
  - Advanced system settings
  - Environment Variables
  - Add `C:\Program Files\PostgreSQL\16\bin` to PATH
  - Restart PowerShell

### "ECONNREFUSED"
- PostgreSQL is not running
- Start it: Services.msc → postgresql → Right-click → Start
- Or restart your computer

### "role "postgres" does not exist"
- Check PostgreSQL was installed correctly
- Reinstall if needed

### Wrong password error
- Try connecting without password first: `psql -U postgres` (Windows might use trust auth)
- If that works, your .env DATABASE_URL might be wrong

## Next Steps

Once PostgreSQL is running and your database is created:

1. Backend will auto-create all tables
2. Terminal 1: `cd client && npm run dev` (Frontend on 5174)
3. Terminal 2: `cd server && npm run dev` (Backend on 3000)
4. Open http://localhost:5174 and start using My Memory!
