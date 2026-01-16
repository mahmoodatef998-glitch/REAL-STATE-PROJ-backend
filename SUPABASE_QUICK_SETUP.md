# ⚡ إعداد سريع: Supabase + Railway

## 🎯 الخطوات السريعة (5 دقائق)

### 1️⃣ إنشاء Supabase Project

1. اذهب إلى [supabase.com](https://supabase.com) → **New Project**
2. **Name**: `al-rabei-real-estate`
3. **Password**: اختر كلمة مرور قوية (احفظها!)
4. **Region**: اختر الأقرب
5. اضغط **Create new project**

### 2️⃣ الحصول على Database URL

1. بعد إنشاء المشروع → **Settings** → **Database**
2. انسخ **Connection string** → **URI**
3. أضف `?sslmode=require` في النهاية

**مثال**:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

### 3️⃣ نشر على Railway

1. اذهب إلى [railway.app](https://railway.app) → **New Project**
2. **Deploy from GitHub repo** → اختر `REAL-STATE-PROJ-backend`

### 4️⃣ إضافة Environment Variables

في Railway → **Settings** → **Variables**:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require
NODE_ENV=production
PORT=3050
JWT_SECRET=your-64-char-secret-key-here
FRONTEND_URL=https://your-frontend.vercel.app
LOG_LEVEL=info
RATE_LIMIT_MAX_REQUESTS=50
```

### 5️⃣ إعداد Build

- **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
- **Start Command**: `npm start`

### 6️⃣ Deploy ✅

Railway سيقوم بكل شيء تلقائياً!

---

## 🔍 التحقق

بعد النشر، اختبر:
```
https://your-backend.railway.app/api/health
```

يجب أن تحصل على:
```json
{"status":"ok","timestamp":"..."}
```

---

## 📝 ملاحظات

- ✅ Supabase Free tier: 500 MB Database
- ✅ Migrations تعمل تلقائياً عند Build
- ✅ لا حاجة لإعداد Database منفصل على Railway

---

**تم! 🎉**

