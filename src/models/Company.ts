import { prisma } from '../database';
import { Company as PrismaCompany } from '@prisma/client';

export class Company {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    createdAt?: Date;
    updatedAt?: Date;

    constructor(data: Partial<PrismaCompany>) {
        this.id = data.id!;
        this.name = data.name!;
        this.email = data.email || null;
        this.phone = data.phone || null;
        this.address = data.address || null;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    static async create(companyData: { name: string; email?: string; phone?: string; address?: string }): Promise<Company> {
        const { name, email, phone, address } = companyData;

        const created = await prisma.company.create({
            data: {
                name,
                email,
                phone,
                address
            }
        });

        return new Company(created);
    }

    static async findById(id: number | string): Promise<Company | null> {
        const company = await prisma.company.findUnique({
            where: { id: typeof id === 'string' ? parseInt(id) : id }
        });

        return company ? new Company(company) : null;
    }

    static async findByName(name: string): Promise<Company | null> {
        const company = await prisma.company.findUnique({
            where: { name }
        });

        return company ? new Company(company) : null;
    }

    static async getAll(): Promise<Company[]> {
        const companies = await prisma.company.findMany({
            orderBy: { name: 'asc' }
        });

        return companies.map(company => new Company(company));
    }

    async update(updateData: Partial<PrismaCompany>): Promise<Company> {
        const updated = await prisma.company.update({
            where: { id: this.id },
            data: updateData
        });

        Object.assign(this, new Company(updated));
        return this;
    }

    async delete(): Promise<void> {
        await prisma.company.delete({
            where: { id: this.id }
        });
    }
}
