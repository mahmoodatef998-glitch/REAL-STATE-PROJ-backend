# 🚂 Railway Environment Variables - SaaS Version

## 📋 المتغيرات المطلوبة للنشر على Railway

انسخ هذه المتغيرات وأضفها في Railway → Settings → Variables:

---

## ✅ المتغيرات الأساسية (مطلوبة)

```env
DATABASE_URL=postgresql://postgres.ofockovcnxfcuahvovwq:M00243540000m@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require
```

```env
NODE_ENV=production
```

```env
PORT=3050
```

```env
JWT_SECRET=your-strong-secret-key-minimum-64-characters-change-this-in-production-use-random-string
```

```env
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

---

## 📝 ملاحظات مهمة

### 1. DATABASE_URL
- ✅ استخدم **Connection Pooling URL** (الموجود أعلاه)
- ✅ تأكد من وجود `?sslmode=require` في النهاية
- ⚠️ **لا تشارك** هذا الرابط مع أحد

### 2. JWT_SECRET
- ⚠️ **غير هذا المفتاح** في الإنتاج!
- استخدم مفتاح قوي عشوائي (64+ حرف)
- يمكنك توليده باستخدام:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
  ```

### 3. FRONTEND_URL
- ضع رابط الواجهة الأمامية (Frontend)
- مثال: `https://al-rabei-real-estate.vercel.app`
- بدون `/` في النهاية

---

## 🔧 Build & Start Commands في Railway

### Build Command:
```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

### Start Command:
```bash
npm start
```

---

## 🧪 بعد النشر - اختبار

بعد النشر، اختبر:

1. **Health Check**:
   ```
   https://your-backend.railway.app/api/health
   ```

2. **Test Endpoint**:
   ```
   https://your-backend.railway.app/api/test
   ```

3. **Properties**:
   ```
   https://your-backend.railway.app/api/properties
   ```

---

## ⚠️ أمان

- ✅ لا تضع `config.env` أو `.env` في Git
- ✅ استخدم Environment Variables فقط في Railway
- ✅ لا تشارك JWT_SECRET أو DATABASE_URL مع أحد
- ✅ استخدم HTTPS فقط في الإنتاج

---

## 📊 الميزات الجديدة المضافة

- ✅ Multi-Tenancy (عزل البيانات بين الشركات)
- ✅ Subscription Management (إدارة الاشتراكات)
- ✅ Usage Tracking (تتبع الاستخدام)
- ✅ Plans (Free, Basic, Premium, Enterprise)
- ✅ Invoice System (نظام الفواتير)
- ✅ Tenant Isolation Middleware

---

**جاهز للنشر! 🚀**

