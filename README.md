# 🏢 AL RABEI REAL ESTATE - Backend API

Professional RESTful API for Real Estate Management System built with Node.js, Express, PostgreSQL, and Prisma ORM.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.18+-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14+-blue.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-v6.18+-purple.svg)](https://www.prisma.io/)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Authentication](#-authentication)
- [Error Handling](#-error-handling)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

### Core Features
- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Role-Based Access Control** - Admin, Broker, and Client roles
- 🏘️ **Property Management** - Full CRUD operations for properties
- 📸 **Image Upload** - Multi-image upload with Multer
- 📊 **Lead Management** - Track and manage property leads
- 💼 **Deal Management** - Complete deal tracking with commission calculations
- 🏢 **Multi-Tenant Support** - Company-based data separation
- 🔍 **Advanced Search & Filtering** - Search properties by multiple criteria

### Security Features
- ✅ Helmet.js for HTTP headers security
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ CORS configuration
- ✅ Password hashing with bcrypt
- ✅ Input validation with express-validator
- ✅ SQL injection protection (Prisma ORM)

### Performance Features
- ⚡ Response compression
- 🗄️ Efficient database queries with Prisma
- 📦 Pagination support
- 🖼️ Image caching headers

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **PostgreSQL** | Primary database |
| **Prisma** | ORM for database operations |
| **JWT** | Authentication tokens |
| **Bcrypt** | Password hashing |
| **Multer** | File upload handling |
| **Helmet** | Security headers |
| **CORS** | Cross-origin resource sharing |
| **Jest** | Testing framework |

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 18.0.0
PostgreSQL >= 14
npm or yarn
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/al-rabei-real-estate.git
cd al-rabei-real-estate/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp config.env.example config.env
# Edit config.env with your configuration
```

4. **Set up PostgreSQL database**
```bash
# Create database
createdb al_rabei_real_estate

# Update DATABASE_URL in config.env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/al_rabei_real_estate
```

5. **Run Prisma migrations**
```bash
npm run prisma:migrate
```

6. **Generate Prisma Client**
```bash
npm run prisma:generate
```

7. **Start the server**
```bash
# Development mode
npm run dev

# Production mode
npm start

# With PM2
npm run start:pm2
```

The server will start on `http://localhost:3050`

## 🔧 Environment Variables

Create a `config.env` file in the root directory:

```env
# Server
PORT=3050
NODE_ENV=development
LOG_LEVEL=info

# Frontend
FRONTEND_URL=http://localhost:3000

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Database
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/al_rabei_real_estate
```

See `config.env.example` for complete configuration options.

## 📡 API Endpoints

### Health Check
```http
GET /api/health
```

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | User login | ❌ |
| GET | `/api/auth/profile` | Get user profile | ✅ |
| PUT | `/api/auth/profile` | Update profile | ✅ |
| PUT | `/api/auth/change-password` | Change password | ✅ |
| GET | `/api/auth/verify` | Verify token | ✅ |

### Properties

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/properties` | Get all properties | ❌ | - |
| GET | `/api/properties/:id` | Get property by ID | ❌ | - |
| GET | `/api/properties/new-arrivals/:limit?` | Get latest properties | ❌ | - |
| POST | `/api/properties` | Create property | ✅ | Admin/Broker |
| PUT | `/api/properties/:id` | Update property | ✅ | Admin/Broker |
| DELETE | `/api/properties/:id` | Delete property | ✅ | Admin/Broker |
| GET | `/api/properties/owner/:ownerId` | Get owner properties | ✅ | Admin/Broker |

### Leads

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/leads` | Get all leads | ✅ | Admin/Broker |
| GET | `/api/leads/:id` | Get lead by ID | ✅ | Admin/Broker |
| POST | `/api/leads` | Create lead | ❌ | - |
| PUT | `/api/leads/:id` | Update lead status | ✅ | Admin/Broker |
| DELETE | `/api/leads/:id` | Delete lead | ✅ | Admin |
| GET | `/api/leads/notifications/count` | Get notification count | ✅ | Admin/Broker |

### Deals

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/deals` | Get all deals | ✅ | Admin/Broker |
| GET | `/api/deals/:id` | Get deal by ID | ✅ | Admin/Broker |
| POST | `/api/deals` | Create deal | ✅ | Admin/Broker |
| PUT | `/api/deals/:id` | Update deal | ✅ | Admin/Broker |
| DELETE | `/api/deals/:id` | Delete deal | ✅ | Admin |

### Users

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/users` | Get all users | ✅ | Admin |
| GET | `/api/users/:id` | Get user by ID | ✅ | Admin |
| PUT | `/api/users/:id` | Update user | ✅ | Admin |
| DELETE | `/api/users/:id` | Delete user | ✅ | Admin |
| POST | `/api/users/:id/approve` | Approve broker | ✅ | Admin |
| POST | `/api/users/:id/reject` | Reject broker | ✅ | Admin |
| GET | `/api/users/pending/brokers` | Get pending brokers | ✅ | Admin |

### Companies

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/companies` | Get all companies | ✅ | All |
| GET | `/api/companies/:id` | Get company by ID | ✅ | All |
| POST | `/api/companies` | Create company | ✅ | Admin |
| PUT | `/api/companies/:id` | Update company | ✅ | Admin |
| DELETE | `/api/companies/:id` | Delete company | ✅ | Admin |

## 📂 Project Structure

```
backend/
├── config.env              # Environment configuration
├── config.js               # Configuration loader
├── start-server.js         # Server entry point
├── package.json            # Dependencies
│
├── database/               # Database configuration
│   └── db.js              # Prisma client
│
├── prisma/                 # Prisma schema & migrations
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Migration files
│
├── models/                 # Data models
│   ├── User.js
│   ├── Property.js
│   ├── Lead.js
│   ├── Deal.js
│   └── Company.js
│
├── routes/                 # API routes
│   ├── auth.js
│   ├── properties.js
│   ├── leads.js
│   ├── deals.js
│   ├── users.js
│   └── companies.js
│
├── middleware/             # Custom middleware
│   ├── auth.js            # Authentication
│   └── errorHandler.js    # Error handling
│
├── validators/             # Input validation
│   ├── authValidator.js
│   └── propertyValidator.js
│
├── utils/                  # Utility functions
│   ├── jwtHelper.js       # JWT utilities
│   ├── logger.js          # Logging utility
│   └── errorCodes.js      # Error code definitions
│
├── uploads/                # Uploaded files
├── logs/                   # Application logs
└── __tests__/             # Test files
```

## 🗄️ Database Schema

### Main Tables
- **users** - User accounts (Admin, Broker, Client)
- **properties** - Property listings
- **leads** - Customer leads
- **deals** - Completed deals
- **companies** - Company information
- **agents** - Agent profiles

See `prisma/schema.prisma` for complete schema definition.

## 🔐 Authentication

### JWT Token Structure
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "broker"
}
```

### Protected Routes
Include JWT token in Authorization header:
```http
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **Admin** - Full system access
- **Broker** - Manage properties, leads, deals
- **Client** - View properties, submit inquiries

## ⚠️ Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Error Codes
- `AUTH_*` - Authentication errors (1000-1999)
- `AUTHZ_*` - Authorization errors (2000-2999)
- `VALIDATION_*` - Validation errors (3000-3999)
- `RESOURCE_*` - Resource errors (4000-4999)
- `DATABASE_*` - Database errors (5000-5999)
- `FILE_*` - File upload errors (6000-6999)
- `SERVER_*` - Server errors (9000-9999)

See `utils/errorCodes.js` for complete list.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test
npm run test:health
```

## 🚢 Deployment

### Quick Deploy Options

#### Option 1: Supabase + Railway (Recommended) ⭐
- **Database**: Supabase (PostgreSQL)
- **Backend**: Railway
- **Guide**: See [SUPABASE_QUICK_SETUP.md](./SUPABASE_QUICK_SETUP.md) for quick setup
- **Full Guide**: See [SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md) for detailed instructions

#### Option 2: Railway (Full Stack)
- **Database**: Railway PostgreSQL
- **Backend**: Railway
- See Railway deployment guides in project root

#### Option 3: Vercel + Supabase
- **Database**: Supabase (PostgreSQL)
- **Backend**: Vercel
- See [SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md)

### Using PM2 (Self-hosted)

```bash
# Start with PM2
npm run start:pm2

# View logs
pm2 logs alrabie-backend

# Stop
pm2 stop alrabie-backend

# Restart
pm2 restart alrabie-backend
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (32+ characters)
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Enable HTTPS
- [ ] Configure rate limiting
- [ ] Set up monitoring (e.g., PM2, New Relic)
- [ ] Configure proper logging
- [ ] Set up error tracking (e.g., Sentry)

## 📝 Scripts

```bash
npm start              # Start production server
npm run dev            # Start development server with nodemon
npm test               # Run tests
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run database migrations
npm run prisma:studio      # Open Prisma Studio
npm run start:pm2         # Start with PM2
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

**AL RABEI REAL ESTATE Team**

## 🙏 Acknowledgments

- Express.js team
- Prisma team
- Node.js community

---

**Made with ❤️ by AL RABEI REAL ESTATE**


