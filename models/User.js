const bcrypt = require('bcryptjs');
const { prisma } = require('../database/db');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'client';
    this.status = data.status || 'approved';
    this.phone = data.phone;
    this.whatsapp = data.whatsapp;
    this.avatar = data.avatar;
    this.created_at = data.created_at || data.createdAt;
    this.updated_at = data.updated_at || data.updatedAt;
  }

  static async create(userData) {
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

  static async findByEmail(email) {
    const row = await prisma.user.findUnique({ where: { email } });
    return row ? new User(row) : null;
  }

  static async findById(id) {
    const row = await prisma.user.findUnique({ where: { id: Number(id) } });
    return row ? new User(row) : null;
  }

  static async getAll() {
    const rows = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(r => new User(r));
  }

  async update(updateData) {
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
    Object.assign(this, new User(updated));
    return this;
  }

  async updatePassword(newPassword) {
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: Number(this.id) },
      data: { password: hashed },
    });
    this.password = hashed;
    return true;
  }

  async delete() {
    await prisma.user.delete({ where: { id: Number(this.id) } });
    return true;
  }

  async validatePassword(password) {
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

module.exports = User;
