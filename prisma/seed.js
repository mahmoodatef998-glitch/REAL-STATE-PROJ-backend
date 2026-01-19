const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء إضافة البيانات التجريبية...\n');

  try {
    // 1️⃣ حذف البيانات القديمة
    console.log('🗑️  حذف البيانات القديمة...');
    await prisma.lead.deleteMany();
    await prisma.property.deleteMany();
    await prisma.agent.deleteMany();
    await prisma.user.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.usage.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.plan.deleteMany();
    console.log('✅ تم حذف البيانات القديمة\n');

    // 1.5️⃣ إنشاء الخطط (Plans)
    console.log('📦 إنشاء الخطط...');
    const plans = await prisma.plan.createMany({
      data: [
        {
          name: 'free',
          displayName: 'Free',
          description: 'خطة مجانية للبدء',
          price: 0,
          currency: 'AED',
          propertiesLimit: 10,
          brokersLimit: 1,
          leadsLimit: 50,
          dealsLimit: 10,
          features: JSON.stringify(['basic_properties', 'basic_leads']),
          isActive: true,
          sortOrder: 1
        },
        {
          name: 'basic',
          displayName: 'Basic',
          description: 'خطة أساسية للشركات الصغيرة',
          price: 299,
          currency: 'AED',
          propertiesLimit: 100,
          brokersLimit: 5,
          leadsLimit: 500,
          dealsLimit: 100,
          features: JSON.stringify(['unlimited_properties', 'advanced_leads', 'reports']),
          isActive: true,
          sortOrder: 2
        },
        {
          name: 'premium',
          displayName: 'Premium',
          description: 'خطة متقدمة للشركات المتوسطة',
          price: 799,
          currency: 'AED',
          propertiesLimit: 500,
          brokersLimit: 20,
          leadsLimit: 2000,
          dealsLimit: 500,
          features: JSON.stringify(['unlimited_properties', 'unlimited_leads', 'advanced_reports', 'api_access']),
          isActive: true,
          sortOrder: 3
        },
        {
          name: 'enterprise',
          displayName: 'Enterprise',
          description: 'خطة شاملة للشركات الكبيرة',
          price: 1999,
          currency: 'AED',
          propertiesLimit: null, // Unlimited
          brokersLimit: null,
          leadsLimit: null,
          dealsLimit: null,
          features: JSON.stringify(['everything', 'custom_integrations', 'dedicated_support']),
          isActive: true,
          sortOrder: 4
        }
      ]
    });
    console.log(`✅ تم إنشاء ${plans.count} خطط\n`);

    // 2️⃣ إنشاء مستخدمين
    console.log('👤 إنشاء مستخدمين...');
    const hashedPassword = await bcrypt.hash('Test123!@#', 10);

    const admin = await prisma.user.create({
      data: {
        name: 'Admin Test',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin',
        status: 'approved',
        phone: '+971501234567',
        whatsapp: '+971501234567',
      },
    });

    const broker = await prisma.user.create({
      data: {
        name: 'أحمد الوسيط',
        email: 'broker@test.com',
        password: hashedPassword,
        role: 'broker',
        status: 'approved',
        phone: '+971502345678',
        whatsapp: '+971502345678',
      },
    });

    const user = await prisma.user.create({
      data: {
        name: 'محمد العميل',
        email: 'client@test.com',
        password: hashedPassword,
        role: 'client',
        status: 'approved',
        phone: '+971503456789',
        whatsapp: '+971503456789',
      },
    });

    console.log('✅ تم إنشاء 3 مستخدمين\n');

    // 3️⃣ إنشاء عقارات
    console.log('🏠 إنشاء عقارات...');
    const properties = await prisma.property.createMany({
      data: [
        {
          title: 'فيلا فاخرة في الإمارات',
          description: 'فيلا حديثة بتصميم عصري مع حمام سباحة',
          type: 'villa',
          purpose: 'sale',
          price: 2500000,
          areaSqft: 5000,
          bedrooms: 4,
          bathrooms: 5,
          emirate: 'Dubai',
          location: 'Palm Jumeirah',
          status: 'active',
          ownerId: broker.id,
          features: JSON.stringify(['مسبح', 'حديقة', 'جراج', 'مطبخ حديث']),
          images: JSON.stringify(['/villa-1.svg']),
        },
        {
          title: 'شقة فاخرة في دبي',
          description: 'شقة بإطلالة على البحر',
          type: 'apartment',
          purpose: 'sale',
          price: 1200000,
          areaSqft: 2000,
          bedrooms: 3,
          bathrooms: 2,
          emirate: 'Dubai',
          location: 'Downtown Dubai',
          status: 'active',
          ownerId: broker.id,
          features: JSON.stringify(['مصعد', 'موقف سيارات', 'نادي رياضي']),
          images: JSON.stringify(['/villa-1.svg']),
        },
        {
          title: 'مكتب تجاري في الشارقة',
          description: 'مكتب بموقع متميز',
          type: 'office',
          purpose: 'sale',
          price: 800000,
          areaSqft: 1500,
          bedrooms: 0,
          bathrooms: 2,
          emirate: 'Sharjah',
          location: 'Al Qasba',
          status: 'active',
          ownerId: broker.id,
          features: JSON.stringify(['مكيفات', 'انترنت', 'استقبال']),
          images: JSON.stringify(['/villa-1.svg']),
        },
        {
          title: 'ارض سكنية في أبوظبي',
          description: 'ارض بموقع استراتيجي',
          type: 'land',
          purpose: 'sale',
          price: 1500000,
          areaSqft: 10000,
          bedrooms: 0,
          bathrooms: 0,
          emirate: 'Abu Dhabi',
          location: 'Al Reef',
          status: 'active',
          ownerId: broker.id,
          features: JSON.stringify(['سهل الوصول', 'قرب الخدمات']),
          images: JSON.stringify(['/villa-1.svg']),
        },
        {
          title: 'محل تجاري في العين',
          description: 'محل بسعر مميز',
          type: 'commercial',
          purpose: 'sale',
          price: 500000,
          areaSqft: 800,
          bedrooms: 0,
          bathrooms: 1,
          emirate: 'Al Ain',
          location: 'City Center',
          status: 'active',
          ownerId: broker.id,
          features: JSON.stringify(['واجهة رئيسية', 'تصريح تجاري']),
          images: JSON.stringify(['/villa-1.svg']),
        },
        {
          title: 'شقة استثمارية بعائد 7%',
          description: 'شقة مفروشة للايجار اليومي',
          type: 'apartment',
          purpose: 'rent',
          price: 650000,
          areaSqft: 1200,
          bedrooms: 2,
          bathrooms: 1,
          emirate: 'Dubai',
          location: 'Marina',
          status: 'active',
          ownerId: broker.id,
          features: JSON.stringify(['مفروشة', 'فرن بيتزا', 'شرفة']),
          images: JSON.stringify(['/villa-1.svg']),
        },
      ],
    });

    console.log(`✅ تم إنشاء ${properties.count} عقارات\n`);

    // 4️⃣ إنشاء عملاء (Leads)
    console.log('📞 إنشاء عملاء مهتمين...');
    await prisma.lead.createMany({
      data: [
        {
          name: 'علي محمد',
          email: 'ali@example.com',
          phone: '+971505555555',
          message: 'أبحث عن فيلا فاخرة في دبي',
          status: 'new',
          brokerId: broker.id,
        },
        {
          name: 'فاطمة أحمد',
          email: 'fatima@example.com',
          phone: '+971506666666',
          message: 'مهتمة بشقة قريبة من الجامعة',
          status: 'contacted',
          brokerId: broker.id,
        },
        {
          name: 'عمر سالم',
          email: 'omar@example.com',
          phone: '+971507777777',
          message: 'أبحث عن مكتب تجاري',
          status: 'interested',
          brokerId: broker.id,
        },
        {
          name: 'نور خليفة',
          email: 'noor@example.com',
          phone: '+971508888888',
          message: 'مهتمة بأرض سكنية',
          status: 'new',
          brokerId: broker.id,
        },
      ],
    });

    console.log('✅ تم إنشاء 4 عملاء\n');

    // 5️⃣ إنشاء وكيل (Agent)
    console.log('👨‍💼 إنشاء وكيل عقارات...');
    await prisma.agent.create({
      data: {
        userId: broker.id,
        specialization: 'الفلل والعقارات الفاخرة',
        experienceYears: 8,
        bio: 'متخصص في العقارات الفاخرة مع خبرة 8 سنوات',
        linkedinUrl: 'https://linkedin.com/in/broker',
        instagramUrl: 'https://instagram.com/broker',
      },
    });

    console.log('✅ تم إنشاء وكيل عقارات\n');

    // النتيجة النهائية
    console.log('═════════════════════════════════════════');
    console.log('✅ تمت إضافة جميع البيانات التجريبية بنجاح!');
    console.log('═════════════════════════════════════════\n');

    console.log('📊 البيانات المضافة:');
    console.log(`   👤 المستخدمون: 3 (Admin, Broker, Client)`);
    console.log(`   🏠 العقارات: 6`);
    console.log(`   📞 العملاء: 4`);
    console.log(`   👨‍💼 الوكلاء: 1\n`);

    console.log('🔑 بيانات الدخول:');
    console.log(`   📧 البريد: admin@test.com`);
    console.log(`   🔐 كلمة السر: Test123!@#\n`);

    console.log('أو استخدم:\n');
    console.log(`   📧 البريد: broker@test.com`);
    console.log(`   🔐 كلمة السر: Test123!@#\n`);

  } catch (error) {
    console.error('❌ حدث خطأ:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
