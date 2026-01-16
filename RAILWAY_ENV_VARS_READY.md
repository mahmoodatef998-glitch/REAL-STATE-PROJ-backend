# 🚂 Railway Environment Variables - جاهزة للنسخ

## 📋 المتغيرات المطلوبة (انسخها كلها)

### ⚡ النسخة السريعة (للنسخ واللصق):

```env
DATABASE_URL=postgresql://postgres:M00243540000m@db.yzeirccdvvshpygofnlg.supabase.co:5432/postgres?sslmode=require
NODE_ENV=production
PORT=3050
JWT_SECRET=Fp58bASG4YpDhR73/TEXd1TaPFTaqm0A71N+xPlUwrA=
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ORIGINS=https://your-frontend.vercel.app
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/webp
```

---

## 📝 شرح كل متغير:

### 1. DATABASE_URL (مطلوب) ✅
```env
DATABASE_URL=postgresql://postgres:M00243540000m@db.yzeirccdvvshpygofnlg.supabase.co:5432/postgres?sslmode=require
```
- **ما هو**: رابط قاعدة البيانات Supabase
- **مطلوب**: نعم
- **ملاحظة**: جاهز للاستخدام

### 2. NODE_ENV (مطلوب) ✅
```env
NODE_ENV=production
```
- **ما هو**: بيئة التشغيل
- **مطلوب**: نعم
- **ملاحظة**: يجب أن يكون `production`

### 3. PORT (مطلوب) ✅
```env
PORT=3050
```
- **ما هو**: منفذ الـ Server
- **مطلوب**: نعم
- **ملاحظة**: Railway قد يغير المنفذ تلقائياً

### 4. JWT_SECRET (مطلوب) ✅
```env
JWT_SECRET=Fp58bASG4YpDhR73/TEXd1TaPFTaqm0A71N+xPlUwrA=
```
- **ما هو**: مفتاح التشفير للـ JWT Tokens
- **مطلوب**: نعم
- **ملاحظة**: تم توليده تلقائياً (آمن)

### 5. FRONTEND_URL (مطلوب - حدث بعد النشر) ⚠️
```env
FRONTEND_URL=https://your-frontend.vercel.app
```
- **ما هو**: رابط الفرونت إند
- **مطلوب**: نعم
- **ملاحظة**: **حدث هذا** بعد نشر الفرونت إند على Vercel

### 6. CORS_ORIGINS (اختياري - حدث بعد النشر) ⚠️
```env
CORS_ORIGINS=https://your-frontend.vercel.app
```
- **ما هو**: أصول CORS المسموحة
- **مطلوب**: لا (لكن موصى به)
- **ملاحظة**: **حدث هذا** بعد نشر الفرونت إند

### 7. LOG_LEVEL (اختياري) ✅
```env
LOG_LEVEL=info
```
- **ما هو**: مستوى الـ Logging
- **مطلوب**: لا
- **ملاحظة**: `info` مناسب للإنتاج

### 8. RATE_LIMIT_WINDOW_MS (اختياري) ✅
```env
RATE_LIMIT_WINDOW_MS=900000
```
- **ما هو**: نافذة Rate Limiting (15 دقيقة)
- **مطلوب**: لا
- **ملاحظة**: 900000 = 15 دقيقة

### 9. RATE_LIMIT_MAX_REQUESTS (اختياري) ✅
```env
RATE_LIMIT_MAX_REQUESTS=50
```
- **ما هو**: عدد الطلبات المسموحة
- **مطلوب**: لا
- **ملاحظة**: 50 طلب كل 15 دقيقة

### 10. MAX_FILE_SIZE (اختياري) ✅
```env
MAX_FILE_SIZE=10485760
```
- **ما هو**: الحد الأقصى لحجم الملف (10MB)
- **مطلوب**: لا
- **ملاحظة**: 10485760 = 10MB

### 11. ALLOWED_FILE_TYPES (اختياري) ✅
```env
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/webp
```
- **ما هو**: أنواع الملفات المسموحة
- **مطلوب**: لا
- **ملاحظة**: صور فقط

---

## 🔧 كيفية الإضافة في Railway:

### الطريقة 1: إضافة واحدة تلو الأخرى (موصى به)

1. اذهب إلى [Railway Dashboard](https://railway.app)
2. اختر المشروع
3. اضغط **Settings** → **Variables**
4. اضغط **+ New Variable**
5. لكل متغير:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://postgres:M00243540000m@db.yzeirccdvvshpygofnlg.supabase.co:5432/postgres?sslmode=require`
   - اضغط **Add**
6. كرر لكل متغير

### الطريقة 2: إضافة من ملف (إذا دعم Railway)

يمكنك نسخ كل المتغيرات من القائمة أعلاه.

---

## ⚠️ ملاحظات مهمة:

### 1. FRONTEND_URL و CORS_ORIGINS
- **قبل نشر الفرونت إند**: يمكنك تركها فارغة أو وضع placeholder
- **بعد نشر الفرونت إند**: **يجب تحديثها** برابط Vercel الفعلي

### 2. JWT_SECRET
- تم توليده تلقائياً وهو آمن
- لا تشاركه مع أحد
- لا تحفظه في Git

### 3. DATABASE_URL
- جاهز للاستخدام
- يحتوي على كلمة المرور
- آمن في Environment Variables

---

## ✅ Checklist بعد الإضافة:

- [ ] جميع المتغيرات المطلوبة مضافة
- [ ] JWT_SECRET موجود
- [ ] DATABASE_URL صحيح
- [ ] NODE_ENV=production
- [ ] بعد نشر الفرونت إند: حدث FRONTEND_URL
- [ ] بعد نشر الفرونت إند: حدث CORS_ORIGINS

---

## 🚀 بعد الإضافة:

1. **Redeploy** المشروع في Railway
2. انتظر حتى يكتمل Build
3. اختبر: `https://your-backend.railway.app/api/health`

---

**تم! 🎉**

