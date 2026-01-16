const { initDB } = require('../database/db');
const User = require('../models/User');
const Property = require('../models/Property');

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin Alrabie',
      email: 'admin@alrabie.ae',
      password: 'admin123',
      role: 'admin',
      phone: '+971501234567',
      whatsapp: '+971501234567'
    });

    console.log('✅ Admin user created:', adminUser.email);

    // Create sample broker (already approved)
    const brokerUser = await User.create({
      name: 'Sarah Al-Zahra',
      email: 'broker@alrabie.ae',
      password: 'broker123',
      role: 'broker',
      status: 'approved',
      phone: '+971501234568',
      whatsapp: '+971501234568'
    });

    console.log('✅ Broker user created:', brokerUser.email);

    // Create sample properties
    const sampleProperties = [
      {
        title: 'Luxury 3BR Villa in Ajman',
        description: 'Beautiful luxury villa with modern amenities, perfect for families. Located in a quiet residential area with easy access to main roads.',
        type: 'villa',
        purpose: 'sale',
        price: 1250000,
        area_sqft: 3200,
        bedrooms: 3,
        bathrooms: 3,
        emirate: 'ajman',
        location: 'Ajman Corniche',
        images: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1549187774-b4afc8a6f3df?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
        ],
        features: ['Swimming Pool', 'Garden', 'Parking', 'Security', 'Gym'],
        owner_id: adminUser.id
      },
      {
        title: 'Modern 2BR Apartment',
        description: 'Furnished modern apartment with sea view option. Perfect for young professionals or small families.',
        type: 'apartment',
        purpose: 'rent',
        price: 320000,
        area_sqft: 950,
        bedrooms: 2,
        bathrooms: 2,
        emirate: 'ajman',
        location: 'Ajman Marina',
        images: [
          'https://images.unsplash.com/photo-1549187774-b4afc8a6f3df?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
        ],
        features: ['Sea View', 'Furnished', 'Parking', 'Balcony'],
        owner_id: agentUser.id
      },
      {
        title: 'Commercial Office Space',
        description: 'Prime commercial office space in downtown Ajman. Ideal for businesses looking for a professional location.',
        type: 'commercial',
        purpose: 'rent',
        price: 850000,
        area_sqft: 2500,
        bedrooms: 0,
        bathrooms: 2,
        emirate: 'ajman',
        location: 'Ajman Downtown',
        images: [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80'
        ],
        features: ['Parking', 'Security', 'Elevator', 'Reception'],
        owner_id: adminUser.id
      },
      {
        title: 'Luxury Penthouse',
        description: 'Stunning penthouse with panoramic views of the city. Features include private terrace and premium finishes.',
        type: 'apartment',
        purpose: 'sale',
        price: 2100000,
        area_sqft: 2800,
        bedrooms: 4,
        bathrooms: 4,
        emirate: 'dubai',
        location: 'Dubai Marina',
        images: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
        ],
        features: ['Private Terrace', 'City View', 'Premium Finishes', 'Parking'],
        owner_id: agentUser.id
      },
      {
        title: 'Family Villa with Pool',
        description: 'Spacious family villa with private pool and garden. Perfect for large families seeking comfort and privacy.',
        type: 'villa',
        purpose: 'sale',
        price: 1800000,
        area_sqft: 4200,
        bedrooms: 5,
        bathrooms: 5,
        emirate: 'sharjah',
        location: 'Sharjah Al Majaz',
        images: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1549187774-b4afc8a6f3df?auto=format&fit=crop&w=1200&q=80'
        ],
        features: ['Private Pool', 'Garden', 'Maid Room', 'Parking', 'Security'],
        owner_id: adminUser.id
      },
      {
        title: 'Studio Apartment',
        description: 'Cozy studio apartment perfect for singles or couples. Fully furnished and ready to move in.',
        type: 'apartment',
        purpose: 'rent',
        price: 180000,
        area_sqft: 450,
        bedrooms: 1,
        bathrooms: 1,
        emirate: 'ajman',
        location: 'Ajman Al Nuaimiya',
        images: [
          'https://images.unsplash.com/photo-1549187774-b4afc8a6f3df?auto=format&fit=crop&w=1200&q=80'
        ],
        features: ['Furnished', 'Parking', 'Balcony'],
        owner_id: agentUser.id
      }
    ];

    for (const propData of sampleProperties) {
      const property = await Property.create(propData);
      console.log(`✅ Property created: ${property.title}`);
    }

    console.log('🎉 Database seeded successfully!');
    console.log('\n📋 Default Credentials:');
    console.log('Admin: admin@alrabie.ae / admin123');
    console.log('Agent: sarah@alrabie.ae / agent123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await initDB();
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}

module.exports = { seedDatabase };
