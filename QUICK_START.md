# ⚡ Quick Start Guide - AL RABEI Real Estate Backend

Get up and running in 5 minutes!

## 🚀 Quick Installation

### Step 1: Prerequisites Check

```bash
# Check Node.js version (need 18+)
node --version

# Check PostgreSQL
psql --version

# If not installed, install them first
```

### Step 2: Clone & Install

```bash
# Navigate to backend directory
cd "AL RABEI REAL STATE/backend"

# Install dependencies
npm install
```

### Step 3: Configure Environment

```bash
# Copy example config
cp config.env.example config.env

# Edit config.env - MINIMUM required changes:
# 1. Change JWT_SECRET (must be 32+ characters)
# 2. Update DATABASE_URL with your PostgreSQL credentials
```

**Quick config.env setup:**
```env
PORT=3050
NODE_ENV=development
JWT_SECRET=change-this-to-a-very-long-secret-key-minimum-32-characters-required
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/al_rabei_real_estate
FRONTEND_URL=http://localhost:3000
```

### Step 4: Database Setup

```bash
# Create database
createdb al_rabei_real_estate

# Run migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate
```

### Step 5: Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

✅ Server should now be running on `http://localhost:3050`

---

## 🧪 Test Your Setup

### 1. Health Check
```bash
curl http://localhost:3050/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "AL RABEI Real Estate API is running",
  "timestamp": "2024-11-11T12:00:00.000Z"
}
```

### 2. Register Test User
```bash
curl -X POST http://localhost:3050/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123456",
    "role": "client"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

---

## 📝 Default Admin Account

**Option 1: Create via API**
```bash
curl -X POST http://localhost:3050/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@alrabei.com",
    "password": "Admin123456",
    "role": "admin"
  }'
```

**Option 2: Create via Prisma Studio**
```bash
npm run prisma:studio
# Navigate to http://localhost:5555
# Create user with role='admin'
```

---

## 🔍 Troubleshooting

### Problem: "Port 3050 already in use"

**Solution 1:** Change port in config.env
```env
PORT=3051
```

**Solution 2:** Kill process using port
```bash
# Windows
netstat -ano | findstr :3050
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3050 | xargs kill -9
```

### Problem: "Database connection failed"

**Check:**
1. PostgreSQL is running
2. DATABASE_URL is correct in config.env
3. Database exists: `psql -l | grep al_rabei`

**Fix:**
```bash
# Start PostgreSQL (if not running)
# Windows: Start from Services
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Recreate database
dropdb al_rabei_real_estate
createdb al_rabei_real_estate
npm run prisma:migrate
```

### Problem: "JWT_SECRET error"

**Fix:**
Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy output to config.env:
```env
JWT_SECRET=<paste-generated-secret-here>
```

### Problem: "Prisma Client not generated"

**Fix:**
```bash
npm run prisma:generate
```

---

## 📚 Next Steps

### 1. Explore API Documentation
- Read [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- Test endpoints using Postman or curl
- Check [README.md](README.md) for full documentation

### 2. Create Test Data

**Create a property:**
```bash
# First, login and get token
TOKEN="<your-jwt-token>"

# Create property
curl -X POST http://localhost:3050/api/properties \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Luxury Villa",
    "type": "villa",
    "purpose": "sale",
    "price": 5000000,
    "area_sqft": 5000,
    "bedrooms": 5,
    "bathrooms": 6,
    "emirate": "Dubai",
    "location": "Dubai Hills Estate"
  }'
```

### 3. Connect Frontend

Update frontend configuration to point to:
```
API_URL=http://localhost:3050/api
```

### 4. Development Tools

**Prisma Studio (Database GUI):**
```bash
npm run prisma:studio
# Opens at http://localhost:5555
```

**View Logs:**
```bash
# Error logs
cat logs/error.log

# All logs
cat logs/combined.log
```

---

## 🎯 Common Tasks

### Add New Admin
```bash
# Via API (if you're already admin)
curl -X POST http://localhost:3050/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@email.com","password":"pass","role":"admin"}'
```

### Reset Database
```bash
dropdb al_rabei_real_estate
createdb al_rabei_real_estate
npm run prisma:migrate
```

### Update Dependencies
```bash
npm update
npm audit fix
```

### Check Health
```bash
# Basic
curl http://localhost:3050/api/health

# Detailed
curl http://localhost:3050/api/health/detailed
```

---

## 🔗 Useful Links

- **API Base URL:** `http://localhost:3050/api`
- **Health Check:** `http://localhost:3050/api/health`
- **Prisma Studio:** `http://localhost:5555` (after running `npm run prisma:studio`)

---

## 💡 Pro Tips

1. **Use Nodemon for Development**
   ```bash
   npm run dev  # Auto-reloads on file changes
   ```

2. **Use PM2 for Production**
   ```bash
   npm run start:pm2  # Runs with PM2 process manager
   ```

3. **Check Logs Regularly**
   ```bash
   tail -f logs/combined.log
   ```

4. **Use Environment Variables**
   - Never commit config.env
   - Use different configs for dev/prod
   - Keep secrets secure

5. **Test Before Deploying**
   ```bash
   npm test
   npm run test:coverage
   ```

---

## 🆘 Get Help

- 📖 [README.md](README.md) - Full documentation
- 📚 [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference
- 🔒 [SECURITY.md](SECURITY.md) - Security guidelines
- 🤝 [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guide
- 📧 Email: dev@alrabei.com

---

## ✅ Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed and running
- [ ] Dependencies installed (`npm install`)
- [ ] config.env created and configured
- [ ] Database created
- [ ] Migrations run (`npm run prisma:migrate`)
- [ ] Prisma client generated
- [ ] Server starts successfully
- [ ] Health check returns OK
- [ ] Can register/login users

---

**🎉 You're all set! Happy coding! 🎉**

For detailed information, see [README.md](README.md)


