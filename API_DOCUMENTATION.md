# 📚 AL RABEI REAL ESTATE - API Documentation

Complete API documentation for all endpoints, request/response formats, and examples.

## Base URL

```
Development: http://localhost:3050/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require authentication using JWT Bearer tokens.

### Headers
```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

---

## 🔐 Authentication Endpoints

### Register New User

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "role": "client",
  "phone": "+971501234567",
  "whatsapp": "+971501234567"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "client",
    "status": "approved"
  }
}
```

**Note:** Broker accounts require admin approval and will not return a token immediately.

---

### Login

**POST** `/auth/login`

Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "client",
    "status": "approved"
  }
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "error": "Your account is pending admin approval",
  "requiresApproval": true,
  "status": "pending"
}
```

---

### Get Profile

**GET** `/auth/profile`

Get current user profile (requires authentication).

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "client",
    "status": "approved",
    "phone": "+971501234567",
    "whatsapp": "+971501234567",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Update Profile

**PUT** `/auth/profile`

Update user profile (requires authentication).

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+971509999999",
  "whatsapp": "+971509999999"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

---

## 🏘️ Property Endpoints

### Get All Properties

**GET** `/properties`

Get list of all properties with optional filtering.

**Query Parameters:**
- `type` - Property type (villa, apartment, commercial, office, land)
- `purpose` - Purpose (sale, rent)
- `emirate` - Emirate name
- `price_min` - Minimum price
- `price_max` - Maximum price
- `search` - Search term (searches title, description, location)
- `sort` - Sort order (price_low, price_high, area_large, area_small, newest, oldest)
- `limit` - Number of results

**Example:**
```http
GET /properties?type=villa&purpose=sale&emirate=Dubai&price_min=1000000&limit=10
```

