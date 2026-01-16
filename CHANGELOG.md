# Changelog

All notable changes to AL RABEI Real Estate Backend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1] - 2024-11-12

### Changed
- **Updated START_PROJECT.bat** (في المجلد الرئيسي) - Now automatically opens Prisma Studio
  - Added Prisma Studio startup
  - Opens Frontend and Prisma Studio in browser
  - 3 separate windows for Backend, Prisma, and Frontend

## [1.2.0] - 2024-11-11

### Added - Monthly Commission System
- **Monthly commission calculation** for brokers
- **Monthly income reports** for admin
- **Historical records** for all months
- **Date filtering** for deals
- **9 new API endpoints** for reports

### New Utilities
- `utils/dateHelper.js` - Date manipulation functions
- `utils/commissionCalculator.js` - Commission calculation

### New Routes
- `routes/reports.js` - Monthly reports endpoints
  - `/api/reports/broker/monthly` - Broker monthly commission
  - `/api/reports/broker/history` - Commission history
  - `/api/reports/broker/compare` - Month comparison
  - `/api/reports/company/monthly` - Company income
  - `/api/reports/company/history` - Income history
  - `/api/reports/brokers/performance` - All brokers performance
  - `/api/reports/dashboard` - Dashboard summary
  - `/api/reports/months` - Available months list
  - `/api/deals/filter` - Filter deals by date/month

### Documentation
- `MONTHLY_REPORTS_API.md` - Complete API documentation
- `MONTHLY_COMMISSION_UPDATE.md` - Feature summary

## [Unreleased]

### Added - 2024-11-11

#### 🔧 Core Improvements
- **JWT Helper Utility** (`utils/jwtHelper.js`)
  - Centralized JWT secret management
  - Simplified token generation across the application
  - Better error handling for missing JWT secrets
  - Caching mechanism for improved performance

- **Professional Logger** (`utils/logger.js`)
  - Custom logging utility with colored output
  - Multiple log levels (error, warn, info, http, debug, success)
  - Automatic log file creation (`logs/error.log`, `logs/combined.log`)
  - Configurable log level via environment variable
  - Structured logging with metadata support

- **Error Codes System** (`utils/errorCodes.js`)
  - Centralized error code definitions
  - APIError class for consistent error handling
  - Categorized error codes (AUTH, AUTHZ, VALIDATION, RESOURCE, DATABASE, FILE, SERVER)
  - Better error tracking and debugging

#### 📚 Documentation
- **README.md** - Comprehensive project documentation
  - Complete feature list
  - Installation guide
  - API endpoint overview
  - Project structure
  - Deployment instructions
  
- **API_DOCUMENTATION.md** - Detailed API documentation
  - All endpoint descriptions
  - Request/response examples
  - Error code reference
  - Authentication guide
  - Query parameter documentation

- **CHANGELOG.md** - Version history and changes

#### 🔐 Security & Configuration
- **Enhanced .gitignore**
  - Comprehensive ignore patterns
  - OS-specific files
  - IDE files
  - Log files
  - Environment files
  - Upload directory management

- **Improved config.env.example**
  - Detailed configuration comments
  - All available options documented
  - Security best practices
  - Production deployment notes

#### 🏥 Health & Monitoring
- **Advanced Health Check** (`routes/health.js`)
  - Basic health endpoint (`/api/health`)
  - Detailed system health (`/api/health/detailed`)
  - Readiness check for Kubernetes (`/api/health/ready`)
  - Liveness check for Kubernetes (`/api/health/live`)
  - Database connection monitoring
  - System metrics (uptime, memory usage)
  - Upload directory status check

#### 🏗️ Architecture Improvements
- **CORS Configuration** (`config/cors.js`)
  - Extracted CORS logic from main server file
  - Cleaner configuration management
  - Better logging for CORS events
  - Separate handlers for OPTIONS requests

- **Middleware Configuration** (`config/middleware.js`)
  - Centralized middleware setup
  - Modular middleware application
  - Easier to maintain and test
  - Better code organization

### Changed

#### 📝 Code Quality
- **Simplified Authentication** (`routes/auth.js`)
  - Removed complex JWT_SECRET handling code (122 lines → 40 lines)
  - Uses new jwtHelper utility
  - Better error messages
  - Cleaner code structure

- **Enhanced Auth Middleware** (`middleware/auth.js`)
  - Uses centralized jwtHelper
  - Better error handling with specific error codes
  - Account status validation
  - Improved error responses with success flag

- **Improved Error Handler** (`middleware/errorHandler.js`)
  - Integration with new logger utility
  - Support for APIError class
  - Better Prisma error handling
  - More detailed error information in development
  - Consistent error response format
  - Added notFoundHandler for 404 errors

### Security Improvements
- JWT secret validation and length checking
- Better error messages that don't expose sensitive information in production
- Token expiration error handling
- Rate limiting with custom error messages

### Performance Improvements
- JWT secret caching
- Optimized logging (file writes only when needed)
- Better memory management

### Developer Experience
- Comprehensive documentation
- Better code organization
- Easier to understand error messages
- Helpful development logs
- Clear project structure

---

## [1.0.0] - Initial Release

### Features
- User authentication with JWT
- Role-based access control (Admin, Broker, Client)
- Property management (CRUD operations)
- Multi-image upload support
- Lead management system
- Deal tracking with commission calculation
- Multi-tenant company support
- Advanced search and filtering
- PostgreSQL database with Prisma ORM
- RESTful API design
- Input validation
- Error handling
- Security headers (Helmet)
- CORS configuration
- Rate limiting
- Password hashing (bcrypt)
- Compression middleware
- Health check endpoint

---

## Migration Guide

### Upgrading from Previous Version

If you're upgrading from a previous version, follow these steps:

1. **Update Dependencies** (if any changes)
   ```bash
   npm install
   ```

2. **Update Environment Variables**
   - Review `config.env.example` for new variables
   - Add `LOG_LEVEL` to your config (optional)
   ```env
   LOG_LEVEL=info
   ```

3. **Create Required Directories**
   ```bash
   mkdir logs
   ```

4. **No Database Changes Required**
   - This update doesn't require database migrations

5. **Restart Your Server**
   ```bash
   npm run dev  # or npm start
   ```

### Breaking Changes
- None in this release

### Deprecations
- None in this release

---

## Notes

### What's Next?
- [ ] Add Winston logger (optional upgrade from custom logger)
- [ ] Implement API versioning
- [ ] Add Swagger/OpenAPI documentation
- [ ] Implement caching with Redis
- [ ] Add email notification system
- [ ] Implement WebSocket for real-time updates
- [ ] Add unit tests for new utilities
- [ ] Add integration tests
- [ ] Performance monitoring
- [ ] TypeScript migration (optional)

### Contributors
- AL RABEI Real Estate Development Team

---

**For detailed API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)**  
**For project setup, see [README.md](README.md)**


