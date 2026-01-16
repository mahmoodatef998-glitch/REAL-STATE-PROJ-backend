/**
 * Migration Script: SQLite to PostgreSQL
 * 
 * This script migrates data from SQLite to PostgreSQL
 * 
 * Prerequisites:
 * 1. PostgreSQL must be installed and running
 * 2. Database must be created
 * 3. Prisma migrations must be run first: npx prisma migrate dev
 * 
 * Usage:
 * node scripts/migrate-to-postgresql.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

const prisma = new PrismaClient();
const sqliteDbPath = path.join(__dirname, '../database/alrabie_real_estate.db');

// Open SQLite database
const sqliteDb = new sqlite3.Database(sqliteDbPath, (err) => {
  if (err) {
    console.error('❌ Error opening SQLite database:', err);
    process.exit(1);
  }
  console.log('✅ SQLite database opened');
});

// Helper function to query SQLite
const querySQLite = (query, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

async function migrateUsers() {
  console.log('\n📦 Migrating Users...');
  
  try {
    const users = await querySQLite('SELECT * FROM users');
    console.log(`   Found ${users.length} users`);
    
    for (const user of users) {
      try {
        await prisma.user.create({
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role || 'client',
            status: user.status || 'approved',
            phone: user.phone || null,
            whatsapp: user.whatsapp || null,
            avatar: user.avatar || null,
            createdAt: user.created_at ? new Date(user.created_at) : new Date(),
            updatedAt: user.updated_at ? new Date(user.updated_at) : new Date(),
          },
        });
        console.log(`   ✅ Migrated user: ${user.email}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️  User ${user.email} already exists, skipping...`);
        } else {
          console.error(`   ❌ Error migrating user ${user.email}:`, error.message);
        }
      }
    }
    
    console.log(`   ✅ Users migration completed: ${users.length} users`);
  } catch (error) {
    console.error('   ❌ Error in users migration:', error);
  }
}

async function migrateProperties() {
  console.log('\n📦 Migrating Properties...');
  
  try {
    const properties = await querySQLite('SELECT * FROM properties');
    console.log(`   Found ${properties.length} properties`);
    
    for (const property of properties) {
      try {
        await prisma.property.create({
          data: {
            id: property.id,
            title: property.title,
            description: property.description || null,
            type: property.type,
            purpose: property.purpose,
            price: property.price,
            areaSqft: property.area_sqft || null,
            bedrooms: property.bedrooms || null,
            bathrooms: property.bathrooms || null,
            emirate: property.emirate,
            location: property.location || null,
            images: property.images || null,
            features: property.features || null,
            ownerId: property.owner_id || null,
            status: property.status || 'active',
            createdAt: property.created_at ? new Date(property.created_at) : new Date(),
            updatedAt: property.updated_at ? new Date(property.updated_at) : new Date(),
          },
        });
        console.log(`   ✅ Migrated property: ${property.title}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️  Property ${property.id} already exists, skipping...`);
        } else {
          console.error(`   ❌ Error migrating property ${property.id}:`, error.message);
        }
      }
    }
    
    console.log(`   ✅ Properties migration completed: ${properties.length} properties`);
  } catch (error) {
    console.error('   ❌ Error in properties migration:', error);
  }
}

async function migrateLeads() {
  console.log('\n📦 Migrating Leads...');
  
  try {
    const leads = await querySQLite('SELECT * FROM leads');
    console.log(`   Found ${leads.length} leads`);
    
    for (const lead of leads) {
      try {
        await prisma.lead.create({
          data: {
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone || null,
            message: lead.message || null,
            propertyId: lead.property_id || null,
            status: lead.status || 'new',
            createdAt: lead.created_at ? new Date(lead.created_at) : new Date(),
            updatedAt: lead.updated_at ? new Date(lead.updated_at) : new Date(),
          },
        });
        console.log(`   ✅ Migrated lead: ${lead.name}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️  Lead ${lead.id} already exists, skipping...`);
        } else {
          console.error(`   ❌ Error migrating lead ${lead.id}:`, error.message);
        }
      }
    }
    
    console.log(`   ✅ Leads migration completed: ${leads.length} leads`);
  } catch (error) {
    console.error('   ❌ Error in leads migration:', error);
  }
}

async function migrateAgents() {
  console.log('\n📦 Migrating Agents...');
  
  try {
    const agents = await querySQLite('SELECT * FROM agents');
    console.log(`   Found ${agents.length} agents`);
    
    for (const agent of agents) {
      try {
        await prisma.agent.create({
          data: {
            id: agent.id,
            userId: agent.user_id,
            specialization: agent.specialization || null,
            experienceYears: agent.experience_years || null,
            bio: agent.bio || null,
            linkedinUrl: agent.linkedin_url || null,
            instagramUrl: agent.instagram_url || null,
            createdAt: agent.created_at ? new Date(agent.created_at) : new Date(),
            updatedAt: agent.updated_at ? new Date(agent.updated_at) : new Date(),
          },
        });
        console.log(`   ✅ Migrated agent: ${agent.id}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️  Agent ${agent.id} already exists, skipping...`);
        } else {
          console.error(`   ❌ Error migrating agent ${agent.id}:`, error.message);
        }
      }
    }
    
    console.log(`   ✅ Agents migration completed: ${agents.length} agents`);
  } catch (error) {
    console.error('   ❌ Error in agents migration:', error);
  }
}

async function main() {
  console.log('🚀 Starting SQLite to PostgreSQL Migration...\n');
  
  try {
    // Check PostgreSQL connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL\n');
    
    // Migrate all tables
    await migrateUsers();
    await migrateProperties();
    await migrateLeads();
    await migrateAgents();
    
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    sqliteDb.close((err) => {
      if (err) {
        console.error('Error closing SQLite database:', err);
      } else {
        console.log('\n✅ SQLite database closed');
      }
    });
  }
}

// Run migration
if (require.main === module) {
  main();
}

module.exports = { main };