**Response (200 OK):**
```json
{
  "properties": [
    {
      "id": 1,
      "title": "Luxury Villa in Dubai Hills",
      "description": "Beautiful 5-bedroom villa...",
      "type": "villa",
      "purpose": "sale",
      "price": 5000000,
      "area_sqft": 5000,
      "bedrooms": 5,
      "bathrooms": 6,
      "emirate": "Dubai",
      "location": "Dubai Hills Estate",
      "images": ["url1", "url2"],
      "features": ["Pool", "Garden", "Garage"],
      "status": "active",
      "owner": {
        "id": 2,
        "name": "Broker Name",
        "phone": "+971501234567",
        "email": "broker@example.com"
      },
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Get Property by ID

**GET** `/properties/:id`

Get detailed information about a specific property.

**Response (200 OK):**
```json
{
  "property": {
    "id": 1,
    "title": "Luxury Villa in Dubai Hills",
    /* ... full property details ... */
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Property not found"
}
```

---

### Get New Arrivals

**GET** `/properties/new-arrivals/:limit?`

Get latest properties (newest first).

**Parameters:**
- `limit` - Number of properties (default: 6)

**Example:**
```http
GET /properties/new-arrivals/10
```

---

### Create Property

**POST** `/properties`

Create a new property (requires authentication, Admin/Broker only).

**Content-Type:** `multipart/form-data`

**Form Data:**
```
title: Luxury Villa in Dubai
description: Beautiful villa...
type: villa
purpose: sale
price: 5000000
area_sqft: 5000
bedrooms: 5
bathrooms: 6
emirate: Dubai
location: Dubai Hills Estate
features: ["Pool", "Garden", "Garage"]
images: [file1, file2, file3]
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Property created successfully",
  "property": { /* property object */ }
}
```

---

### Update Property

**PUT** `/properties/:id`

Update an existing property (requires authentication, Admin/Broker only).

**Content-Type:** `multipart/form-data`

**Form Data:**
```
title: Updated Title
price: 5500000
status: active
existingImages: ["url1", "url2"]
images: [newFile1, newFile2]
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Property updated successfully",
  "property": { /* updated property */ }
}
```

---

### Delete Property

**DELETE** `/properties/:id`

Delete a property (requires authentication, Admin/Broker only).

**Response (200 OK):**
```json
{
  "message": "Property deleted successfully"
}
```

---

## 📊 Lead Endpoints

### Create Lead

**POST** `/leads`

Create a new lead (public endpoint - no authentication required).

**Request Body:**
```json
{
  "name": "Ahmed Mohammed",
  "phone": "+971501234567",
  "property_id": 1
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Your interest has been recorded successfully! The broker will contact you soon.",
  "lead": {
    "id": 1,
    "name": "Ahmed Mohammed",
    "phone": "+971501234567",
    "property": { /* property details */ },
    "broker": { /* broker details */ }
  }
}
```

---

### Get All Leads

**GET** `/leads`

Get all leads (requires authentication, Admin/Broker only).

**Query Parameters:**
- `status` - Filter by status (new, contacted, negotiating, closed)
- `property_id` - Filter by property
- `broker_id` - Filter by broker
- `company_id` - Filter by company

**Response (200 OK):**
```json
{
  "leads": [
    {
      "id": 1,
      "name": "Ahmed Mohammed",
      "phone": "+971501234567",
      "email": "",
      "message": "Interested in property...",
      "status": "new",
      "property": { /* property info */ },
      "broker": { /* broker info */ },
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Update Lead Status

**PUT** `/leads/:id`

Update lead status (requires authentication, Admin/Broker only).

**Request Body:**
```json
{
  "status": "contacted"
}
```

**Valid Statuses:**
- `new`
- `contacted`
- `negotiating`
- `closed`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lead status updated successfully",
  "lead": { /* updated lead */ }
}
```

---

### Get Notification Count

**GET** `/leads/notifications/count`

Get count of new leads for logged-in broker (requires authentication).

**Response (200 OK):**
```json
{
  "count": 5
}
```

---

## 💼 Deal Endpoints

### Create Deal

**POST** `/deals`

Create a new deal (requires authentication, Admin/Broker only).

**Request Body:**
```json
{
  "propertyId": 1,
  "brokerId": 2,
  "companyId": 1,
  "clientName": "Ahmed Mohammed",
  "clientId": 3,
  "dealType": "sale",
  "dealValue": 5000000,
  "commissionRate": 0.02,
  "status": "open"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Deal created successfully",
  "deal": {
    "id": 1,
    "propertyId": 1,
    "brokerId": 2,
    "companyId": 1,
    "clientName": "Ahmed Mohammed",
    "dealType": "sale",
    "dealValue": 5000000,
    "commissionRate": 0.02,
    "commissionValue": 100000,
    "brokerShare": 70000,
    "companyShare": 30000,
    "status": "open"
  }
}
```

**Note:** Commission is automatically calculated as:
- `commissionValue = dealValue × commissionRate`
- `brokerShare = commissionValue × 0.7` (70%)
- `companyShare = commissionValue × 0.3` (30%)

---

### Get All Deals

**GET** `/deals`

Get all deals with optional filtering (requires authentication).

**Query Parameters:**
- `brokerId` - Filter by broker
- `companyId` - Filter by company
- `clientId` - Filter by client
- `status` - Filter by status

**Response (200 OK):**
```json
{
  "success": true,
  "deals": [ /* array of deals */ ],
  "totals": {
    "totalDeals": 10,
    "totalDealValue": 50000000,
    "totalCommission": 1000000,
    "totalBrokerShare": 700000,
    "totalCompanyShare": 300000,
    "byStatus": {
      "open": 5,
      "closed": 3,
      "cancelled": 2
    },
    "byType": {
      "sale": 8,
      "rent": 2
    }
  }
}
```

---

### Update Deal

**PUT** `/deals/:id`

Update deal details (requires authentication, Admin/Broker only).

**Request Body:**
```json
{
  "status": "closed",
  "commissionRate": 0.025,
  "dateClosed": "2024-01-15T00:00:00.000Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Deal updated successfully",
  "deal": { /* updated deal with recalculated commission */ }
}
```

---

## 👥 User Management Endpoints

### Get All Users

**GET** `/users`

Get all users (requires authentication, Admin only).

**Query Parameters:**
- `role` - Filter by role (admin, broker, client)

**Response (200 OK):**
```json
{
  "users": [ /* array of users */ ]
}
```

---

### Get Pending Brokers

**GET** `/users/pending/brokers`

Get all pending broker applications (requires authentication, Admin only).

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": 5,
      "name": "New Broker",
      "email": "broker@example.com",
      "role": "broker",
      "status": "pending",
      "phone": "+971501234567"
    }
  ]
}
```

---

### Approve Broker

**POST** `/users/:id/approve`

Approve a pending broker (requires authentication, Admin only).

**Response (200 OK):**
```json
{
  "message": "User approved successfully",
  "user": { /* approved user */ }
}
```

---

### Reject Broker

**POST** `/users/:id/reject`

Reject a pending broker (requires authentication, Admin only).

**Response (200 OK):**
```json
{
  "message": "User rejected successfully",
  "user": { /* rejected user */ }
}
```

---

## 🏢 Company Endpoints

### Get All Companies

**GET** `/companies`

Get all companies (requires authentication).

**Response (200 OK):**
```json
{
  "success": true,
  "companies": [
    {
      "id": 1,
      "name": "AL RABEI Real Estate",
      "email": "info@alrabei.com",
      "phone": "+971501234567",
      "address": "Dubai, UAE"
    }
  ]
}
```

---

### Create Company

**POST** `/companies`

Create a new company (requires authentication, Admin only).

**Request Body:**
```json
{
  "name": "New Real Estate Company",
  "email": "info@newcompany.com",
  "phone": "+971501234567",
  "address": "Abu Dhabi, UAE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Company created successfully",
  "company": { /* company object */ }
}
```

---

## 🏥 Health Check Endpoints

### Basic Health Check

**GET** `/health`

Check if API is running.

**Response (200 OK):**
```json
{
  "status": "OK",
  "message": "AL RABEI Real Estate API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

---

### Detailed Health Check

**GET** `/health/detailed`

Get detailed system health information.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "uptime": {
    "seconds": 3600,
    "human": "1h 0m 0s"
  },
  "checks": {
    "database": {
      "status": "up",
      "responseTime": "5ms"
    },
    "uploads": {
      "status": "up"
    }
  },
  "system": {
    "platform": "linux",
    "nodeVersion": "v18.0.0",
    "memory": {
      "used": "150MB",
      "total": "200MB",
      "rss": "180MB"
    }
  },
  "responseTime": "10ms"
}
```

---

## ⚠️ Error Responses

All endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| AUTH_TOKEN_MISSING | 401 | No authentication token provided |
| AUTH_TOKEN_INVALID | 401 | Invalid authentication token |
| AUTH_TOKEN_EXPIRED | 401 | Authentication token expired |
| AUTHZ_INSUFFICIENT_PERMISSIONS | 403 | User doesn't have permission |
| VALIDATION_FAILED | 400 | Input validation failed |
| RESOURCE_NOT_FOUND | 404 | Resource not found |
| DATABASE_ERROR | 500 | Database operation failed |
| SERVER_ERROR | 500 | Internal server error |

---

## 📝 Notes

1. **Authentication**: Include JWT token in `Authorization: Bearer <token>` header
2. **Rate Limiting**: 100 requests per 15 minutes per IP
3. **File Uploads**: Maximum 100 images per property, 10MB per file
4. **Pagination**: Use `limit` parameter for pagination
5. **CORS**: Configured origins in environment variables

---

**For more information, see [README.md](README.md)**


