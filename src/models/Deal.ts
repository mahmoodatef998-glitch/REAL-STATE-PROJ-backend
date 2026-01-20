import { prisma } from '../database';
import { Property, Company, User, Deal as PrismaDeal } from '@prisma/client';

export class Deal {
    id: number;
    property_id: number;
    broker_id: number;
    company_id: number;
    client_id: number | null;
    client_name: string;
    deal_type: string;
    deal_value: number;
    sale_price: number;
    commission_rate: number | null;
    commission_value: number | null;
    broker_share: number | null;
    company_share: number | null;
    commission_approved: boolean;
    date_closed: Date | null;
    status: string;
    created_at: Date;
    updated_at: Date;
    property?: Property;
    broker?: Partial<User>;
    company?: Company;
    client?: Partial<User>;

    constructor(data: any) {
        this.id = data.id;
        this.property_id = data.property_id || data.propertyId;
        this.broker_id = data.broker_id || data.brokerId;
        this.company_id = data.company_id || data.companyId;
        this.client_id = data.client_id || data.clientId;
        this.client_name = data.client_name || data.clientName;
        this.deal_type = data.deal_type || data.dealType || 'sale';
        this.deal_value = data.deal_value || data.dealValue || data.sale_price || data.salePrice;
        this.sale_price = data.sale_value || data.dealValue || data.sale_price || data.salePrice; // Backward compatibility
        this.commission_rate = data.commission_rate || data.commissionRate || null;
        this.commission_value = data.commission_value || data.commissionValue || null;
        this.broker_share = data.broker_share || data.brokerShare || null;
        this.company_share = data.company_share || data.companyShare || null;
        this.commission_approved = data.commission_approved || data.commissionApproved || false;
        this.date_closed = data.date_closed || data.dateClosed;
        this.status = data.status || 'open';
        this.created_at = data.created_at || data.createdAt;
        this.updated_at = data.updated_at || data.updatedAt;

        if (data.property) this.property = data.property;
        if (data.broker) this.broker = data.broker;
        if (data.company) this.company = data.company;
        if (data.client) this.client = data.client;
    }

    static async create(dealData: any): Promise<Deal> {
        const {
            propertyId,
            brokerId,
            companyId,
            clientId,
            clientName,
            dealType = 'sale',
            dealValue, // Primary field
            salePrice, // Backward compatibility (will use dealValue if not provided)
            commissionRate,
            commissionApproved = false,
            status = 'open',
            dateClosed = null
        } = dealData;

        // Use dealValue if provided, otherwise use salePrice for backward compatibility
        const finalDealValue = dealValue || salePrice || 0;

        // Calculate commission only if commission rate is provided
        let commissionValue = null;
        let brokerShare = null;
        let companyShare = null;

        if (commissionRate && parseFloat(commissionRate) > 0) {
            commissionValue = finalDealValue * parseFloat(commissionRate);
            const brokerRate = 0.7; // 70% broker, 30% company
            brokerShare = commissionValue * brokerRate;
            companyShare = commissionValue * (1 - brokerRate);
        }

        // Auto-set dateClosed if status is 'closed'
        const finalDateClosed = status === 'closed' ? (dateClosed || new Date()) : null;

        const created = await prisma.deal.create({
            data: {
                propertyId: Number(propertyId),
                brokerId: Number(brokerId),
                companyId: Number(companyId),
                clientId: clientId ? Number(clientId) : null,
                clientName,
                dealType,
                dealValue: Number(finalDealValue),
                salePrice: Number(finalDealValue), // Sync with dealValue for backward compatibility
                commissionRate: commissionRate ? parseFloat(commissionRate) : null,
                commissionValue,
                brokerShare,
                companyShare,
                commissionApproved,
                status,
                dateClosed: finalDateClosed
            },
            include: {
                property: true,
                broker: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                company: true
            }
        });

        return new Deal(created);
    }

    static async findById(id: number | string): Promise<Deal | null> {
        const deal = await prisma.deal.findUnique({
            where: { id: Number(id) },
            include: {
                property: true,
                broker: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                company: true
            }
        });

        return deal ? new Deal(deal) : null;
    }

