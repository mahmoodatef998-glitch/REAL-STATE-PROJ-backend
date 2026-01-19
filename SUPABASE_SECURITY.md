# 🔐 Supabase Security Guide

## ⚠️ تحذيرات أمان مهمة

### Service Role Key (sb_secret_...)

**هذا المفتاح سري جداً!**

```
sb_secret_KrQ-fl2w96fZVPlQRdZ3kw_yQBBGhDd
```

#### ⚠️ ما هو Service Role Key؟
- يعطي **صلاحيات كاملة** لقاعدة البيانات
- يمكنه تجاوز Row Level Security (RLS)
- يمكنه قراءة وكتابة أي بيانات
- **خطير جداً** إذا تم تسريبه

#### ✅ متى تستخدمه؟
- في **الباك إند فقط**
- للعمليات الإدارية (Admin operations)
- للـ Migrations المعقدة
- **أبداً** في الفرونت إند

#### ❌ متى لا تستخدمه؟
- ❌ في الفرونت إند (Browser)
- ❌ في Environment Variables العامة
- ❌ في Client-side code
- ❌ في Public repositories

---

## 🔒 أفضل الممارسات

### 1. استخدام Service Role Key في الباك إند

#### الطريقة الصحيحة:
```javascript
// في الباك إند فقط (server-side)
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// استخدمه فقط للعمليات الإدارية
if (userRole === 'admin') {
  // استخدام Service Role Key
}
```

#### ❌ الطريقة الخاطئة:
```javascript
// ❌ لا تفعل هذا في الفرونت إند
const SUPABASE_KEY = 'sb_secret_...'; // خطير!
```

### 2. Environment Variables

#### ✅ في Railway (Backend):
```env
SUPABASE_SERVICE_ROLE_KEY=sb_secret_KrQ-fl2w96fZVPlQRdZ3kw_yQBBGhDd
```

#### ❌ في Vercel (Frontend):
```env
# ❌ لا تضيف Service Role Key هنا
# استخدم Publishable Key فقط (إذا احتجت)
NEXT_PUBLIC_SUPABASE_URL=https://yzeirccdvvshpygofnlg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ljBc39g9fjNYZpcNnDhKFg_e5fPhRxe
```

---

## 🛡️ حماية المفاتيح

### 1. لا تحفظ في Git
```gitignore
# .gitignore
.env
.env.local
.env.production
*.secret
```

### 2. استخدم Environment Variables
- ✅ Railway Environment Variables
- ✅ Vercel Environment Variables
- ✅ .env.local (محلياً فقط)

### 3. راجع الصلاحيات بانتظام
- تحقق من من لديه وصول إلى Environment Variables
- راجع Logs بانتظام
- استخدم Secrets Manager إذا أمكن

---

## 🔍 متى تحتاج Service Role Key؟

### حالات الاستخدام المشروعة:

1. **Admin Operations**
   ```javascript
   // حذف مستخدم (Admin only)
   if (user.role === 'admin') {
     // استخدام Service Role Key
   }
   ```

2. **Database Migrations**
   ```bash
   # في الباك إند فقط
   SUPABASE_SERVICE_ROLE_KEY=... npx prisma migrate deploy
   ```

3. **Bulk Operations**
   ```javascript
   // تحديثات جماعية (Admin only)
   ```

### حالات لا تحتاج Service Role Key:

- ✅ الاتصال العادي بقاعدة البيانات (استخدم DATABASE_URL)
- ✅ API calls العادية
- ✅ Authentication (استخدم JWT)
- ✅ CRUD operations العادية

---

## 🚨 إذا تم تسريب المفتاح

### الخطوات الفورية:

1. **إلغاء المفتاح فوراً**
   - اذهب إلى Supabase Dashboard
   - Settings → API
   - Regenerate Service Role Key

2. **مراجعة Logs**
   - تحقق من أي نشاط مشبوه
   - راجع Database access logs

3. **تغيير كلمة مرور Database**
   - Settings → Database
   - Reset Database Password

4. **مراجعة الصلاحيات**
   - تحقق من من لديه وصول
   - راجع Environment Variables

---

## 📋 Checklist الأمان

- [ ] Service Role Key في Environment Variables فقط
- [ ] لا يوجد في Git
- [ ] لا يوجد في Client-side code
- [ ] لا يوجد في Public repositories
- [ ] يستخدم فقط في الباك إند
- [ ] مراجعة الصلاحيات بانتظام
- [ ] Logs monitoring مفعل
- [ ] Database backups مفعلة

---

## 🔐 المفاتيح المختلفة

### 1. Publishable API Key (Anon Key)
```
sb_publishable_ljBc39g9fjNYZpcNnDhKFg_e5fPhRxe
```
- ✅ آمن للفرونت إند
- ✅ يمكن استخدامه في Browser
- ⚠️ محمي بـ Row Level Security (RLS)

### 2. Service Role Key
```
sb_secret_KrQ-fl2w96fZVPlQRdZ3kw_yQBBGhDd
```
- ⚠️ **سري جداً**
- ❌ للباك إند فقط
- ❌ لا يستخدم في Browser
- ⚠️ يتجاوز RLS

### 3. Database URL
```
postgresql://postgres:M00243540000m@db.yzeirccdvvshpygofnlg.supabase.co:5432/postgres?sslmode=require
```
- ✅ للباك إند فقط
- ✅ آمن في Environment Variables
- ⚠️ يحتوي على كلمة مرور

---

## 📚 موارد إضافية

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [API Keys Documentation](https://supabase.com/docs/guides/api/api-keys)

---

**⚠️ تذكر**: Service Role Key مثل مفتاح المنزل - احفظه في مكان آمن ولا تشاركه أبداً!


