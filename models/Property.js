const { prisma } = require('../database/db');

class Property {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.type = data.type;
    this.purpose = data.purpose;
    this.price = data.price;
    this.area_sqft = data.area_sqft || data.areaSqft;
    this.bedrooms = data.bedrooms;
    this.bathrooms = data.bathrooms;
    this.emirate = data.emirate;
    this.location = data.location;
    this.images = Array.isArray(data.images)
      ? data.images
      : (typeof data.images === 'string' && data.images ? safeParseJson(data.images) : []);
    this.features = Array.isArray(data.features)
      ? data.features
      : (typeof data.features === 'string' && data.features ? safeParseJson(data.features) : []);
    this.owner_id = data.owner_id || data.ownerId;
    this.status = data.status || 'active';
    this.created_at = data.created_at || data.createdAt;
    this.updated_at = data.updated_at || data.updatedAt;
    // Include owner info if available (from Prisma include)
    this.owner = data.owner || null;
  }
}

function safeParseJson(text) {
  try { return JSON.parse(text); } catch { return []; }
}

function serializeArray(value) {
  if (Array.isArray(value)) return JSON.stringify(value);
  return value || null;
}

Property.create = async function(propertyData) {
  const created = await prisma.property.create({
    data: {
      title: propertyData.title,
      description: propertyData.description || null,
      type: propertyData.type,
      purpose: propertyData.purpose,
      price: Number(propertyData.price),
      areaSqft: propertyData.area_sqft != null ? Number(propertyData.area_sqft) : null,
      bedrooms: propertyData.bedrooms != null ? Number(propertyData.bedrooms) : null,
      bathrooms: propertyData.bathrooms != null ? Number(propertyData.bathrooms) : null,
      emirate: propertyData.emirate,
      location: propertyData.location || null,
      images: serializeArray(propertyData.images),
      features: serializeArray(propertyData.features),
      ownerId: propertyData.owner_id != null ? Number(propertyData.owner_id) : null,
      status: 'active',
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          phone: true,
          whatsapp: true,
          email: true,
          role: true
        }
      }
    }
  });
  return new Property(created);
};

Property.findById = async function(id) {
  const row = await prisma.property.findUnique({ 
    where: { id: Number(id) },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          phone: true,
          whatsapp: true,
          email: true,
          role: true
        }
      }
    }
  });
  return row ? new Property(row) : null;
};

Property.getAll = async function(filters = {}) {
  const where = {};
  
  // Handle status filtering
  if (filters.status) {
    // Support multiple statuses separated by comma (e.g., "active,available")
    const statuses = filters.status.split(',').map(s => s.trim());
    if (statuses.length === 1) {
      where.status = statuses[0];
    } else if (statuses.length > 1) {
      where.status = { in: statuses };
    }
  } else {
    // Default: only show active properties for public listings
    where.status = 'active';
  }
  
  if (filters.type && filters.type !== 'all') where.type = filters.type;
  if (filters.purpose && filters.purpose !== 'all') where.purpose = filters.purpose;
  if (filters.emirate && filters.emirate !== 'all') where.emirate = filters.emirate;
  if (filters.price_min) where.price = { gte: Number(filters.price_min) };
  if (filters.price_max) where.price = { ...(where.price || {}), lte: Number(filters.price_max) };
  if (filters.search) {
    const term = filters.search;
    where.OR = [
      { title: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
      { location: { contains: term, mode: 'insensitive' } },
    ];
  }
  let orderBy = { createdAt: 'desc' };
  switch (filters.sort) {
    case 'price_low': orderBy = { price: 'asc' }; break;
    case 'price_high': orderBy = { price: 'desc' }; break;
    case 'area_large': orderBy = { areaSqft: 'desc' }; break;
    case 'area_small': orderBy = { areaSqft: 'asc' }; break;
    case 'oldest': orderBy = { createdAt: 'asc' }; break;
  }

  const rows = await prisma.property.findMany({
    where,
    orderBy,
    take: filters.limit ? Number(filters.limit) : undefined,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          phone: true,
          whatsapp: true,
          email: true,
          role: true
        }
      }
    }
  });
  return rows.map(r => new Property(r));
};

Property.getByOwner = async function(ownerId) {
  const rows = await prisma.property.findMany({
    where: { ownerId: Number(ownerId) },
    orderBy: { createdAt: 'desc' },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          phone: true,
          whatsapp: true,
          email: true,
          role: true
        }
      }
    }
  });
  return rows.map(r => new Property(r));
};

Property.prototype.update = async function(updateData) {
  const updated = await prisma.property.update({
    where: { id: Number(this.id) },
    data: {
      title: updateData.title !== undefined ? updateData.title : undefined,
      description: updateData.description !== undefined ? updateData.description : undefined,
      type: updateData.type !== undefined ? updateData.type : undefined,
      purpose: updateData.purpose !== undefined ? updateData.purpose : undefined,
      price: updateData.price !== undefined ? Number(updateData.price) : undefined,
      areaSqft: updateData.area_sqft !== undefined ? Number(updateData.area_sqft) : undefined,
      bedrooms: updateData.bedrooms !== undefined ? Number(updateData.bedrooms) : undefined,
      bathrooms: updateData.bathrooms !== undefined ? Number(updateData.bathrooms) : undefined,
      emirate: updateData.emirate !== undefined ? updateData.emirate : undefined,
      location: updateData.location !== undefined ? updateData.location : undefined,
      images: updateData.images !== undefined ? serializeArray(updateData.images) : undefined,
      features: updateData.features !== undefined ? serializeArray(updateData.features) : undefined,
      status: updateData.status !== undefined ? updateData.status : undefined,
      ownerId: updateData.owner_id !== undefined ? Number(updateData.owner_id) : undefined,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          phone: true,
          whatsapp: true,
          email: true,
          role: true
        }
      }
    }
  });
  Object.assign(this, new Property(updated));
  return this;
};

Property.prototype.delete = async function() {
  await prisma.property.update({
    where: { id: Number(this.id) },
    data: { status: 'deleted' },
  });
  this.status = 'deleted';
  return true;
};

Property.prototype.toJSON = function() {
  return {
    ...this,
    images: this.images,
    features: this.features,
    owner: this.owner || null, // Include owner info if available
  };
};

module.exports = Property;
