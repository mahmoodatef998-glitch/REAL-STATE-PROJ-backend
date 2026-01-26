const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log('--- Companies ---');
    const companies = await prisma.company.findMany();
    console.log('Companies count:', companies.length);
    companies.forEach(c => console.log(`- [${c.id}] ${c.name}`));

    console.log('\n--- Properties ---');
    const properties = await prisma.property.findMany({
        include: { owner: true }
    });
    console.log('Properties count:', properties.length);
    properties.forEach(p => {
        console.log(`- [${p.id}] ${p.title} (Owner: ${p.owner?.name}, CompanyID: ${p.companyId})`);
    });

    console.log('\n--- Users ---');
    const users = await prisma.user.findMany();
    console.log('Users count:', users.length);
    users.forEach(u => console.log(`- [${u.id}] ${u.name} (Role: ${u.role}, CompanyID: ${u.companyId})`));

    process.exit(0);
}

check();
