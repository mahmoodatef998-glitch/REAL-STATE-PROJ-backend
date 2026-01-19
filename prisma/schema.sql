-- =============================================
-- AL RABEI REAL ESTATE - Database Schema
-- =============================================
-- This SQL script creates all tables for the real estate platform
-- Date: January 2026

-- =============================================
-- Create Tables
-- =============================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'client',
  "status" TEXT NOT NULL DEFAULT 'approved',
  "phone" TEXT,
  "whatsapp" TEXT,
  "avatar" TEXT,
  "company_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Properties Table
CREATE TABLE IF NOT EXISTS "properties" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "type" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "price" INTEGER NOT NULL,
  "area_sqft" INTEGER,
  "bedrooms" INTEGER,
  "bathrooms" INTEGER,
  "emirate" TEXT NOT NULL,
  "location" TEXT,
  "images" TEXT,
  "features" TEXT,
  "owner_id" INTEGER,
  "company_id" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Leads Table
CREATE TABLE IF NOT EXISTS "leads" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "lead_name" TEXT NOT NULL,
  "email" TEXT NOT NULL DEFAULT '',
  "lead_phone" TEXT NOT NULL,
  "message" TEXT,
  "property_id" INTEGER,
  "broker_id" INTEGER,
  "company_id" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'new',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Agents Table
CREATE TABLE IF NOT EXISTS "agents" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "user_id" INTEGER NOT NULL UNIQUE,
  "specialization" TEXT,
  "experience_years" INTEGER,
  "bio" TEXT,
  "linkedin_url" TEXT,
  "instagram_url" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Companies Table
CREATE TABLE IF NOT EXISTS "companies" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "logo" TEXT,
  "website" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "address" TEXT,
  "owner_id" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Deals Table
CREATE TABLE IF NOT EXISTS "deals" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "property_id" INTEGER,
  "broker_id" INTEGER,
  "client_id" INTEGER,
  "company_id" INTEGER,
  "amount" INTEGER NOT NULL,
  "commission" DOUBLE PRECISION,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "deal_date" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. RefreshTokens Table
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "token" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Create Indexes for Performance
-- =============================================

-- Users Indexes
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");
CREATE INDEX IF NOT EXISTS "users_company_id_idx" ON "users"("company_id");

-- Properties Indexes
CREATE INDEX IF NOT EXISTS "properties_type_idx" ON "properties"("type");
CREATE INDEX IF NOT EXISTS "properties_emirate_idx" ON "properties"("emirate");
CREATE INDEX IF NOT EXISTS "properties_owner_id_idx" ON "properties"("owner_id");
CREATE INDEX IF NOT EXISTS "properties_company_id_idx" ON "properties"("company_id");
CREATE INDEX IF NOT EXISTS "properties_status_idx" ON "properties"("status");

-- Leads Indexes
CREATE INDEX IF NOT EXISTS "leads_broker_id_idx" ON "leads"("broker_id");
CREATE INDEX IF NOT EXISTS "leads_property_id_idx" ON "leads"("property_id");
CREATE INDEX IF NOT EXISTS "leads_status_idx" ON "leads"("status");

-- Agents Indexes
CREATE INDEX IF NOT EXISTS "agents_user_id_idx" ON "agents"("user_id");

-- Companies Indexes
CREATE INDEX IF NOT EXISTS "companies_owner_id_idx" ON "companies"("owner_id");

-- Deals Indexes
CREATE INDEX IF NOT EXISTS "deals_property_id_idx" ON "deals"("property_id");
CREATE INDEX IF NOT EXISTS "deals_broker_id_idx" ON "deals"("broker_id");
CREATE INDEX IF NOT EXISTS "deals_client_id_idx" ON "deals"("client_id");

-- RefreshTokens Indexes
CREATE INDEX IF NOT EXISTS "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- =============================================
-- Insert Sample Data (Optional)
-- =============================================

-- Insert Admin User
INSERT INTO "users" ("name", "email", "password", "role", "status", "phone", "whatsapp")
VALUES (
  'Admin Test',
  'admin@test.com',
  '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234', -- Hash example
  'admin',
  'approved',
  '+971501234567',
  '+971501234567'
)
ON CONFLICT("email") DO NOTHING;

-- Insert Broker User
INSERT INTO "users" ("name", "email", "password", "role", "status", "phone", "whatsapp")
VALUES (
  'أحمد الوسيط',
  'broker@test.com',
  '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234', -- Hash example
  'broker',
  'approved',
  '+971502345678',
  '+971502345678'
)
ON CONFLICT("email") DO NOTHING;

-- Insert Client User
INSERT INTO "users" ("name", "email", "password", "role", "status", "phone", "whatsapp")
VALUES (
  'محمد العميل',
  'client@test.com',
  '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234', -- Hash example
  'client',
  'approved',
  '+971503456789',
  '+971503456789'
)
ON CONFLICT("email") DO NOTHING;

-- =============================================
-- Sample Property Data
-- =============================================

INSERT INTO "properties" (
  "title", "description", "type", "purpose", "price", "area_sqft",
  "bedrooms", "bathrooms", "emirate", "location", "status", "features", "images"
)
VALUES
(
  'فيلا فاخرة في الإمارات',
  'فيلا حديثة بتصميم عصري مع حمام سباحة',
  'villa',
  'residential',
  2500000,
  5000,
  4,
  5,
  'Dubai',
  'Palm Jumeirah',
  'active',
  '["مسبح", "حديقة", "جراج", "مطبخ حديث"]',
  '["https://via.placeholder.com/400x300?text=Villa+1"]'
),
(
  'شقة فاخرة في دبي',
  'شقة بإطلالة على البحر',
  'apartment',
  'residential',
  1200000,
  2000,
  3,
  2,
  'Dubai',
  'Downtown Dubai',
  'active',
  '["مصعد", "موقف سيارات", "نادي رياضي"]',
  '["https://via.placeholder.com/400x300?text=Apartment+1"]'
),
(
  'مكتب تجاري في الشارقة',
  'مكتب بموقع متميز',
  'office',
  'commercial',
  800000,
  1500,
  0,
  2,
  'Sharjah',
  'Al Qasba',
  'active',
  '["مكيفات", "انترنت", "استقبال"]',
  '["https://via.placeholder.com/400x300?text=Office+1"]'
),
(
  'ارض سكنية في أبوظبي',
  'ارض بموقع استراتيجي',
  'land',
  'residential',
  1500000,
  10000,
  0,
  0,
  'Abu Dhabi',
  'Al Reef',
  'active',
  '["سهل الوصول", "قرب الخدمات"]',
  '["https://via.placeholder.com/400x300?text=Land+1"]'
),
(
  'محل تجاري في العين',
  'محل بسعر مميز',
  'commercial',
  'commercial',
  500000,
  800,
  0,
  1,
  'Al Ain',
  'City Center',
  'active',
  '["واجهة رئيسية", "تصريح تجاري"]',
  '["https://via.placeholder.com/400x300?text=Shop+1"]'
),
(
  'شقة استثمارية بعائد 7%',
  'شقة مفروشة للايجار اليومي',
  'apartment',
  'investment',
  650000,
  1200,
  2,
  1,
  'Dubai',
  'Marina',
  'active',
  '["مفروشة", "فرن بيتزا", "شرفة"]',
  '["https://via.placeholder.com/400x300?text=Investment+1"]'
)
ON CONFLICT DO NOTHING;

-- =============================================
-- End of Schema Script
-- =============================================
-- Created: January 17, 2026
-- Database: AL RABEI REAL ESTATE
-- Version: 1.0.0
