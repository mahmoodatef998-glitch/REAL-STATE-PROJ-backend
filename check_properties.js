const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const properties = await prisma.property.findMany();
    console.log('Properties count:', properties.length);
    properties.forEach(p => {
        console.log(`- [${p.id}] ${p.title} (${p.status})`);
    });
    process.exit(0);
}

check();
