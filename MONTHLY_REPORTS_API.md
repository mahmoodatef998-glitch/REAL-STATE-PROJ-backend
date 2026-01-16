# 📊 Monthly Reports & Commission API Documentation

## نظام التقارير الشهرية والعمولات

تم إضافة نظام كامل لحساب العمولات الشهرية وتقارير الدخل للأدمن والوسطاء.

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [للوسطاء (Brokers)](#للوسطاء-brokers)
3. [للأدمن (Admin)](#للأدمن-admin)
4. [فلترة الصفقات](#فلترة-الصفقات)
5. [أمثلة عملية](#أمثلة-عملية)

---

## 🎯 نظرة عامة

### الميزات الجديدة:

**للوسطاء:**
- ✅ حساب العمولة الشهرية
- ✅ سجل تاريخي لجميع الشهور
- ✅ مقارنة الشهر الحالي بالسابق
- ✅ إحصائيات تفصيلية

**للأدمن:**
- ✅ حساب صافي الدخل الشهري
- ✅ فلترة العمليات حسب الشهر
- ✅ أداء جميع الوسطاء
- ✅ تقارير الشركة الشهرية

---

## 🔌 للوسطاء (Brokers)

### 1. الحصول على العمولة الشهرية

**GET** `/api/reports/broker/monthly`

الحصول على تقرير العمولة لشهر محدد.

**Query Parameters:**
- `year` (optional) - السنة (default: السنة الحالية)
- `month` (optional) - الشهر 1-12 (default: الشهر الحالي)
- `brokerId` (optional, admin only) - معرف الوسيط

**مثال للطلب (Broker):**
```http
GET /api/reports/broker/monthly?year=2024&month=3
Authorization: Bearer <token>
```

**مثال للطلب (Admin):**
```http
GET /api/reports/broker/monthly?year=2024&month=3&brokerId=5
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "report": {
    "brokerId": 5,
    "year": 2024,
    "month": 3,
    "period": {
      "startDate": "2024-03-01T00:00:00.000Z",
      "endDate": "2024-03-31T23:59:59.999Z"
    },
    "summary": {
      "totalDeals": 15,
      "totalDealValue": 25000000,
      "totalCommission": 500000,
      "totalBrokerShare": 350000,
      "approvedCommission": 280000,
      "pendingCommission": 70000,
      "averageDealValue": 1666666.67,
      "averageCommission": 23333.33
    },
    "breakdown": {
      "byStatus": {
        "open": 5,
        "closed": 8,
        "cancelled": 2
      },
      "byType": {
        "sale": 12,
        "rent": 3
      }
    },
    "deals": [
      {
        "id": 123,
        "property": {
          "id": 45,
          "title": "Luxury Villa",
          "type": "villa"
        },
        "clientName": "Ahmed Mohammed",
        "dealType": "sale",
        "dealValue": 5000000,
        "brokerShare": 70000,
        "commissionApproved": true,
        "status": "closed",
        "createdAt": "2024-03-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

### 2. سجل العمولات (جميع الشهور)

**GET** `/api/reports/broker/history`

الحصول على سجل العمولات لعدة أشهر.

**Query Parameters:**
- `brokerId` (optional, admin only) - معرف الوسيط
- `months` (optional) - عدد الأشهر (default: 12)

**مثال:**
```http
GET /api/reports/broker/history?months=6
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "brokerId": 5,
  "months": 6,
  "history": [
    {
      "brokerId": 5,
      "year": 2024,
      "month": 11,
      "summary": {
        "totalDeals": 10,
        "totalBrokerShare": 250000
      }
    },
    {
      "brokerId": 5,
      "year": 2024,
      "month": 10,
      "summary": {
        "totalDeals": 12,
        "totalBrokerShare": 300000
      }
    },
    {
      "brokerId": 5,
      "year": 2024,
      "month": 9,
      "summary": {
        "totalDeals": 8,
        "totalBrokerShare": 180000
      }
    }
  ]
}
```

---

### 3. مقارنة الشهر الحالي بالسابق

**GET** `/api/reports/broker/compare`

مقارنة أداء الشهر الحالي مع الشهر السابق.

**Query Parameters:**
- `brokerId` (optional, admin only) - معرف الوسيط

**مثال:**
```http
GET /api/reports/broker/compare
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "brokerId": 5,
  "comparison": {
    "current": {
      "year": 2024,
      "month": 11,
      "summary": {
        "totalDeals": 15,
        "totalBrokerShare": 350000
      }
    },
    "previous": {
      "year": 2024,
      "month": 10,
      "summary": {
        "totalDeals": 12,
        "totalBrokerShare": 300000
      }
    },
    "change": {
      "deals": 3,
      "dealValue": 5000000,
      "commission": 50000,
      "dealsPercent": 25,
      "commissionPercent": 16.67
    }
  }
}
```

---

## 👨‍💼 للأدمن (Admin)

### 1. التقرير الشهري للشركة

**GET** `/api/reports/company/monthly`

حساب صافي الدخل الشهري والإحصائيات الكاملة.

**Query Parameters:**
- `year` (optional) - السنة
- `month` (optional) - الشهر
- `companyId` (optional) - معرف الشركة

**مثال:**
```http
GET /api/reports/company/monthly?year=2024&month=3
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "report": {
    "companyId": 1,
    "year": 2024,
    "month": 3,
    "period": {
      "startDate": "2024-03-01T00:00:00.000Z",
      "endDate": "2024-03-31T23:59:59.999Z"
    },
    "summary": {
      "totalDeals": 45,
      "totalDealValue": 75000000,
      "totalCommission": 1500000,
      "totalCompanyShare": 450000,
      "totalBrokerShare": 1050000,
      "netIncome": 450000,
      "averageDealValue": 1666666.67,
      "averageCommission": 33333.33,
      "profitMargin": 0.6
    },
    "breakdown": {
      "byStatus": {
        "open": 15,
        "closed": 25,
        "cancelled": 5
      },
      "byType": {
        "sale": 35,
        "rent": 10
      }
    },
    "topBrokers": [
      {
        "broker": {
          "id": 5,
          "name": "Ahmed Ali",
          "email": "ahmed@example.com"
        },
        "totalDeals": 15,
        "totalDealValue": 25000000,
        "totalCommission": 500000,
        "brokerShare": 350000,
        "companyShare": 150000
      },
      {
        "broker": {
          "id": 7,
          "name": "Sara Mohammed",
          "email": "sara@example.com"
        },
        "totalDeals": 12,
        "totalDealValue": 20000000,
        "totalCommission": 400000,
        "brokerShare": 280000,
        "companyShare": 120000
      }
    ]
  }
}
```

---

### 2. سجل دخل الشركة (جميع الشهور)

**GET** `/api/reports/company/history`

سجل الدخل الشهري للشركة لعدة أشهر.

**Query Parameters:**
- `companyId` (optional) - معرف الشركة
- `months` (optional) - عدد الأشهر (default: 12)

**مثال:**
```http
GET /api/reports/company/history?months=12
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "companyId": 1,
  "months": 12,
  "history": [
    {
      "year": 2024,
      "month": 11,
      "summary": {
        "totalDeals": 45,
        "netIncome": 450000
      }
    },
    {
      "year": 2024,
      "month": 10,
      "summary": {
        "totalDeals": 40,
        "netIncome": 380000
      }
    }
  ]
}
```

---

### 3. أداء جميع الوسطاء

**GET** `/api/reports/brokers/performance`

تقرير شامل لأداء جميع الوسطاء في شهر محدد.

**Query Parameters:**
- `year` (optional) - السنة
- `month` (optional) - الشهر
- `companyId` (optional) - معرف الشركة

**مثال:**
```http
GET /api/reports/brokers/performance?year=2024&month=11
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "year": 2024,
  "month": 11,
  "topBrokers": [
    {
      "broker": {
        "id": 5,
        "name": "Ahmed Ali",
        "email": "ahmed@example.com"
      },
      "totalDeals": 15,
      "totalDealValue": 25000000,
      "brokerShare": 350000
    }
  ],
  "summary": {
    "totalBrokers": 10,
    "totalDeals": 45,
    "totalCommission": 1500000,
    "averagePerBroker": 150000
  }
}
```

---

### 4. Dashboard Summary

**GET** `/api/reports/dashboard`

ملخص Dashboard للشهر الحالي (للوسيط أو الأدمن).

**مثال:**
```http
GET /api/reports/dashboard
Authorization: Bearer <token>
```

**Response للوسيط:**
```json
{
  "success": true,
  "currentMonth": {
    "year": 2024,
    "month": 11
  },
  "broker": {
    "summary": {
      "totalDeals": 15,
      "totalBrokerShare": 350000
    },
    "comparison": {
      "deals": 3,
      "commission": 50000,
      "commissionPercent": 16.67
    }
  },
  "company": null
}
```

**Response للأدمن:**
```json
{
  "success": true,
  "currentMonth": {
    "year": 2024,
    "month": 11
  },
  "broker": null,
  "company": {
    "summary": {
      "totalDeals": 45,
      "netIncome": 450000,
      "totalCommission": 1500000
    }
  }
}
```

---

## 🔍 فلترة الصفقات

### فلترة الصفقات حسب التاريخ/الشهر

**GET** `/api/deals/filter`

فلترة الصفقات حسب التاريخ والشهر.

**Query Parameters:**
- `month` (optional) - الشهر بصيغة YYYY-MM (مثال: 2024-03)
- `startDate` (optional) - تاريخ البداية (YYYY-MM-DD)
- `endDate` (optional) - تاريخ النهاية (YYYY-MM-DD)
- `brokerId` (optional) - معرف الوسيط
- `companyId` (optional) - معرف الشركة
- `status` (optional) - الحالة (open, closed, cancelled)

**مثال 1: فلترة حسب الشهر**
```http
GET /api/deals/filter?month=2024-03
Authorization: Bearer <token>
```

**مثال 2: فلترة حسب نطاق تاريخ**
```http
GET /api/deals/filter?startDate=2024-03-01&endDate=2024-03-31
Authorization: Bearer <token>
```

**مثال 3: فلترة شهر معين لوسيط معين**
```http
GET /api/deals/filter?month=2024-03&brokerId=5&status=closed
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "filters": {
    "month": "2024-03",
    "brokerId": 5,
    "status": "closed"
  },
  "deals": [
    {
      "id": 123,
      "property": { },
      "broker": { },
      "dealValue": 5000000,
      "brokerShare": 70000,
      "status": "closed"
    }
  ],
  "totals": {
    "totalDeals": 15,
    "totalDealValue": 25000000,
    "totalBrokerShare": 350000,
    "totalCompanyShare": 150000,
    "byStatus": {
      "closed": 15
    },
    "byType": {
      "sale": 12,
      "rent": 3
    }
  }
}
```

---

### الحصول على قائمة الأشهر المتاحة

**GET** `/api/reports/months`

الحصول على قائمة الأشهر المتاحة.

**Query Parameters:**
- `count` (optional) - عدد الأشهر (default: 12)

**مثال:**
```http
GET /api/reports/months?count=6
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 6,
  "months": [
    {
      "year": 2024,
      "month": 11,
      "label": "November 2024",
      "labelAr": "نوفمبر 2024"
    },
    {
      "year": 2024,
      "month": 10,
      "label": "October 2024",
      "labelAr": "أكتوبر 2024"
    },
    {
      "year": 2024,
      "month": 9,
      "label": "September 2024",
      "labelAr": "سبتمبر 2024"
    }
  ]
}
```

---

## 💡 أمثلة عملية

### مثال 1: وسيط يريد معرفة عمولته في مارس 2024

```javascript
// Request
GET /api/reports/broker/monthly?year=2024&month=3
Authorization: Bearer <broker-token>

