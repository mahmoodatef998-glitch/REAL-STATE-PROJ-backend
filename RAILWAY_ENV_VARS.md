# 🔐 Environment Variables لـ Railway

## 📋 المتغيرات المطلوبة

انسخ هذه المتغيرات وأضفها في Railway → Settings → Variables:

```env
# ============ Database (Supabase) ============
DATABASE_URL=postgresql://postgres:M00243540000m@db.yzeirccdvvshpygofnlg.supabase.co:5432/postgres?sslmode=require

# ============ Server Configuration ============
PORT=3050
NODE_ENV=production

# ============ Security ============
# ⚠️ مهم: استبدل هذا بمفتاح قوي (64+ حرف)
# لتوليد مفتاح: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
JWT_SECRET=CHANGE-THIS-TO-A-STRONG-64-CHARACTER-SECRET-KEY-MINIMUM-32-CHARS-REQUIRED

# ============ Frontend Configuration ============
# بعد نشر الفرونت إند على Vercel، أضف الرابط هنا
FRONTEND_URL=https://your-frontend.vercel.app

# CORS Origins (اختياري)
CORS_ORIGINS=https://your-frontend.vercel.app

# ============ Logging ============
LOG_LEVEL=info

# ============ Rate Limiting ============
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
```

---

## 🔧 كيفية إضافة المتغيرات في Railway

1. اذهب إلى Railway Dashboard
2. اختر المشروع
3. اضغط **Settings** → **Variables**
4. اضغط **+ New Variable**
5. أضف كل متغير على حدة:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://postgres:M00243540000m@db.yzeirccdvvshpygofnlg.supabase.co:5432/postgres?sslmode=require`
6. اضغط **Add**
7. كرر لكل متغير

---

## ⚠️ ملاحظات مهمة

### 1. JWT_SECRET
**مهم جداً**: استبدل `JWT_SECRET` بمفتاح قوي:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

انسخ الناتج واستخدمه كـ `JWT_SECRET`

### 2. FRONTEND_URL
بعد نشر الفرونت إند على Vercel:
1. احصل على الرابط (مثل: `https://real-state-proj.vercel.app`)
2. أضفه في `FRONTEND_URL`
3. أضفه أيضاً في `CORS_ORIGINS`

### 3. DATABASE_URL
- تأكد من إضافة `?sslmode=require` في النهاية
- لا توجد مسافات إضافية
- كلمة المرور صحيحة

---

## ✅ بعد إضافة المتغيرات

1. **Redeploy** المشروع في Railway
2. انتظر حتى يكتمل Build
3. اختبر: `https://your-backend.railway.app/api/health`

---

## 🔍 التحقق من المتغيرات

في Railway:
1. Settings → Variables
2. تأكد من وجود جميع المتغيرات
3. تأكد من القيم صحيحة

---

**⚠️ أمان**: لا تشارك هذه المتغيرات مع أحد!

