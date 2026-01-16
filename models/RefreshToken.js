const { prisma } = require('../database/db');

class RefreshToken {
  constructor(data) {
    this.id = data.id;
    this.token = data.token;
    this.userId = data.userId;
    this.revoked = data.revoked;
    this.createdAt = data.createdAt;
    this.expiresAt = data.expiresAt;
    this.replacedBy = data.replacedBy;
  }

  static async create({ token, userId, expiresAt }) {
    const created = await prisma.refreshToken.create({
      data: { token, userId: Number(userId), expiresAt }
    });
    return new RefreshToken(created);
  }

  static async findByToken(token) {
    const row = await prisma.refreshToken.findUnique({ where: { token } });
    return row ? new RefreshToken(row) : null;
  }

  static async revokeById(id) {
    await prisma.refreshToken.update({ where: { id: Number(id) }, data: { revoked: true } });
    return true;
  }

  static async rotate(oldTokenId, newToken, newExpiresAt) {
    // mark old token revoked and set replacedBy
    await prisma.refreshToken.update({ where: { id: Number(oldTokenId) }, data: { revoked: true, replacedBy: newToken } });
    // create new token record
    const created = await prisma.refreshToken.create({ data: { token: newToken, userId: (await prisma.refreshToken.findUnique({ where: { id: Number(oldTokenId) } })).userId, expiresAt: newExpiresAt } });
    return new RefreshToken(created);
  }

  static async deleteByToken(token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
    return true;
  }
}

module.exports = RefreshToken;
