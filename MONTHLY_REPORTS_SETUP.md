# ✅ دليل التحقق من تطبيق نظام التقارير الشهرية

## 🔍 خطوة 1: تحقق من وجود الملفات

### افتح Command Prompt في مجلد backend وشغّل:

```bash
cd backend
VERIFY_INSTALLATION.bat
```

**يجب أن تظهر جميع الملفات [OK]**

---

## 🔄 خطوة 2: أعد تشغيل السيرفر

**مهم جداً!** السيرفر يجب إعادة تشغيله لتحميل الـ routes الجديدة.

```bash
# 1. أغلق السيرفر الحالي
#    اضغط Ctrl+C في نافذة السيرفر

# 2. أعد تشغيله
cd backend
npm run dev

# أو من المجلد الرئيسي
START_PROJECT.bat
```

---

## 🧪 خطوة 3: اختبر الـ APIs

### اختبار 1: بدون token (يجب أن يعمل)

افتح في المتصفح:
```
http://localhost:3050/api/health
```
**يجب أن يعمل ✅**

---

### اختبار 2: Test endpoint جديد (يحتاج token)

#### الطريقة A: من المتصفح (سيعطي 401 - طبيعي)
```
http://localhost:3050/api/reports/months
```
**إذا ظهر 401:** ✅ الـ endpoint موجود ويعمل (يحتاج token فقط)  
**إذا ظهر 404:** ❌ الـ endpoint غير محمّل

---

#### الطريقة B: باستخدام Postman أو curl

**أولاً: احصل على token:**

```bash
# Login كـ broker أو admin
POST http://localhost:3050/api/auth/login
Body: {
  "email": "broker@example.com",
  "password": "password"
}

# انسخ الـ token من الاستجابة
```

**ثانياً: اختبر التقارير:**

```bash
GET http://localhost:3050/api/reports/broker/monthly
Headers:
  Authorization: Bearer <token-هنا>
```

---

## 📊 اختبار كامل للوسيط

إذا كان لديك حساب broker، اختبر:

### 1. العمولة الشهرية:
```
GET /api/reports/broker/monthly
```

### 2. سجل 6 شهور:
```
GET /api/reports/broker/history?months=6
```

### 3. المقارنة:
```
GET /api/reports/broker/compare
```

### 4. فلترة الصفقات:
```
GET /api/deals/filter?month=2024-11
```

---

## 📊 اختبار كامل للأدمن

إذا كان لديك حساب admin:

### 1. دخل الشركة:
```
GET /api/reports/company/monthly?year=2024&month=11
```

### 2. سجل الشركة:
```
GET /api/reports/company/history?months=12
```

### 3. أداء الوسطاء:
```
GET /api/reports/brokers/performance?month=11
```

---

## 🐛 المشاكل الشائعة وحلولها

### المشكلة: "Cannot find module '../utils/dateHelper'"

**الحل:**
```bash
# تأكد من وجود الملف:
dir utils\dateHelper.js

# إذا غير موجود، أنشئه من MONTHLY_REPORTS_API.md
```

---

### المشكلة: "Cannot find module '../utils/logger'"

**الحل:**
```bash
# تأكد من وجود logger.js
dir utils\logger.js

# إذا غير موجود، أنشئه
```

---

### المشكلة: 404 Not Found على /api/reports

**الحل:**
```bash
# 1. تأكد من وجود routes/reports.js
dir routes\reports.js

# 2. تأكد من start-server.js فيه:
findstr "api/reports" start-server.js

# 3. أعد تشغيل السيرفر
npm run dev
```

---

### المشكلة: "prisma is not defined"

**الحل:**
```bash
# أعد توليد Prisma client
npm run prisma:generate

# ثم أعد تشغيل
npm run dev
```

---

## ✅ Checklist النهائي

قبل الاختبار، تأكد من:

- [ ] ✅ `utils/dateHelper.js` موجود
- [ ] ✅ `utils/commissionCalculator.js` موجود
- [ ] ✅ `utils/logger.js` موجود
- [ ] ✅ `routes/reports.js` موجود
- [ ] ✅ `start-server.js` فيه `/api/reports`
- [ ] ✅ `routes/deals.js` فيه endpoint `/filter`
- [ ] ✅ السيرفر تم إعادة تشغيله
- [ ] ✅ لا توجد أخطاء في Console

---

## 📞 إذا كل شيء صحيح

اختبر هذا في المتصفح (بعد تسجيل الدخول):

```javascript
// 1. سجل دخول كـ broker
// 2. خذ الـ token
// 3. افتح Postman أو أي HTTP client
// 4. اختبر:

GET http://localhost:3050/api/reports/broker/monthly
Authorization: Bearer <token>

// يجب أن يرجع:
{
  "success": true,
  "report": {
    "summary": {
      "totalBrokerShare": ...
    }
  }
}
```

---

**تم إنشاء هذا الدليل:** نوفمبر 2024  
**الحالة:** جاهز للاختبار