    static async findByBroker(brokerId: number | string, options: any = {}): Promise<Deal[]> {
        const { limit, offset } = options;
        const deals = await prisma.deal.findMany({
            where: { brokerId: Number(brokerId) },
            include: {
                property: true,
                broker: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                company: true,
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });

        return deals.map(deal => new Deal(deal));
    }

    static async findByCompany(companyId: number | string, options: any = {}): Promise<Deal[]> {
        const { limit, offset } = options;
        const deals = await prisma.deal.findMany({
            where: { companyId: Number(companyId) },
            include: {
                property: true,
                broker: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                company: true,
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });

        return deals.map(deal => new Deal(deal));
    }

    static async getAll(options: any = {}): Promise<Deal[]> {
        const { limit, offset, companyId = null } = options;
        const where = companyId ? { companyId: Number(companyId) } : {};

        const deals = await prisma.deal.findMany({
            where,
            include: {
                property: true,
                broker: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                company: true,
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });

        return deals.map(deal => new Deal(deal));
    }

    // Find deals by client
    static async findByClient(clientId: number | string, options: any = {}): Promise<Deal[]> {
        const { limit, offset } = options;
        const deals = await prisma.deal.findMany({
            where: { clientId: Number(clientId) },
            include: {
                property: true,
                broker: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                company: true,
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });

        return deals.map(deal => new Deal(deal));
    }

    async update(updateData: any): Promise<Deal> {
        // If dealValue or commissionRate changes, recalculate commission and shares
        let finalUpdateData = { ...updateData };

        const existingDeal = await prisma.deal.findUnique({ where: { id: Number(this.id) } });
        if (!existingDeal) throw new Error('Deal not found');

        const finalDealValue = updateData.dealValue !== undefined
            ? updateData.dealValue
            : (updateData.salePrice !== undefined ? updateData.salePrice : existingDeal.dealValue || existingDeal.salePrice);
        const finalCommissionRate = updateData.commissionRate !== undefined
            ? updateData.commissionRate
            : existingDeal.commissionRate;

        // Recalculate commission and shares if dealValue or commissionRate changed
        if (finalCommissionRate && (updateData.dealValue !== undefined || updateData.salePrice !== undefined || updateData.commissionRate !== undefined)) {
            const commissionValue = finalDealValue * parseFloat(finalCommissionRate);
            const brokerRate = 0.7;
            finalUpdateData.commissionValue = commissionValue;
            finalUpdateData.brokerShare = commissionValue * brokerRate;
            finalUpdateData.companyShare = commissionValue * (1 - brokerRate);

            // Mark as approved if admin is setting/updating commission
            if (updateData.commissionRate !== undefined) {
                finalUpdateData.commissionApproved = true;
            }

            // Sync salePrice with dealValue for backward compatibility
            finalUpdateData.salePrice = finalDealValue;
            if (updateData.dealValue !== undefined) {
                finalUpdateData.dealValue = finalDealValue;
            }
        }

        // Auto-set dateClosed if status changes to 'closed'
        if (updateData.status === 'closed' && existingDeal.status !== 'closed') {
            finalUpdateData.dateClosed = updateData.dateClosed || new Date();
        }

        // Clear dateClosed if status changes from 'closed' to something else
        if (updateData.status && updateData.status !== 'closed' && existingDeal.status === 'closed') {
            finalUpdateData.dateClosed = null;
        }

        const updated = await prisma.deal.update({
            where: { id: Number(this.id) },
            data: finalUpdateData,
            include: {
                property: true,
                broker: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                company: true,
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        Object.assign(this, new Deal(updated));
        return this;
    }

    async delete(): Promise<void> {
        await prisma.deal.delete({
            where: { id: Number(this.id) }
        });
    }

    // Helper method to calculate totals
    static async getTotals(brokerId: number | null = null, companyId: number | null = null, statusFilter: string | null = null): Promise<any> {
        const where: any = {};
        if (brokerId) where.brokerId = Number(brokerId);
        if (companyId) where.companyId = Number(companyId);
        if (statusFilter) where.status = statusFilter;

        const deals = await prisma.deal.findMany({ where });

        const totals = {
            totalDeals: deals.length,
            totalDealValue: 0, // Using dealValue as primary
            totalSalePrice: 0, // Backward compatibility
            totalCommission: 0,
            totalCommissionValue: 0, // Using commissionValue field
            totalBrokerShare: 0,
            totalCompanyShare: 0,
            byStatus: {
                open: 0,
                closed: 0,
                cancelled: 0
            },
            byType: {
                sale: 0,
                rent: 0
            }
        };

        deals.forEach(deal => {
            const dealValue = parseFloat((deal.dealValue as any) || (deal.salePrice as any) || 0); // Prisma Decimal to number? Assuming number for now or need conversion
            const commissionRate = deal.commissionRate ? parseFloat(deal.commissionRate.toString()) : 0;
            const commissionValue = parseFloat((deal.commissionValue as any) || (dealValue * commissionRate).toString());

            totals.totalDealValue += dealValue;
            totals.totalSalePrice += dealValue; // Backward compatibility
            totals.totalCommission += commissionValue;
            totals.totalCommissionValue += commissionValue;
            totals.totalBrokerShare += parseFloat((deal.brokerShare as any) || 0);
            totals.totalCompanyShare += parseFloat((deal.companyShare as any) || 0);

            // Count by status
            if (deal.status === 'open') totals.byStatus.open++;
            else if (deal.status === 'closed') totals.byStatus.closed++;
            else if (deal.status === 'cancelled') totals.byStatus.cancelled++;

            // Count by type
            if (deal.dealType === 'sale') (totals.byType as any).sale++;
            else if (deal.dealType === 'rent') (totals.byType as any).rent++;
        });

        return totals;
    }
}
