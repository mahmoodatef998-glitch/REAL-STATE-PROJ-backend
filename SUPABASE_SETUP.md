# 🔧 إعداد Supabase Database

## 📋 معلومات الاتصال

### DATABASE_URL الكامل:
```
postgresql://postgres:M00243540000m@db.yzeirccdvvshpygofnlg.supabase.co:5432/postgres?sslmode=require
```

---

## ⚠️ ملاحظات مهمة

### 1. Connection Pooling (موصى به للإنتاج)

Supabase يوفر نوعين من الاتصال:

#### Direct Connection (للتطوير المحلي):
```
postgresql://postgres:M00243540000m@db.yzeirccdvvshpygofnlg.supabase.co:5432/postgres?sslmode=require
```

#### Connection Pooling (للإنتاج - موصى به):
في Supabase Dashboard:
1. Settings → Database
2. Connection Pooling → Session mode
3. انسخ Connection String

سيبدو هكذا:
```
postgresql://postgres.yzeirccdvvshpygofnlg:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require
```

**ملاحظة**: Port يتغير من `5432` إلى `6543` في Connection Pooling

---

## 🔍 حل مشاكل الاتصال

### المشكلة: "Can't reach database server"

#### الحل 1: تأكد من أن Supabase Project جاهز
- انتظر 2-3 دقائق بعد إنشاء المشروع
- تأكد من أن Status = "Active" في Dashboard

#### الحل 2: تحقق من IP Whitelist
1. اذهب إلى Supabase Dashboard
2. Settings → Database → Network Restrictions
3. أضف IP Address الخاص بك (أو اتركه مفتوحاً للاختبار)

#### الحل 3: استخدم Connection Pooling
- Connection Pooling أكثر استقراراً
- أفضل للإنتاج

#### الحل 4: تحقق من كلمة المرور
- تأكد من أن كلمة المرور صحيحة
- لا توجد مسافات إضافية

---

## 🧪 اختبار الاتصال

### الطريقة 1: من Supabase Dashboard
1. اذهب إلى SQL Editor
2. شغل query بسيط:
   ```sql
   SELECT version();
   ```

### الطريقة 2: من Command Line (psql)
```bash
psql "postgresql://postgres:M00243540000m@db.yzeirccdvvshpygofnlg.supabase.co:5432/postgres?sslmode=require"
```

### الطريقة 3: من Node.js/Prisma
```bash
cd backend
$env:DATABASE_URL="postgresql://postgres:M00243540000m@db.yzeirccdvvshpygofnlg.supabase.co:5432/postgres?sslmode=require"
npx prisma db pull
```

---

## 🚀 إعداد المشروع

### الخطوة 1: تعيين DATABASE_URL

#### على Windows (PowerShell):
```powershell
cd backend
$env:DATABASE_URL="postgresql://postgres:M00243540000m@db.yzeirccdvvshpygofnlg.supabase.co:5432/postgres?sslmode=require"
```

#### على Mac/Linux:
```bash
cd backend
export DATABASE_URL="postgresql://postgres:M00243540000m@db.yzeirccdvvshpygofnlg.supabase.co:5432/postgres?sslmode=require"
```

### الخطوة 2: Generate Prisma Client
```bash
npx prisma generate
```

### الخطوة 3: تشغيل Migrations
```bash
npx prisma migrate deploy
```

---

## 📝 إعداد Railway

عند النشر على Railway، أضف في Environment Variables:

```env
DATABASE_URL=postgresql://postgres:M00243540000m@db.yzeirccdvvshpygofnlg.supabase.co:5432/postgres?sslmode=require
```

**⚠️ مهم**: 
- لا تحفظ كلمة المرور في Git
- استخدم Environment Variables فقط
- في Railway، أضفها في Settings → Variables

---

## 🔐 الأمان

### ⚠️ لا تفعل:
- ❌ لا تحفظ DATABASE_URL في ملفات Git
- ❌ لا تشارك كلمة المرور
- ❌ لا تستخدم Direct Connection في الإنتاج (استخدم Pooling)

### ✅ افعل:
- ✅ استخدم Environment Variables
- ✅ استخدم Connection Pooling للإنتاج
- ✅ احفظ كلمة المرور في مكان آمن
- ✅ استخدم `.env` محلياً (مضاف في .gitignore)

---

## 📊 Supabase Dashboard Features

### 1. Table Editor
- عرض وتعديل البيانات
- **Table Editor** → اختر الجدول

### 2. SQL Editor
- تشغيل queries
- **SQL Editor** → اكتب SQL

### 3. Database Backups
- تلقائية يومياً
- **Settings** → **Database** → **Backups**

---

## ✅ Checklist

- [ ] Supabase Project نشط
- [ ] DATABASE_URL صحيح مع `?sslmode=require`
- [ ] Prisma Client generated
- [ ] Migrations تم تشغيلها
- [ ] اختبار الاتصال نجح
- [ ] Environment Variables مضبوطة على Railway

---

## 🆘 إذا استمرت المشكلة

1. **تحقق من Supabase Status**: 
   - Dashboard → Settings → Database
   - تأكد من أن Status = "Active"

2. **جرب Connection Pooling**:
   - Settings → Database → Connection Pooling
   - استخدم Session mode

3. **تحقق من Network**:
   - Settings → Database → Network Restrictions
   - تأكد من عدم وجود قيود

4. **راجع Logs**:
   - Supabase Dashboard → Logs
   - ابحث عن أخطاء الاتصال

---

**تم إنشاء هذا الملف بواسطة AI Assistant** 🤖

