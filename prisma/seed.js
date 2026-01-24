const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed data insertion...\n');

  try {
    // 1️⃣ Delete old data
    console.log('🗑️  Deleting old data...');
    await prisma.lead.deleteMany();
    await prisma.property.deleteMany();
    await prisma.agent.deleteMany();
    await prisma.user.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.usage.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.plan.deleteMany();
    console.log('✅ Old data deleted\n');

    // 1.5️⃣ Create Plans
    console.log('📦 Creating Plans...');
    const plans = await prisma.plan.createMany({
      data: [
        {
          name: 'free',
          displayName: 'Free',
          description: 'Free plan to get started',
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
          description: 'Basic plan for small companies',
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
          description: 'Advanced plan for medium companies',
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
          description: 'Comprehensive plan for large companies',
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
    console.log(`✅ Created ${plans.count} plans\n`);

    // 2️⃣ Create Users
    console.log('👤 Creating users...');
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
        name: 'Ahmed Broker',
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
        name: 'Mohammed Client',
        email: 'client@test.com',
        password: hashedPassword,
        role: 'client',
        status: 'approved',
        phone: '+971503456789',
        whatsapp: '+971503456789',
      },
    });

    console.log('✅ Created 3 users\n');

    // 3️⃣ Create Properties
    console.log('🏠 Creating properties...');
    const properties = await prisma.property.createMany({
      data: [
        {
          title: 'Luxury Villa in UAE',
          description: 'Modern villa with contemporary design and swimming pool',
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
          features: JSON.stringify(['Pool', 'Garden', 'Garage', 'Modern Kitchen']),
          images: JSON.stringify(['/villa-1.svg']),
        },
        {
          title: 'Luxury Apartment in Dubai',
          description: 'Apartment with sea view',
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
          features: JSON.stringify(['Elevator', 'Parking', 'Gym']),
          images: JSON.stringify(['/villa-1.svg']),
        },
        {
          title: 'Commercial Office in Sharjah',
          description: 'Office in a prime location',
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
          features: JSON.stringify(['AC', 'Internet', 'Reception']),
          images: JSON.stringify(['/villa-1.svg']),
        },
        {
          title: 'Residential Land in Abu Dhabi',
          description: 'Land in a strategic location',
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
          features: JSON.stringify(['Easy Access', 'Close to Services']),
          images: JSON.stringify(['/villa-1.svg']),
        },
        {
          title: 'Commercial Shop in Al Ain',
          description: 'Shop at a special price',
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
          features: JSON.stringify(['Main Facade', 'Commercial Permit']),
          images: JSON.stringify(['/villa-1.svg']),
        },
        {
          title: 'Investment Apartment with 7% ROI',
          description: 'Furnished apartment for daily rent',
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
          features: JSON.stringify(['Furnished', 'Pizza Oven', 'Balcony']),
          images: JSON.stringify(['/villa-1.svg']),
        },
      ],
    });

    console.log(`✅ Created ${properties.count} properties\n`);

    // 4️⃣ Create Leads
    console.log('📞 Creating interested leads...');
    await prisma.lead.createMany({
      data: [
        {
          name: 'Ali Mohammed',
          email: 'ali@example.com',
          phone: '+971505555555',
          message: 'Looking for a luxury villa in Dubai',
          status: 'new',
          brokerId: broker.id,
        },
        {
          name: 'Fatima Ahmed',
          email: 'fatima@example.com',
          phone: '+971506666666',
          message: 'Interested in an apartment near the university',
          status: 'contacted',
          brokerId: broker.id,
        },
        {
          name: 'Omar Salem',
          email: 'omar@example.com',
          phone: '+971507777777',
          message: 'Looking for a commercial office',
          status: 'interested',
          brokerId: broker.id,
        },
        {
          name: 'Noor Khalifa',
          email: 'noor@example.com',
          phone: '+971508888888',
          message: 'Interested in residential land',
          status: 'new',
          brokerId: broker.id,
        },
      ],
    });

    console.log('✅ Created 4 leads\n');

    // 5️⃣ Create Agent
    console.log('👨‍💼 Creating real estate agent...');
    await prisma.agent.create({
      data: {
        userId: broker.id,
        specialization: 'Villas and Luxury Real Estate',
        experienceYears: 8,
        bio: 'Specialist in luxury real estate with 8 years of experience',
        linkedinUrl: 'https://linkedin.com/in/broker',
        instagramUrl: 'https://instagram.com/broker',
      },
    });

    console.log('✅ Created 1 real estate agent\n');

    // Final result
    console.log('═════════════════════════════════════════');
    console.log('✅ All seed data added successfully!');
    console.log('═════════════════════════════════════════\n');

    console.log('📊 Added Data:');
    console.log(`   👤 Users: 3 (Admin, Broker, Client)`);
    console.log(`   🏠 Properties: 6`);
    console.log(`   📞 Leads: 4`);
    console.log(`   👨‍💼 Agents: 1\n`);

    console.log('🔑 Login Details:');
    console.log(`   📧 Email: admin@test.com`);
    console.log(`   🔐 Password: Test123!@#\n`);

    console.log('Or use:\n');
    console.log(`   📧 Email: broker@test.com`);
    console.log(`   🔐 Password: Test123!@#\n`);

  } catch (error) {
    console.error('❌ Error occurred:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
