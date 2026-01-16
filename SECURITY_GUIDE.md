# 🔐 دليل الأمان (Security Guide)

**آخر تحديث:** يناير 2026  
**الإصدار:** 1.0.0

---

## 📋 المحتويات

- [معايير الأمان المطبقة](#معايير-الأمان-المطبقة)
- [أفضل الممارسات](#أفضل-الممارسات)
- [إدارة الأسرار](#إدارة-الأسرار)
- [قوائم الفحص](#قوائم-الفحص)
- [الاستجابة للحوادث](#الاستجابة-للحوادث)

---

## ✅ معايير الأمان المطبقة

### 1. **التشفير والمصادقة** 🔐

#### JWT (JSON Web Tokens)
- ✅ توقيع آمن للـ tokens
- ✅ مفتاح سري قوي (64+ حرف)
- ✅ انتهاء الصلاحية القياسي: 7 أيام
- ✅ Refresh tokens للجلسات الطويلة

```javascript
// مثال على إنشاء token آمن
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

#### كلمات المرور
- ✅ Bcrypt hashing (10 rounds)
- ✅ Salt عشوائي
- ✅ لا تُخزن على الإطلاق كـ plain text

```javascript
// Hashing امن:
const hash = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hash);
```

### 2. **CORS وCross-Origin** 🌐

#### السياسة الحالية
- ✅ Whitelist للـ origins المسموحة
- ✅ Credentials محدود
- ✅ Methods محدد (GET, POST, PUT, DELETE)
- ✅ Headers معروّف

```javascript
// Configuration آمن:
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

// لا تستخدم:
// ❌ CORS_ORIGINS=*
// ❌ Access-Control-Allow-Origin: *
```

### 3. **HTTP Security Headers** 🛡️

#### Helmet.js (تفعيل تلقائي)

| Header | الفائدة |
|--------|--------|
| `X-Content-Type-Options` | منع MIME sniffing |
| `X-Frame-Options` | منع Clickjacking |
| `X-XSS-Protection` | حماية XSS |
| `Strict-Transport-Security` | Force HTTPS (Production) |
| `Content-Security-Policy` | منع Inline scripts |

```javascript
// تلقائياً في start-server.js:
app.use(helmet({
  hsts: { maxAge: 31536000 },
  contentSecurityPolicy: { ... }
}));
```

### 4. **Rate Limiting** ⏱️

#### التحديد الحالي
```
- عام: 100 requests/15 دقائق
- Auth: 10 requests/15 دقائق
- الإنتاج: 50 requests/15 دقائق
```

#### الفائدة
- ✅ منع brute-force attacks
- ✅ حماية من DDoS
- ✅ تحسين الأداء

```javascript
// Limiter للـ Auth:
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many attempts'
});

app.use('/api/auth', authLimiter, authRoutes);
```

### 5. **مصادقة المستخدم** 👤

#### آلية التحقق
1. User يُسجل دخول
2. Backend يتحقق من الكلمة المرور
3. يُصدر JWT token
4. Frontend يحفظ الـ token
5. كل request يرسل الـ token في Header

```javascript
// في كل request محمي:
Authorization: Bearer <JWT_TOKEN>

// Backend يتحقق:
const user = jwt.verify(token, process.env.JWT_SECRET);
```

### 6. **التحقق من الإدخال (Validation)** ✔️

#### أدوات المستخدمة
- ✅ `express-validator` للـ Backend
- ✅ `Zod` للـ Frontend
- ✅ Prisma schema validation

```javascript
// مثال:
const { body, validationResult } = require('express-validator');

app.post('/api/properties', [
  body('title').notEmpty().isLength({ min: 3 }),
  body('price').isInt({ min: 0 }),
  body('email').isEmail()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ... معالجة آمنة
});
```

### 7. **SQL Injection Protection** 🛡️

#### الحماية من Prisma
- ✅ Parameterized queries (تلقائياً)
- ✅ لا يسمح بـ raw SQL بدون قيود
- ✅ Type-safe database access

```javascript
// ✅ آمن - Prisma يتعامل معه:
const user = await prisma.user.findUnique({
  where: { email: userInput.email }
});

// ❌ غير آمن - إياك:
const user = await prisma.$queryRaw(`
  SELECT * FROM users WHERE email = '${userInput.email}'
`);
```

### 8. **XSS Protection** 🛡️

#### الحماية المطبقة
- ✅ React escapes HTML بشكل تلقائي
- ✅ CSP (Content Security Policy)
- ✅ Input sanitization

```javascript
// ✅ آمن بشكل تلقائي في React:
<div>{userInput}</div>  // HTML escaped

// ❌ خطير:
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### 9. **Database Security** 🗄️

#### الإجراءات
- ✅ SSL/TLS connection
- ✅ Strong database password
- ✅ Least privilege principle
- ✅ Regular backups
- ✅ Encryption at rest

```env
# ✅ آمن:
DATABASE_URL=postgresql://user:strong_pass@host:5432/db?sslmode=require

# ❌ غير آمن:
DATABASE_URL=postgresql://postgres:password@localhost:5432/db
```

### 10. **File Upload Security** 📁

#### الحدود المطبقة
```env
MAX_FILE_SIZE=10485760          # 10MB
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/webp
```

#### الحماية
- ✅ فحص MIME type
- ✅ حد أقصى للحجم
- ✅ حفظ آمن
- ✅ منع execution

---

## 📚 أفضل الممارسات

### 1. **إدارة Secrets** 🔑

#### ✅ افعل هذا:
```bash
# توليد secret قوي
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# استخدام متغيرات البيئة
JWT_SECRET=<generated-strong-secret>

# إدارة في hosting platform
# Railway > Settings > Variables
# Render > Environment
```

#### ❌ لا تفعل هذا:
```javascript
// ❌ Hardcoded secrets
const JWT_SECRET = "my-secret-key";

// ❌ في git
git add config.env
git push

// ❌ في comments
// JWT_SECRET=actual-secret-key

// ❌ في logs
console.log('Secret:', JWT_SECRET);
```

### 2. **Dependency Management** 📦

```bash
# فحص الثغرات
npm audit

# إصلاح الثغرات
npm audit fix

# تحديث آمن
npm update

# تجميد الإصدارات
npm ci  # بدلاً من npm install
```

### 3. **HTTPS فقط** 🔒

```javascript
// في الإنتاج:
if (process.env.NODE_ENV === 'production') {
  // Force HTTPS
  // في Nginx:
  // return 301 https://$server_name$request_uri;
}

// في التطبيق:
// استخدم https:// دائماً
// لا تستخدم http:// في الإنتاج
```

### 4. **Monitoring والـ Logging** 📊

```javascript
// سجّل محاولات الوصول غير المصرح:
logger.warn('Unauthorized access attempt', {
  userId: req.userId,
  endpoint: req.path,
  ip: req.ip,
  timestamp: new Date()
});

// سجّل الأخطاء:
logger.error('Database error', {
  error: err.message,
  userId: req.userId,
  timestamp: new Date()
});
```

### 5. **Password Policy** 🔐

#### متطلبات قوية
```javascript
// الحد الأدنى:
- طول: 8 أحرف
- يحتوي: حروف + أرقام + رموز

// الموصى به:
- طول: 12+ أحرف
- يحتوي: uppercase + lowercase + digit + symbol
- لا يحتوي: dictionary words
```

---

## 🔑 إدارة الأسرار

### **Development (آمن نسبياً)**

```env
# في backend/config.env
JWT_SECRET=dev-only-change-this-min32chars1234567890
DATABASE_URL=postgresql://postgres:password@localhost:5432/al_rabei
```

### **Production (آمن تماماً)**

```bash
# الخطوة 1: توليد
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# الخطوة 2: إضافة في منصة الاستضافة
# لا تستخدم config.env في الإنتاج!

# Railway:
railway variables set JWT_SECRET=<secret>

# Render:
Environment > Add Variable

# Vercel:
Settings > Environment Variables
```

### **Git Safety**

```bash
# 1. تأكد من .gitignore
echo "config.env" >> .gitignore

# 2. إزالة من git
git rm --cached backend/config.env
git commit -m "Remove sensitive config"

# 3. تحقق
git status
# يجب أن لا يظهر config.env
```

---

## ✅ قوائم الفحص

### **Security Audit Checklist**

```
🔐 الأمان العام:
[ ] lا توجد أسرار في الكود
[ ] .gitignore محدّث
[ ] لا توجد hardcoded passwords
[ ] لا توجد API keys عامة
[ ] جميع endpoints محمية بـ auth

🔑 JWT وAuthentication:
[ ] JWT_SECRET قوي (64+ chars)
[ ] Expiration مُحدد (7 days)
[ ] Refresh tokens مُفعّل
[ ] Token validation يعمل
[ ] Logout يحذف الـ token

🌐 CORS والـ HTTP:
[ ] CORS محدود للـ domains
[ ] HTTPS فقط في الإنتاج
[ ] Security headers مُفعّلة
[ ] CSP محدد بشكل آمن
[ ] Rate limiting مُفعّل

📁 Files والـ Upload:
[ ] فحص MIME type
[ ] حد أقصى للحجم
[ ] حفظ آمن
[ ] لا يمكن execution

🗄️ Database:
[ ] SSL/TLS مُفعّل
[ ] Strong password
[ ] Least privilege
[ ] Backups تلقائية
[ ] Encryption at rest (اختياري)

📊 Monitoring:
[ ] Logging مُفعّل
[ ] Error tracking مُفعّل
[ ] Alerts مُفعّلة
[ ] Security logs موجود
```

### **Pre-Deployment Checklist**

```
قبل النشر:
[ ] npm audit - لا توجد ثغرات حرجة
[ ] جميع متغيرات البيئة محدّثة
[ ] HTTPS certificate جاهز
[ ] Database backups مُفعّل
[ ] Monitoring tools configured
[ ] لا توجد test data
[ ] لا توجد debug logs
```

---

## 🚨 الاستجابة للحوادث

### **إذا تسرّبت أسرار:**

```bash
# 1. غيّر السر فوراً:
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# 2. حدّث في جميع الأماكن:
# - Environment variables
# - Database
# - الـ Frontend

# 3. راجع الـ logs:
# - تحقق من استخدام غير مصرح
# - احذر من الأنشطة المريبة

# 4. أخبر المستخدمين:
# - أرسل بريد أمان
# - اطلب تغيير كلمات السر
```

### **إذا حدثت مخالفة:**

```bash
# 1. إيقاف الخدمة فوراً:
# - استدع الدعم الفني
# - ابحث عن مصدر المشكلة

# 2. تحقق من الـ logs:
# - ابحث عن النشاط المريب
# - احفظ الأدلة

# 3. أصلح الثغرة:
# - طبّق الإصلاح
# - اختبره

# 4. أخبر المستخدمين:
# - اشرح ما حدث
# - قدم الحل
```

---

## 📞 الموارد الإضافية

### **مواقع مفيدة**

- 🌐 OWASP Top 10: https://owasp.org/www-project-top-ten/
- 🌐 Node.js Security: https://nodejs.org/en/docs/guides/security/
- 🌐 JWT Best Practices: https://tools.ietf.org/html/rfc8725
- 🌐 NIST Guidelines: https://www.nist.gov/

### **أدوات فحص**

```bash
# فحص الثغرات:
npm audit

# فحص الأسرار:
npm install --save-dev git-secrets
git secrets --install

# فحص الـ Code:
npm run lint
```

---

**آخر تحديث:** يناير 2026  
**الحالة:** محدّث ✅  
**المسؤول:** Development Team
