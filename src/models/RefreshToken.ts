import { prisma } from '../database';

export class RefreshToken {
    id: number;
    token: string;
    userId: number;
    revoked: boolean;
    createdAt: Date;
    expiresAt: Date | null;
    replacedBy: string | null;

    constructor(data: any) {
        this.id = data.id;
        this.token = data.token;
        this.userId = data.userId;
        this.revoked = data.revoked;
        this.createdAt = data.createdAt;
        this.expiresAt = data.expiresAt;
        this.replacedBy = data.replacedBy;
    }

    static async create({ token, userId, expiresAt }: { token: string; userId: number; expiresAt: Date }): Promise<RefreshToken> {
        const created = await prisma.refreshToken.create({
            data: { token, userId: Number(userId), expiresAt }
        });
        return new RefreshToken(created);
    }

    static async findByToken(token: string): Promise<RefreshToken | null> {
        const row = await prisma.refreshToken.findUnique({ where: { token } });
        return row ? new RefreshToken(row) : null;
    }

    static async revokeById(id: number): Promise<boolean> {
        await prisma.refreshToken.update({ where: { id: Number(id) }, data: { revoked: true } });
        return true;
    }

    static async rotate(oldTokenId: number, newToken: string, newExpiresAt: Date): Promise<RefreshToken> {
        // mark old token revoked and set replacedBy
        const oldToken = await prisma.refreshToken.findUnique({ where: { id: Number(oldTokenId) } });
        if (!oldToken) throw new Error('Refresh token not found');

        await prisma.refreshToken.update({ where: { id: Number(oldTokenId) }, data: { revoked: true, replacedBy: newToken } });

        // create new token record
        const created = await prisma.refreshToken.create({
            data: {
                token: newToken,
                userId: oldToken.userId,
                expiresAt: newExpiresAt
            }
        });

        return new RefreshToken(created);
    }

    static async deleteByToken(token: string): Promise<boolean> {
        await prisma.refreshToken.deleteMany({ where: { token } });
        return true;
    }
}
