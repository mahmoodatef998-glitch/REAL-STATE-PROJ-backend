# 🔐 Supabase Credentials & Configuration

## 📋 معلومات المشروع

### Project URL:
```
https://yzeirccdvvshpygofnlg.supabase.co
```

### Database URL (للباك إند):
```
postgresql://postgres:M00243540000m@db.yzeirccdvvshpygofnlg.supabase.co:5432/postgres?sslmode=require
```

### Publishable API Key (للفرونت إند - اختياري):
```
sb_publishable_ljBc39g9fjNYZpcNnDhKFg_e5fPhRxe
```

---

## 🎯 الاستخدام

### للباك إند (Railway):
استخدم **DATABASE_URL** فقط:

```env
DATABASE_URL=postgresql://postgres:M00243540000m@db.yzeirccdvvshpygofnlg.supabase.co:5432/postgres?sslmode=require
```

### للفرونت إند (Vercel):
استخدم **NEXT_PUBLIC_API_URL** (رابط الباك إند على Railway):

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
NEXT_PUBLIC_SITE_URL=https://your-frontend.vercel.app
```

**ملاحظة**: Publishable API Key غير مطلوب حالياً لأن الفرونت إند يتصل بالباك إند مباشرة.

---

## 🔍 الحصول على معلومات إضافية

### Service Role Key (للباك إند - إذا احتجت):
1. اذهب إلى Supabase Dashboard
2. Settings → API
3. انسخ **service_role** key (⚠️ سري جداً!)

### Connection Pooling URL (موصى به للإنتاج):
1. Settings → Database
2. Connection Pooling → Session mode
3. انسخ Connection String

---

## ⚠️ الأمان

### ✅ افعل:
- استخدم Environment Variables فقط
- احفظ هذه المعلومات في مكان آمن
- استخدم Connection Pooling للإنتاج

### ❌ لا تفعل:
- لا تحفظ في Git
- لا تشارك Service Role Key
- لا تستخدم في الكود مباشرة

---

## 📝 Railway Environment Variables

```env
DATABASE_URL=postgresql://postgres:M00243540000m@db.yzeirccdvvshpygofnlg.supabase.co:5432/postgres?sslmode=require
NODE_ENV=production
PORT=3050
JWT_SECRET=your-strong-secret-key
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## 📝 Vercel Environment Variables

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
NEXT_PUBLIC_SITE_URL=https://your-frontend.vercel.app
```

---

**⚠️ مهم**: لا تشارك هذه المعلومات مع أحد!

