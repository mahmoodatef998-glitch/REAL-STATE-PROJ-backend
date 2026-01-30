const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
    // ---------------------------------------------------------
    // ⬇️ عـدل بـيـانـاتـك الـحـقـيـقـيـة هـنـا ⬇️
    const myData = {
        name: "Admin Name",         // اسمك
        email: "admin@alrabei.com", // بريدك الإلكتروني
        password: "AdminPassword123!", // كلمة المرور القوية
        phone: "+971500000000"      // رقم هاتفك
    };
    // ---------------------------------------------------------

    try {
        console.log('--- Checking for Company ---');
        let company = await prisma.company.findFirst();
        if (!company) {
            console.log('No company found, creating AL RABEI...');
            company = await prisma.company.create({
                data: { name: 'AL RABEI', email: myData.email }
            });
        }

        console.log(`Checking if email ${myData.email} already exists...`);
        const existingUser = await prisma.user.findUnique({ where: { email: myData.email } });

        const hashedPassword = await bcrypt.hash(myData.password, 10);

        if (existingUser) {
            console.log('User already exists. Updating to ADMIN permissions...');
            await prisma.user.update({
                where: { email: myData.email },
                data: {
                    role: 'admin',
                    status: 'approved',
                    companyId: company.id,
                    password: hashedPassword // ستتغير كلمة المرور للتي اخترتها هنا
                }
            });
            console.log('✅ Account Updated successfully!');
        } else {
            console.log('Creating new Admin account...');
            await prisma.user.create({
                data: {
                    name: myData.name,
                    email: myData.email,
                    password: hashedPassword,
                    role: 'admin',
                    status: 'approved',
                    phone: myData.phone,
                    companyId: company.id
                }
            });
            console.log('✅ Admin Account Created successfully!');
        }

        console.log('\n--- LOGIN DETAILS ---');
        console.log(`Email: ${myData.email}`);
        console.log(`Password: (The password you set above)`);
        console.log('----------------------');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

createAdmin();
