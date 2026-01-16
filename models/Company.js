const { prisma } = require('../database/db');

class Company {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.created_at = data.created_at || data.createdAt;
    this.updated_at = data.updated_at || data.updatedAt;
  }

  static async create(companyData) {
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

  static async findById(id) {
    const company = await prisma.company.findUnique({
      where: { id: parseInt(id) }
    });

    return company ? new Company(company) : null;
  }

  static async findByName(name) {
    const company = await prisma.company.findUnique({
      where: { name }
    });

    return company ? new Company(company) : null;
  }

  static async getAll() {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' }
    });

    return companies.map(company => new Company(company));
  }

  async update(updateData) {
    const updated = await prisma.company.update({
      where: { id: this.id },
      data: updateData
    });

    Object.assign(this, updated);
    return this;
  }

  async delete() {
    await prisma.company.delete({
      where: { id: this.id }
    });
  }
}

module.exports = Company;

