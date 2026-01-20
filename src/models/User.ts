import bcrypt from 'bcryptjs';
import { prisma } from '../database';
import { User as PrismaUser } from '@prisma/client';

/**
 * User Model
 */
export class User {
    id: number;
    name: string;
    email: string;
    password?: string;
    role: string;
    status: string;
    phone?: string | null;
    whatsapp?: string | null;
    avatar?: string | null;
    createdAt?: Date;
    updatedAt?: Date;

    // Additional fields from data
    companyId?: number | null;

    constructor(data: Partial<PrismaUser>) {
        this.id = data.id!;
        this.name = data.name!;
        this.email = data.email!;
        this.password = data.password;
        this.role = data.role || 'client';
        this.status = data.status || 'approved';
        this.phone = data.phone;
        this.whatsapp = data.whatsapp;
        this.avatar = data.avatar;
        this.companyId = data.companyId;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    static async create(userData: any): Promise<User> {
        const { name, email, password, role, phone, whatsapp, status } = userData;

        const hashedPassword = await bcrypt.hash(password, 10);
        const userStatus = status || (role === 'broker' ? 'pending' : 'approved');

        const created = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                status: userStatus,
                phone: phone || null,
                whatsapp: whatsapp || null,
                avatar: null,
            },
        });

        return new User(created);
    }

    static async findByEmail(email: string): Promise<User | null> {
        const row = await prisma.user.findUnique({ where: { email } });
        return row ? new User(row) : null;
    }

    static async findById(id: number): Promise<User | null> {
        const row = await prisma.user.findUnique({ where: { id: Number(id) } });
        return row ? new User(row) : null;
    }

    static async getAll(): Promise<User[]> {
        const rows = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
        return rows.map(r => new User(r));
    }

    async update(updateData: any): Promise<User> {
        const updated = await prisma.user.update({
            where: { id: Number(this.id) },
            data: {
                name: updateData.name !== undefined ? updateData.name : undefined,
                phone: updateData.phone !== undefined ? updateData.phone : undefined,
                whatsapp: updateData.whatsapp !== undefined ? updateData.whatsapp : undefined,
                avatar: updateData.avatar !== undefined ? updateData.avatar : undefined,
                status: updateData.status !== undefined ? updateData.status : undefined,
                role: updateData.role !== undefined ? updateData.role : undefined,
            },
        });

        // Update local instance
        const updatedUser = new User(updated);
        Object.assign(this, updatedUser);

        return this;
    }

    async updatePassword(newPassword: string): Promise<boolean> {
        const hashed = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: Number(this.id) },
            data: { password: hashed },
        });
        this.password = hashed;
        return true;
    }

    async delete(): Promise<boolean> {
        await prisma.user.delete({ where: { id: Number(this.id) } });
        return true;
    }

    async validatePassword(password: string): Promise<boolean> {
        if (!this.password) {
            throw new Error('User password hash is missing');
        }
        if (!password) return false;
        return await bcrypt.compare(password, this.password);
    }

    toJSON() {
        const { password, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }
}
