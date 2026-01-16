# 🚀 نشر الباك إند على Supabase

دليل شامل لنشر الباك إند باستخدام Supabase للـ Database.

## 📋 الخيارات المتاحة

### الخيار 1: Supabase Database + Railway/Vercel للـ Backend (موصى به)
- ✅ Supabase للـ Database (PostgreSQL)
- ✅ Railway أو Vercel للـ Backend API
- ✅ أفضل أداء واستقرار

### الخيار 2: Supabase Database فقط
- ✅ Supabase للـ Database
- ✅ نشر الـ Backend على أي platform (Railway, Render, Heroku, etc.)

---

## 🗄️ إعداد Supabase Database

### الخطوة 1: إنشاء مشروع Supabase

1. اذهب إلى [Supabase](https://supabase.com)
2. سجل دخولك أو أنشئ حساب جديد
3. اضغط **"New Project"**
4. املأ البيانات:
   - **Name**: `al-rabei-real-estate`
   - **Database Password**: اختر كلمة مرور قوية (احفظها!)
   - **Region**: اختر الأقرب لك (مثلاً: `Middle East (Bahrain)`)
   - **Pricing Plan**: Free (للبداية)

### الخطوة 2: الحصول على Database URL

1. بعد إنشاء المشروع، اذهب إلى **Settings** → **Database**
2. ابحث عن **Connection string** → **URI**
3. انسخ الـ Connection String (سيبدو هكذا):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

### الخطوة 3: تحديث DATABASE_URL

أضف `?sslmode=require` في النهاية:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

**مهم**: استبدل `[YOUR-PASSWORD]` بكلمة المرور التي اخترتها.

---

## 🔧 إعداد المشروع

### الخطوة 1: تحديث Prisma Schema

الـ schema جاهز بالفعل! تأكد من أن `prisma/schema.prisma` يحتوي على:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### الخطوة 2: تشغيل Migrations

#### محلياً (للتجربة):

```bash
cd backend

# تعيين DATABASE_URL
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require"

# Generate Prisma Client
npx prisma generate

# تشغيل Migrations
npx prisma migrate deploy
```

#### على Windows (PowerShell):

```powershell
cd backend

# تعيين DATABASE_URL
$env:DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require"

# Generate Prisma Client
npx prisma generate

# تشغيل Migrations
npx prisma migrate deploy
```

---

## 🚂 نشر Backend على Railway (مع Supabase Database)

### الخطوة 1: ربط المشروع

1. اذهب إلى [Railway](https://railway.app)
2. **New Project** → **Deploy from GitHub repo**
3. اختر: `REAL-STATE-PROJ-backend`

### الخطوة 2: إضافة Environment Variables

في **Settings** → **Variables**، أضف:

```env
# Database (من Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require

# Server
PORT=3050
NODE_ENV=production

# Security
JWT_SECRET=your-strong-secret-key-min-64-chars

# Frontend (بعد نشر الفرونت إند)
FRONTEND_URL=https://your-frontend.vercel.app

# CORS
CORS_ORIGINS=https://your-frontend.vercel.app

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
```

### الخطوة 3: إعداد Build & Deploy

- **Root Directory**: `/` (أو اتركه فارغاً)
- **Build Command**: 
  ```bash
  npm install && npx prisma generate && npx prisma migrate deploy
  ```
- **Start Command**: 
  ```bash
  npm start
  ```

### الخطوة 4: Deploy

Railway سيقوم بـ:
1. تثبيت Dependencies
2. Generate Prisma Client
3. تشغيل Migrations
4. تشغيل الـ Server

---

## 🌐 نشر Backend على Vercel (مع Supabase Database)

### الخطوة 1: إعداد Vercel

1. اذهب إلى [Vercel](https://vercel.com)
2. **Add New** → **Project**
3. اختر: `REAL-STATE-PROJ-backend`
4. **Framework Preset**: Other

### الخطوة 2: إعدادات Build

- **Root Directory**: `backend` (إذا كان الريبو يحتوي على frontend أيضاً)
- **Build Command**: 
  ```bash
  npm install && npx prisma generate && npx prisma migrate deploy
  ```
- **Output Directory**: (اتركه فارغاً)
- **Install Command**: `npm install`

### الخطوة 3: Environment Variables

أضف نفس المتغيرات المذكورة أعلاه.

### الخطوة 4: إنشاء `vercel.json`

أنشئ ملف `vercel.json` في جذر الريبو:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "start-server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "start-server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## 🔍 التحقق من الإعداد

### 1. اختبار الاتصال بقاعدة البيانات

في Supabase Dashboard:
- اذهب إلى **SQL Editor**
- شغل query بسيط:
  ```sql
  SELECT * FROM users LIMIT 1;
  ```

### 2. اختبار الـ API

بعد النشر، اختبر:
```
https://your-backend.railway.app/api/health
```

يجب أن تحصل على:
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX..."
}
```

---

## 📊 Supabase Dashboard Features

### 1. Table Editor
- عرض وتعديل البيانات مباشرة
- **Table Editor** → اختر الجدول

### 2. SQL Editor
- تشغيل queries مخصصة
- **SQL Editor** → اكتب SQL

### 3. Database Backups
- تلقائية يومياً
- **Settings** → **Database** → **Backups**

### 4. Connection Pooling
- **Settings** → **Database** → **Connection Pooling**
- استخدم **Session mode** للـ Prisma

---

## 🔐 الأمان

### 1. Database Password
- احفظ كلمة المرور في مكان آمن
- استخدم Environment Variables فقط

### 2. Row Level Security (RLS)
- Supabase يدعم RLS
- يمكن تفعيله لاحقاً إذا احتجت

### 3. API Keys
- لا تحتاج Supabase API Keys للـ Backend
- استخدم `DATABASE_URL` فقط

---

## 🐛 Troubleshooting

### مشكلة: Connection Refused
**الحل**: تأكد من إضافة `?sslmode=require` في `DATABASE_URL`

### مشكلة: Migrations Failed
**الحل**: 
```bash
npx prisma migrate reset  # احذر: سيحذف البيانات!
npx prisma migrate deploy
```

### مشكلة: Prisma Client Not Generated
**الحل**:
```bash
npx prisma generate
```

### مشكلة: SSL Required
**الحل**: تأكد من `?sslmode=require` في `DATABASE_URL`

---

## 📝 ملاحظات مهمة

1. **Free Tier Limits**:
   - 500 MB Database
   - 2 GB Bandwidth
   - 50,000 Monthly Active Users

2. **Connection Limits**:
   - Supabase Free: 60 connections
   - استخدم Connection Pooling إذا احتجت

3. **Backups**:
   - Free tier: Daily backups (7 days retention)
   - Paid: Point-in-time recovery

4. **Performance**:
   - Supabase سريع جداً
   - مناسب للمشاريع الصغيرة والمتوسطة

---

## ✅ Checklist قبل النشر

- [ ] إنشاء Supabase Project
- [ ] نسخ `DATABASE_URL` مع `?sslmode=require`
- [ ] تشغيل `npx prisma generate` محلياً
- [ ] تشغيل `npx prisma migrate deploy` محلياً
- [ ] اختبار الاتصال بقاعدة البيانات
- [ ] إضافة Environment Variables على Railway/Vercel
- [ ] نشر الـ Backend
- [ ] اختبار `/api/health` endpoint
- [ ] ربط الفرونت إند بالباك إند

---

## 🎉 بعد النشر

1. احصل على Backend URL من Railway/Vercel
2. حدث `NEXT_PUBLIC_API_URL` في Vercel (للفرونت إند)
3. اختبر التكامل الكامل

---

## 📚 روابط مفيدة

- [Supabase Docs](https://supabase.com/docs)
- [Prisma + Supabase](https://www.prisma.io/docs/guides/database/postgresql)
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)

---

**تم إنشاء هذا الدليل بواسطة AI Assistant** 🤖