// Response
{
  "success": true,
  "report": {
    "summary": {
      "totalBrokerShare": 350000,  // العمولة الإجمالية
      "approvedCommission": 280000, // المعتمدة
      "pendingCommission": 70000    // المعلقة
    }
  }
}
```

---

### مثال 2: أدمن يريد معرفة صافي الدخل لشهر معين

```javascript
// Request
GET /api/reports/company/monthly?year=2024&month=3
Authorization: Bearer <admin-token>

// Response
{
  "success": true,
  "report": {
    "summary": {
      "totalDealValue": 75000000,    // إجمالي قيمة الصفقات
      "totalCommission": 1500000,    // إجمالي العمولات
      "netIncome": 450000,           // صافي الدخل للشركة (30%)
      "totalBrokerShare": 1050000    // نصيب الوسطاء (70%)
    }
  }
}
```

---

### مثال 3: أدمن يريد مقارنة أداء الوسطاء

```javascript
// Request
GET /api/reports/brokers/performance?year=2024&month=3
Authorization: Bearer <admin-token>

// Response
{
  "success": true,
  "topBrokers": [
    {
      "broker": { "name": "Ahmed Ali" },
      "totalDeals": 15,
      "brokerShare": 350000
    },
    {
      "broker": { "name": "Sara Mohammed" },
      "totalDeals": 12,
      "brokerShare": 300000
    }
  ]
}
```

---

### مثال 4: فلترة الصفقات لشهر معين

```javascript
// Request
GET /api/deals/filter?month=2024-03&status=closed
Authorization: Bearer <admin-token>

