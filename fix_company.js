const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
    try {
        console.log('--- Checking for AL RABEI Company ---');
        let company = await prisma.company.findUnique({ where: { name: 'AL RABEI' } });

        if (!company) {
            console.log('Creating AL RABEI Company...');
            company = await prisma.company.create({
                data: {
                    name: 'AL RABEI',
                    email: 'info@alrabei.com',
                    phone: '+971500000000',
                    address: 'Dubai, UAE'
                }
            });
            console.log('✅ Company created with ID:', company.id);
        } else {
            console.log('✅ Company AL RABEI already exists with ID:', company.id);
        }

        console.log('\n--- Checking Plans ---');
        const plan = await prisma.plan.findFirst();
        if (!plan) {
            console.log('❌ No plans found! Please run seed first.');
            process.exit(1);
        }
        console.log('✅ Using plan:', plan.name);

        console.log('\n--- Checking Subscription ---');
        const sub = await prisma.subscription.findUnique({ where: { companyId: company.id } });
        if (!sub) {
            console.log('Creating subscription for company...');
            await prisma.subscription.create({
                data: {
                    companyId: company.id,
                    planId: plan.id,
                    status: 'active',
                    startDate: new Date()
                }
            });
            console.log('✅ Subscription created');
        } else {
            console.log('✅ Subscription already exists');
        }

        console.log('\n--- Updating Users ---');
        const users = await prisma.user.updateMany({
            where: { role: { in: ['admin', 'broker'] } },
            data: { companyId: company.id }
        });
        console.log(`✅ Updated ${users.count} users (Admins/Brokers) to belong to AL RABEI`);

        console.log('\n--- Updating Properties ---');
        const properties = await prisma.property.updateMany({
            where: { companyId: null },
            data: { companyId: company.id }
        });
        console.log(`✅ Updated ${properties.count} properties to belong to AL RABEI`);

        console.log('\n--- FINAL CHECK ---');
        const admin = await prisma.user.findFirst({ where: { email: 'admin@test.com' } });
        console.log(`Admin ${admin.name} - companyId: ${admin.companyId}`);

    } catch (error) {
        console.error('❌ Error during fix:', error);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

fix();
