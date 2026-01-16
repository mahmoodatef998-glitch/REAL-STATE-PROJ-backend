# 🧪 اختبار نظام التقارير الشهرية

## ⚠️ خطوات مهمة قبل الاختبار

### 1. أعد تشغيل السيرفر
```bash
# أغلق السيرفر الحالي (Ctrl+C)
# ثم شغله من جديد:
cd backend
npm run dev
```

**مهم جداً:** السيرفر يجب إعادة تشغيله لتحميل الـ routes الجديدة!

---

## 🧪 اختبارات سريعة

### اختبار 1: تحقق من وجود الـ endpoint

```bash
# من المتصفح أو Postman
GET http://localhost:3050/api/reports/months
```

**إذا عمل:** ✅ الـ routes محملة بشكل صحيح  
**إذا فشل (404):** ❌ السيرفر يحتاج إعادة تشغيل

---

### اختبار 2: للوسيط - عمولة الشهر الحالي

```bash
# تحتاج token للوسيط
GET http://localhost:3050/api/reports/broker/monthly
Authorization: Bearer <broker-token>
```

**الاستجابة المتوقعة:**
```json
{
  "success": true,
  "report": {
    "summary": {
      "totalBrokerShare": 350000,
      "totalDeals": 15
    }
  }
}
```

---

### اختبار 3: للوسيط - عمولة شهر محدد

```bash
GET http://localhost:3050/api/reports/broker/monthly?year=2024&month=11
Authorization: Bearer <broker-token>
```

---

### اختبار 4: للوسيط - سجل آخر 6 شهور

```bash
GET http://localhost:3050/api/reports/broker/history?months=6
Authorization: Bearer <broker-token>
```

**الاستجابة المتوقعة:**
```json
{
  "success": true,
  "history": [
    { "year": 2024, "month": 11, "summary": {...} },
    { "year": 2024, "month": 10, "summary": {...} },
    { "year": 2024, "month": 9, "summary": {...} }
  ]
}
```

---

### اختبار 5: للأدمن - دخل الشركة الشهري

```bash
GET http://localhost:3050/api/reports/company/monthly?year=2024&month=11
Authorization: Bearer <admin-token>
```

**الاستجابة المتوقعة:**
```json
{
  "success": true,
  "report": {
    "summary": {
      "netIncome": 450000,
      "totalBrokerShare": 1050000,
      "totalDeals": 45
    }
  }
}
```

---

### اختبار 6: فلترة الصفقات حسب الشهر

```bash
GET http://localhost:3050/api/deals/filter?month=2024-11
Authorization: Bearer <token>
```

**الاستجابة المتوقعة:**
```json
{
  "success": true,
  "filters": {
    "month": "2024-11"
  },
  "deals": [...],
  "totals": {
    "totalDeals": 15,
    "totalBrokerShare": 350000
  }
}
```

---

## 🔍 فحص شامل للملفات

### تأكد من وجود جميع الملفات:

```bash
# من مجلد backend، شغل:
dir utils\dateHelper.js
dir utils\commissionCalculator.js
dir routes\reports.js
```

**يجب أن تظهر جميع الملفات!**

---

## 🐛 حل المشاكل

### مشكلة: 404 Not Found

**السبب:** السيرفر لم يحمّل الـ routes الجديدة  
**الحل:**
```bash
# 1. أغلق السيرفر (Ctrl+C)
# 2. أعد تشغيله:
cd backend
npm run dev
```

---

### مشكلة: Cannot find module

**السبب:** الملفات غير موجودة  
**الحل:** تأكد من وجود:
```
backend/
├── utils/
│   ├── dateHelper.js          ← يجب أن يكون موجود
│   └── commissionCalculator.js ← يجب أن يكون موجود
│
└── routes/
    └── reports.js              ← يجب أن يكون موجود
```

---

### مشكلة: Logger error

**السبب:** logger.js غير موجود  
**الحل:** تحقق من وجود `utils/logger.js`

---

## ✅ Checklist التحقق

- [ ] السيرفر يعمل (npm run dev)
- [ ] لا توجد أخطاء في Console
- [ ] الملفات موجودة (dateHelper, commissionCalculator, reports)
- [ ] start-server.js فيه السطر: `app.use('/api/reports', require('./routes/reports'))`
- [ ] deals.js فيه endpoint `/filter`

---

## 🧪 اختبار سريع من المتصفح

### 1. شغّل السيرفر:
```bash
cd backend
npm run dev
```

### 2. افتح في المتصفح:
```
http://localhost:3050/api/health
```
**يجب أن يعمل!**

### 3. اختبر الأشهر (بدون token):
```
http://localhost:3050/api/reports/months
```
**إذا ظهر خطأ 401:** عادي، الـ endpoint يحتاج token  
**إذا ظهر 404:** المشكلة أن الـ route غير محمّل

---

## 🔧 إعادة التحميل الكاملة

إذا استمرت المشاكل:

```bash
# 1. أغلق كل شيء
taskkill /F /IM node.exe

# 2. أعد التثبيت
cd backend
npm install

# 3. تأكد من Prisma
npm run prisma:generate

# 4. شغّل السيرفر
npm run dev
```

---

## 📞 إذا استمرت المشكلة

راسلني بالرسالة الظاهرة في Console عند تشغيل:
```bash
npm run dev
```

وأيضاً رسالة الخطأ عند محاولة الوصول إلى:
```
http://localhost:3050/api/reports/months
```

---

**تم إنشاء هذا الملف:** نوفمبر 2024