// Response
{
  "success": true,
  "filters": {
    "month": "2024-03",
    "status": "closed"
  },
  "deals": [ /* all closed deals in March */ ],
  "totals": {
    "totalDeals": 25,
    "totalDealValue": 50000000,
    "totalBrokerShare": 700000
  }
}
```

---

## 🔐 الصلاحيات

| Endpoint | Broker | Admin |
|----------|--------|-------|
| `/api/reports/broker/monthly` | ✅ (own data) | ✅ (any broker) |
| `/api/reports/broker/history` | ✅ (own data) | ✅ (any broker) |
| `/api/reports/broker/compare` | ✅ (own data) | ✅ (any broker) |
| `/api/reports/company/monthly` | ❌ | ✅ |
| `/api/reports/company/history` | ❌ | ✅ |
| `/api/reports/brokers/performance` | ❌ | ✅ |
| `/api/reports/dashboard` | ✅ | ✅ |
| `/api/deals/filter` | ✅ (own deals) | ✅ (all deals) |
| `/api/reports/months` | ✅ | ✅ |

---

## 📝 ملاحظات

1. **التواريخ:** جميع التواريخ بصيغة ISO 8601
2. **الأشهر:** تبدأ من 1 (يناير) إلى 12 (ديسمبر)
3. **العمولات:** محسوبة تلقائياً (70% وسيط، 30% شركة)
4. **الصلاحيات:** الوسطاء يرون بياناتهم فقط، الأدمن يرى كل شيء
5. **Default:** إذا لم تحدد شهر/سنة، يستخدم الشهر الحالي

---

## 🎯 حالات الاستخدام

### للوسطاء:
- ✅ معرفة العمولة الشهرية للمرتب
- ✅ مراجعة السجل التاريخي
- ✅ متابعة الأداء مقارنة بالشهر السابق

### للأدمن:
- ✅ حساب صافي الدخل الشهري
- ✅ مراجعة أداء جميع الوسطاء
- ✅ فلترة العمليات حسب الشهر
- ✅ إعداد تقارير الرواتب

---

**تم التحديث:** نوفمبر 2024  
**الإصدار:** 1.2.0

